const express = require('express');
const router = express.Router();
const database = require('#sql/main/databaseMain.js');
const databaseLogs = require('#sql/admin/databaseLogs.js');
const bcrypt = require('bcrypt');
const auth = require('#middlewares/auth.js')
const validator = require('validator');
const { body, validationResult } = require("express-validator");
const { sendWelcomeEmail } = require('#utils/mails.js');
const { validate } = require('#utils/validate.js');

//Endpoints - signup, login, signout
router.post("/auth/register",
    [
        body("username")
            .not().isEmail().withMessage((value, { req }) => req.t('main:apiMain.signup.validation_username_no_email'))
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage((value, { req }) => req.t('main:apiMain.signup.validation_username_invalid_chars'))
            .isLength({ min: 1, max: 20 }).withMessage((value, { req }) => req.t('main:apiMain.signup.validation_username_length')),
        body("email")
            .isEmail().withMessage((value, { req }) => req.t('main:apiMain.signup.validation_email_format'))
            .isLength({ min: 5, max: 254 }).withMessage((value, { req }) => req.t('main:apiMain.signup.validation_email_length')),
        body("password")
            .isLength({ min: 8, max: 60 }).withMessage((value, { req }) => req.t('main:apiMain.signup.validation_password_length'))
            .matches(/\d/).withMessage((value, { req }) => req.t('main:apiMain.signup.validation_password_digit'))
            .matches(/[A-Z]/).withMessage((value, { req }) => req.t('main:apiMain.signup.validation_password_uppercase'))
    ], validate,
    async (request, response) => {
        try {
            const { username, email, password } = request.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            let insert = await database.newUser(username, email, hashedPassword);
            if (insert.success) {
                let userid = insert.insertId;
                await databaseLogs.addLog(userid, 'Sign up');
                sendWelcomeEmail(email, username);
                response.status(201).json({
                    success: true,
                    message: request.t('main:apiMain.signup.success')
                });
            }
            else {
                response.status(409).json({
                    success: false,
                    error: request.t('main:apiMain.signup.user_exists')
                })
            }
        } catch (error) {
            response.status(500).json({ error: request.t('main:apiMain.signup.error') });
        }
    }
);

router.post("/auth/login",
    [
        body("username")
            .isLength({ min: 1, max: 254 }).withMessage((value, { req }) => req.t('main:apiMain.login.validation_username_length')),
        body("password")
            .isLength({ min: 8, max: 60 }).withMessage((value, { req }) => req.t('main:apiMain.login.validation_password_length'))
    ], validate,
    async (request, response) => {
        try {
            const { username, password, remember } = request.body;
            let rows;
            if (validator.isEmail(username)) {
                rows = await database.getUserByEmail(username);
            }
            else {
                rows = await database.getUserByUsername(username);
            }
            if (rows.length === 0 || rows[0].deleted_at != null) {
                response.status(401).json({ error: request.t('main:apiMain.login.invalid_credentials') });
            }
            else {
                let sPass = rows[0].password;
                let egyezes = await bcrypt.compare(password, sPass);
                if (!egyezes) {
                    response.status(401).json({ error: request.t('main:apiMain.login.invalid_credentials') });
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
                    await databaseLogs.addLog(rows[0].user_id, 'Login');
                    response.status(200).json({ message: request.t('main:apiMain.login.success'), role: sesRole, username: rows[0].username });
                }
            }
        } catch (error) {
            response.status(500).json({ error: request.t('main:apiMain.login.error') });
        }
    });

router.delete('/auth/logout', auth.checkAuth, (request, response) => {
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

router.get('/auth/status', async (request, response) => {
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
        response.status(500).json({ login, error: request.t('main:apiMain.status.error') });
    }
})

router.get('/users/language', auth.checkAuth, (request, response) => {
    try {
        if (!request.session.userLanguage) {
            console.error("Session-language is missing");
            throw new Error();
        }
        let language = request.session.userLanguage;
        response.status(200).json({ language: request.session.userLanguage });
    } catch (error) {
        response.status(500).json({ error: request.t('main:apiMain.language_fetch_error') });
    }
});

module.exports = router;
