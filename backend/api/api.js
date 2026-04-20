const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const auth = require('../auth.js')
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { body, check, validationResult } = require("express-validator");
const sharp = require('sharp');
const { sendWelcomeEmail, sendDeleteEmail, sendChangeEmail, sendPasswordChangeEmail } = require('../mails.js')

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
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
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
                    message: "Helytelen karakter(ek) a felhasználónévben/emailben/jelszóban!",
                    error_code: 400
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
                    response.status(500).json({
                        success: false,
                        message: insert.error
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
                    message: errors.array().map(err => err.msg).join('<br>')
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
                            if (sesRole.role === 'ADMIN') {
                                request.session.cookie.maxAge = 15 * 60 * 1000;
                            }
                            else {
                                request.session.cookie.maxAge = 2 * 60 * 60 * 1000;
                            }
                        }
                        else {
                            request.session.cookie.expires = false;
                        }
                        console.log(rows[0]);
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
    try {
        let login = false;
        if (!request.session.userid) {
            response.status(200).json({ login })
        }
        else {
            login = true;
            let user = await database.getUserNameProfile(request.session.userid);
            if (request.session.role == "ADMIN") {
                response.status(200).json({ login, adminLink: "/admin", user });
            }
            else {
                response.status(200).json({ login, user });
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
        response.status(200).json({ users: users[0] });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
})

router.put('/updateUser', auth.checkAuth,
    [
        body("username")
            .optional({ values: "null" })
            .not().isEmail().withMessage("Felhasználónév nem lehet email cim!")
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage('A felhasználónév csak betűket, számokat, - vagy _ karaktert, és ékezetes betűket tartalmazhat.')
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .optional({ values: "null" })
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 250 }).withMessage("Email max 250 karakter!"),
        body("is_2fa")
            .optional({ values: "null" })
            .isBoolean().withMessage("A 2FA értéke csak logikai (true/false) lehet!"),

        body("language")
            .optional({ values: "null" })
            .isString().withMessage("A nyelv formátuma érvénytelen!")
            .isLength({ min: 2, max: 5 }).withMessage("A nyelv kódja 2-5 karakter lehet!"),

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
                let { username, email, is_2fa, language, darkmode } = request.body;
                let result = await database.updateUser(request.session.userid, username, email, is_2fa, language, darkmode);
                if (result == 1) {
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
            .isLength({ min: 8, max: 50 }).withMessage("A régi jelszó hossza nem 8-50 karakter!"),
        body("newPass")
            .isLength({ min: 8, max: 50 }).withMessage("Az új jelszó hossza nem 8-50 karakter!")
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
                await database.updatePassword(request.session.userid, oldPass, newPass); // atiras, hogy visszaadja az emailt, username-t az emailhez
                await database.addLog(request.session.userid, 'Password update');
                // await sendPasswordChangeEmail(email, username);
                response.status(200).json({ message: "Sikeres frissités!" });
            }

        } catch (error) {
            response.status(500).json({ error: error.message });
        }
    })

router.post("/inactiveUser", auth.checkAuth, async (request, response) => {
    try {
        await database.userToInactive(request.session.userid);
        request.session.destroy(error => async function () {
            if (error) {
                response.status(500).json({ success: false, error: error });
            }
            else {
                await database.addLog(request.session.userid, 'User delete');
                response.clearCookie('geo.sid');
                // await sendDeleteEmail(email, username);
                response.status(200).json({ success: true, message: "Sikeres törlés!" });
            }
        });

    } catch (error) {
        response.status(500).json({ error: error.message });
    }
})

router.post('/updateProfilePic', auth.checkAuth, upload.single('profilePic'), async (request, response) => {
    let originalFile;
    let newFilePath;
    try {
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
                let lastPfpPath = path.join(__dirname, '..', lastPfp);
                await fs.unlink(lastPfpPath).catch(() => { });
            }
            await database.addLog(request.session.userid, 'Profile picture update');
            response.status(201).json({ success: true, message: "Profilkép frissítve!" });
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
            console.log(lastPfpPath);
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


//játékhoz szükséges api-k
router.get('/game_maps', async (request, response) => {
    try {
        const sort = String(request.query.sort || 'created').toLowerCase();
        const offset = parseInt(request.query.offset) || 0;
        const validSorts = ['created', 'rating', 'plays', 'favorites'];
        if (!validSorts.includes(sort)) {
            return response.status(400).json({
                success: false,
                message: 'Érvénytelen rendezés. Használható: created, rating, plays, favorites'
            });
        }

        const user_id = request.session?.userid || 1; //TODO: teszt user törlése session stabilizálás után
        const palyak = await database.getGameMaps(sort, user_id, offset);

        response.status(200).json({
            success: true,
            results: palyak
        });
    } catch (error) {
        response.status(500).json({
            success: false,
            message: error
        });
    }
});

router.get('/get_cover_image/:cover_image_id', async (request, response) => {

    try {
        let uploads = path.join(__dirname, '../uploads');
        let fileRes;
        if (!request.params || !request.params.cover_image_id) {
            fileRes = 'cover_images/image-not-found.jpg';
        } else {
            let filePath = await database.getImagePath(request.params.cover_image_id);
            if (!filePath) {
                fileRes = 'cover_images/image-not-found.jpg';
            } else {
                fileRes = filePath;
            }
        }
        let res = path.join(uploads, fileRes);
        response.sendFile(res);
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});
module.exports = router;
