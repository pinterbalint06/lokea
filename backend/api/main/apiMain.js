const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const auth = require('../utils/auth.js');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { body, check, validationResult } = require("express-validator");
const { sendWelcomeEmail, sendDeleteEmail, sendChangeEmail, sendPasswordChangeEmail } = require('../utils/mails.js')

//Endpoints - signup, login, signout
router.post("/signup",
    [
        body("username")
            .not().isEmail().withMessage("Felhasználónév nem lehet email cim!")
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage('A felhasználónév csak betűket, számokat, - vagy _ karaktert, és ékezetes betűket tartalmazhat.')
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 254 }).withMessage("Email max 254 karakter"),
        body("password")
            .isLength({ min: 8, max: 60 }).withMessage("Jelszó hossza 8-60 karakter")
            .matches(/\d/).withMessage("Kell benne szám")
            .matches(/[A-Z]/).withMessage("Kell benne nagybetű")
    ],
    async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    message: errors.array()
                });
            }
            else {
                const { username, email, password } = request.body;
                const hashedPassword = await bcrypt.hash(password, 10);
                let insert = await database.newUser(username, email, hashedPassword);
                if (insert.success) {
                    let userid = insert.insertId;
                    await database.addLog(userid, 'Sign up');
                    // await sendWelcomeEmail(email, username);
                    response.status(201).json({
                        success: true,
                        message: "Sikeres regisztráció!"
                    });
                }
                else {
                    response.status(409).json({
                        success: false,
                        message: "A felhasználó létezik!"
                    })
                }
            }
        } catch (error) {
            response.status(500).json({ error: error.message });
        }
    }
);

router.post("/login",
    [
        body("username")
            .isLength({ min: 1, max: 254 }).withMessage("Felhasználónév/email hossza nem megfelelő!"),
        body("password")
            .isLength({ min: 8, max: 60 }).withMessage("Jelszó hossza nem megfelelő!")
    ],
    async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    message: errors.array()
                });
            }
            else {
                const { username, password, remember } = request.body;
                let rows;
                if (validator.isEmail(username)) {
                    rows = await database.getUserByEmail(username);
                }
                else {
                    rows = await database.getUserByUsername(username);
                }
                if (rows.length === 0 || rows[0].deleted_at != null) {
                    response.status(401).json({ message: "Hibás email vagy jelszó" });
                }
                else {
                    let sPass = rows[0].password;
                    let egyezes = await bcrypt.compare(password, sPass);
                    if (!egyezes) {
                        response.status(401).json({ message: "Hibás email vagy jelszó" });
                    }
                    else {
                        let sesRole = rows[0].role;
                        if (remember) {
                            if (sesRole === 'ADMIN' || sesRole === 'LORD') {
                                request.session.cookie.maxAge = 15 * 60 * 1000;
                            }
                            else {
                                request.session.cookie.maxAge = 2 * 60 * 60 * 1000;
                            }
                        }
                        else {
                            request.session.cookie.expires = false;
                        }
                        request.session.userid = rows[0].user_id;
                        request.session.role = sesRole;
                        request.session.userLanguage = rows[0].language;
                        await database.addLog(rows[0].user_id, 'Login');
                        response.status(200).json({ message: "Sikeres bejelentkezés", role: sesRole, username: rows[0].username });
                    }
                }
            }
        } catch (error) {
            response.status(500).json({ message: "Hiba a bejelentkezés során!" });
        }
    });

router.post('/signout', (request, response) => {
    request.session.destroy(error => {
        if (error) {
            response.status(500).json({ success: false, error: error });
        }
        else {
            response.clearCookie('geo.sid');
            response.status(200).json({ success: true });
        }
    });
});

router.get('/loginRole', async (request, response) => {
    let login = false;
    try {
        if (!request.session.userid) {
            response.status(200).json({ login })
        }
        else {
            login = true;
            let user = await database.getUserNameProfile(request.session.userid);
            if (request.session.role == "ADMIN" || request.session.role == "LORD") {
                response.status(200).json({ login, adminLink: "/admin", user: user[0] });
            }
            else {
                response.status(200).json({ login, user: user[0] });
            }
        }
    } catch (error) {
        response.status(500).json({ login, error: error.message });
    }
});

router.get('/getLanguage', (request, response) => {
    try {
        if (!request.session) {
            throw new Error();
            console.error("Session is missing");
        }
        let language = request.session.userLanguage;
        response.status(200).json({ language: request.session.userLanguage });
    } catch (error) {
        response.status(500).json({ error: request.t('admin:adminApi.language_fetch_error') });
    }

});

module.exports = router;