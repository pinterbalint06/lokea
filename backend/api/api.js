const express = require('express');
const router = express.Router();
const database = require('#sql/database.js');
const auth = require('#utils/auth.js')
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { body, check, validationResult } = require("express-validator");
const sharp = require('sharp');
const { sendWelcomeEmail, sendDeleteEmail, sendChangeEmail, sendPasswordChangeEmail } = require('../utils/mails.js')

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (request, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
            callback(null, true);
        } else {
            request.fileValidationError = 'Érvénytelen fájltípus! Csak képeket tölthetsz fel.';
            callback(null, false); // Elutasítja a fájlt mentés nélkül
        }
    }
});

//!ENDPOINTS
//test
router.get('/test', (request, response) => {
    response.status(200).json({
        message: 'Ez a végpont működik.'
    });
});

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

router.post('/signout', auth.checkAuth, (request, response) => {
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
})

//Endpoints - settings

router.get('/getUserData', auth.checkAuth, async (request, response) => {
    try {
        let users = await database.getUser(request.session.userid);
        let userData = users[0];
        if (userData) {
            if (userData.role && userData.role !== request.session.role) {
                request.session.role = userData.role;
            } else if (!userData.role) {
                userData.role = request.session.role;
            }
        }
        response.status(200).json({ users: userData });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
})

router.put('/updateUser', auth.checkAuth,
    [
        body("username")
            .optional({ nullable: true })
            .not().isEmail().withMessage("Felhasználónév nem lehet email cim!")
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage('A felhasználónév csak betűket, számokat, - vagy _ karaktert, és ékezetes betűket tartalmazhat.')
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .optional({ nullable: true })
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 254 }).withMessage("Email max 254 karakter!"),
        body("language")
            .optional({ values: "null" })
            .isString().withMessage("A nyelv formátuma érvénytelen!")
            .isIn(['en', 'hu']).withMessage("A választható nyelvek: 'en' vagy 'hu'!"),

        body("darkmode")
            .optional({ values: "null" })
            .isBoolean().withMessage("A sötét mód értéke csak logikai lehet!")
    ], async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    error: errors.array()
                });
            }
            else {
                let { username, email, language, darkmode } = request.body;
                let result = await database.updateUser(request.session.userid, username, email, language, darkmode);
                if (result == 1) {
                    if (language) request.session.userLanguage = language;
                    await database.addLog(request.session.userid, 'User update');
                    response.status(200).json({ message: "Sikeres frissités!" });
                    // await sendChangeEmail(email, username);
                }
                else {
                    response.status(200).json({ message: "Nem történt módositás!" });
                }
            }

        } catch (error) {
            response.status(500).json({ error: error.message });
        }
    })

router.put("/updatePassword", auth.checkAuth,
    [
        body("oldPass")
            .isLength({ min: 8, max: 60 }).withMessage("A régi jelszó hossza nem 8-60 karakter!"),
        body("newPass")
            .isLength({ min: 8, max: 60 }).withMessage("Az új jelszó hossza nem 8-60 karakter!")
            .matches(/\d/).withMessage("A jelszóba kell minimum 1 szám!")
            .matches(/[A-Z]/).withMessage("A jelszóba kell minimum 1 nagybetű!")
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
                let { oldPass, newPass } = request.body;
                let { email, username } = await database.updatePassword(request.session.userid, oldPass, newPass);
                await database.addLog(request.session.userid, 'Password update');
                // await sendPasswordChangeEmail(email, username);
                response.status(200).json({ message: "Sikeres frissités!" });
            }

        } catch (error) {
            response.status(500).json({ error: error.message });
        }
    })

router.delete("/inactiveUser", auth.checkAuth, async (request, response) => {
    try {
        let userid = request.session.userid;
        let { email, username } = await database.userToInactive(userid);
        request.session.destroy(async (error) => {
            if (error) {
                response.status(500).json({ success: false, error: error });
            }
            else {
                await database.addLog(userid, 'User delete');
                response.clearCookie('geo.sid');
                // await sendDeleteEmail(email, username);
                response.status(200).json({ success: true, message: "Sikeres törlés!" });
            }
        });

    } catch (error) {
        response.status(500).json({ error: error.message });
    }
})

router.put('/updateProfilePic', auth.checkAuth, upload.single('profilePic'), async (request, response) => {
    let originalFile;
    let newFilePath;
    try {
        if (request.fileValidationError) {
            response.status(400).json({ message: request.fileValidationError });
        }
        else {
            if (!request.file) {
                response.status(400).json({ message: "Nincs kép!" });
            }
            else {
                originalFile = request.file.path;
                let newFileName = `processed-${Date.now()}.webp`;
                newFilePath = path.join('uploads', newFileName);

                //Kép tömöritése
                sharp.cache(false);
                const metadata = await sharp(originalFile)
                    .rotate()
                    .resize(400, 400, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .toFormat('webp')
                    .toFile(newFilePath);

                let { width, height } = metadata;
                let finalUrl = `${newFileName}`;
                let lastPfp = await database.uploadProfilePic(finalUrl, width, height, request.session.userid);

                await fs.unlink(originalFile).catch(() => { });

                if (lastPfp) {
                    let lastPfpPath = path.join(__dirname, '..', 'uploads', lastPfp);
                    await fs.unlink(lastPfpPath).catch((err) => {
                        console.error("Régi kép törlése sikertelen:", err.path);
                    });
                }
                await database.addLog(request.session.userid, 'Profile picture update');
                response.status(201).json({ success: true, message: "Profilkép frissítve!" });
            }
        }
    } catch (error) {
        if (originalFile) {
            await fs.unlink(originalFile).catch(() => { });
        }
        if (newFilePath) {
            await fs.unlink(newFilePath).catch(() => { });
        }
        response.status(500).json({ error: error.message });
    }
})

router.delete('/deleteProfilePic', auth.checkAuth, async (request, response) => {
    try {
        let lastPfp = await database.deleteProfilePic(request.session.userid);
        if (!lastPfp) {
            response.status(200).json({ success: true, message: "A profilkép már alapértelmezett volt." });
        }
        else {
            let lastPfpPath = path.join(__dirname, '..', 'uploads', lastPfp);
            try {
                await fs.unlink(lastPfpPath);
            } catch (error) {
                console.log("a kép nincs a szerveren!" + error);
            }
            await database.addLog(request.session.userid, 'Profile picture delete');
            response.status(201).json({ success: true, message: "Profilkép törölve!" });
        }
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
})

router.get('/getProfilePic', auth.checkAuth,
    [
        check("route")
            .matches(/^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+$/).withMessage('Érvénytelen fájl név!')
    ], (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    error: errors.array()
                });
            }
            else {
                let pfproute = request.query.route;
                const root = path.join(__dirname, '..', 'uploads');

                response.sendFile(pfproute, { root: root }, (err) => {
                    if (err) {
                        console.log("Hiba a fájl küldéskor:", err);
                        response.status(err.status || 404).send();
                    }
                });
            }
        } catch (error) {
            response.status(500).json({ message: error.message })
        }
    })

module.exports = router;
