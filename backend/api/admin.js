const express = require('express');
const router = express.Router();
const database = require('#sql/database.js');
const auth = require('#utils/auth.js')
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { body, validationResult } = require("express-validator");
const sharp = require('sharp');

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

//Endpoints - admin

router.post("/signupFromAdmin", auth.checkAuth, auth.checkRole("ADMIN"),
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
            .matches(/[A-Z]/).withMessage("Kell benne nagybetű"),
        body("is_2fa")
            .isBoolean().withMessage("Nem kapott értéket a kétlépcsős azonosítás!")
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
                const { username, email, password, role, is_2fa } = request.body;
                const hashedPassword = await bcrypt.hash(password, 10);
                let insert = await database.newUserFromAdmin(username, email, hashedPassword, role, is_2fa);
                if (insert.success) {
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
            response.status(500).json({ error: "Hiba az adatbázis művelet során!" });
        }
    }
);

router.get('/users', auth.checkAuth, auth.checkRole("ADMIN"), async (request, response) => {
    try {
        let users = await database.getUsers();
        response.status(200).json({ message: "Sikeres lekérés", users: users });
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.get('/user', auth.checkAuth, auth.checkRole("ADMIN"), async (request, response) => {
    try {
        let params = request.query.id;
        let users = await database.getUser(params);
        response.status(200).json({ message: "Sikeres lekérés", users: users });
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.post('/sortedUsers', auth.checkAuth, auth.checkRole("ADMIN"), async (request, response) => {
    try {
        let { mireKeresek, mit, status, adminChecked, modChecked, userChecked } = request.body;
        let users = await database.sortedUsers(mireKeresek, mit, status, adminChecked, modChecked, userChecked);
        response.status(200).json({ message: "Sikeres lekérés", users: users });
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.post('/updateUser', auth.checkAuth, auth.checkRole("ADMIN"),
    [
        body("username")
            .not().isEmail().withMessage("Felhasználónév nem lehet email cim!")
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage('A felhasználónév csak betűket, számokat, - vagy _ karaktert, és ékezetes betűket tartalmazhat.')
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 254 }).withMessage("Email max 254 karakter!"),
        body("deleted")
            .custom(value => value === true).withMessage("Inaktiv felhasználót nem frissithetsz!")
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
                let { user_id, username, email, role, is_2fa } = request.body;
                if (role == "ADMIN" && request.session.role != "LORD") {
                    response.status(403).json({ message: "Nincs jogosultságod ehhez!" });
                }
                else {
                    let success = await database.updateUser(user_id, username, email, role, is_2fa);
                    if (success == 1) {
                        response.status(204).json({ message: "Sikeres felhasználófrissités!" });
                    }
                    else {
                        response.status(404).json({ message: "Nincs ilyen felhasználó!" });
                    }
                }
            }
        } catch (error) {
            response.status(500).json({ error: error });
        }
    })

router.post('/userToInactive', auth.checkAuth, auth.checkRole("ADMIN"),
    [
        body("role")
            .not().matches("ADMIN").withMessage("Nem frissithetsz admin-t!"),
        body("deleted")
            .custom(value => value === true).withMessage("Inaktiv felhasználót nem frissithetsz!")
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
                let { userId } = request.body;
                let sorok = await database.userToInactive(userId);
                if (sorok === 0) {
                    response.status(200).json({ message: "A felhasználó már inaktiv volt!" })
                }
                else {
                    response.status(204).end();
                }
            }
        } catch (error) {
            response.status(500).json({ error: error });
        }
    })

router.post('/updateProfilePicFromAdmin', auth.checkAuth, auth.checkRole("ADMIN"), upload.single('profilePic'), async (request, response) => {
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

            let lastPfp = await database.uploadProfilePic(finalUrl, width, height, request.body.user_id);

            await fs.unlink(originalFile).catch(() => { });

            if (lastPfp) {
                let lastPfpPath = path.join(__dirname, '..', 'uploads', lastPfp);
                await fs.unlink(lastPfpPath).catch(() => { });
            }
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

router.post('/deleteProfilePicFromAdmin', auth.checkAuth, auth.checkRole("ADMIN"), async (request, response) => {
    try {
        let lastPfp = await database.deleteProfilePic(request.body.user_id);
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
            response.status(201).json({ success: true, message: "Profilkép törölve!" });
        }
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

module.exports = router;
