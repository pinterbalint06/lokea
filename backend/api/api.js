const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
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
        .isLength({ max: 20}).withMessage("Felhasználónév hossza nem megfelelő!"),
    body("email")
        .isEmail().withMessage("Hibás email formátum")
        .isLength({ max: 250 }).withMessage("Email max 250 karakter"),

    body("password")
        .isLength({ min: 8, max: 50 }).withMessage("Jelszó hossza 8-50")
        .matches(/\d/).withMessage("Kell benne szám")
        .matches(/[A-Z]/).withMessage("Kell benne nagybetű")
    ],
    async (request, response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ 
                success: false,
                error: errors.array() 
            });
    }

    const { username, email, password } = request.body;

    // Jelszó hash
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );
    } 
    catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return response.status(400).json({
                error: "A felhasználónév vagy email már foglalt!"
            });
        }
        else {
            return response.status(500).json({ error: "Hiba az adatbázis művelet során!" });
        }
    }
    

    response.status(201).json({ 
        success: true,
        message: "Sikeres regisztráció" 
    });
  }
);

module.exports = router;
