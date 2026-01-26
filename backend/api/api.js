const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { body, validationResult } = require("express-validator");
const mysql = require('mysql2/promise');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "bigprojekt_db",
    waitForConnections: true,
    connectionLimit: 10
});

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({ storage });

//!Endpoints:
//?GET /api/test
router.get('/test', (request, response) => {
    response.status(200).json({
        message: 'Ez a végpont működik.'
    });
});

//?GET /api/testsql
router.get('/testsql', async (request, response) => {
    try {
        const selectall = await database.selectall();
        response.status(200).json({
            message: 'Ez a végpont működik.',
            results: selectall
        });
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

router.post("/signup",
    [
        body("username")
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 250 }).withMessage("Email max 250 karakter"),

        body("password")
            .isLength({ min: 8, max: 50 }).withMessage("Jelszó hossza 8-50")
            .matches(/\d/).withMessage("Kell benne szám")
            .matches(/[A-Z]/).withMessage("Kell benne nagybetű")
    ],
    async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    error: errors.array()
                });
            }
            else {
                const { username, email, password } = request.body;
                const hashedPassword = await bcrypt.hash(password, 10);
                await pool.query(
                    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                    [username, email, hashedPassword]
                );
                response.status(201).json({
                    success: true,
                    message: "Sikeres regisztráció"
                });
            }
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                response.status(400).json({
                    error: "A felhasználónév vagy email már foglalt!"
                });
            }
            else {
                response.status(500).json({ error: "Hiba az adatbázis művelet során!" });
            }
        }
    }
);

router.post("/login",
    [
        body("username")
            .isLength({ min: 1, max: 250 }).withMessage("Felhasználónév/email hossza nem megfelelő!"),
        body("password")
            .isLength({ min: 8, max: 50 }).withMessage("Jelszó hossza nem megfelelő!")
    ],
    async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    error: errors.array()
                });
            }
            else {
                const { username, password } = request.body;
                let rows;
                if (validator.isEmail(username)) {
                    [rows] = await pool.query(
                        `SELECT users.password, users.userid, users.role FROM users WHERE users.email = ?`,
                        [username]
                    );
                }
                else {
                    [rows] = await pool.query(
                        `SELECT users.password, users.userid, users.role FROM users WHERE users.username = ?`,
                        [username]
                    );
                }
                if (!rows || rows.length === 0) {
                    return response.status(401).json({ message: "Hibás email vagy jelszó" });
                }
                else {
                    let sPass = rows[0].password;
                    let egyezes = await bcrypt.compare(password, sPass);
                    if (!egyezes) {
                        return response.status(401).json({ message: "Hibás email vagy jelszó" });
                    }
                    else {
                        let sesRole = rows[0].role;

                        if (sesRole.role === 'ADMIN') {
                            request.session.cookie.maxAge = 15 * 60 * 1000;
                        }
                        else {
                            request.session.cookie.maxAge = 2 * 60 * 60 * 1000;
                        }

                        request.session.userid = rows[0].userid;
                        request.session.role = sesRole;
                        response.status(200).json({ message: "Sikeres bejelentkezés", role: sesRole });
                    }
                }
            }
        } catch (error) {
            response.status(500).json({ message: error })
        }
    });

router.post('/kijelentkezes', (request, response) => {
    request.session.destroy(error => { 
        if (error) {
            response.status(500).json({success: false, error: error});
        }
        else {
            response.clearCookie('geo.sid');
            response.status(200).json({success: true});
        }
    });
});

module.exports = router;
