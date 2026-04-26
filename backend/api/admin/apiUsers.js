const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const { body, query, validationResult } = require('express-validator');
const sharp = require('sharp');
const { sendWelcomeEmail, sendChangeEmail, sendDeleteEmail } = require('../../utils/mails.js');

//?SQL
const databaseUsers = require('../../sql/admin/databaseUsers.js');
const databaseLogs = require('../../sql/admin/databaseLogs.js');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');
const TARGET_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.resolve(process.cwd(), 'uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

//API endpoints

//GET

router.get('/getUsers', async (request, response) => {
    try {
        let users = await databaseUsers.getUsers();
        response.status(200).json({ users: users.rows, total: users.total });
    } catch (error) {
        response.status(500).json({ error: "Hiba történt a felhasználók lekérése során!" });
    }
})

router.get('/sortedUsers', [
    query('mireKeresek')
        .optional({ values: 'null' })
        .isIn(['user_id', 'username', 'email']).withMessage("A keresési típus nem megfelelő!"),
    query('mit')
        .optional({ values: 'null' })
        .matches(/^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű0-9@._-]*$/).withMessage("A keresési érték csak betűket, számokat, -, _, @ vagy . karaktert tartalmazhat!")
        .isLength({ max: 254 }).withMessage("A keresési érték hossza nem megfelelő!"),
    query('status')
        .isIn(['statusActive', 'statusDeleted', 'statusAny']).withMessage("A státusz nem megfelelő!"),
    query('adminChecked')
        .isBoolean().withMessage("A adminChecked paraméter nem boolean!"),
    query('modChecked')
        .isBoolean().withMessage("A modChecked paraméter nem boolean!"),
    query('userChecked')
        .isBoolean().withMessage("A userChecked paraméter nem boolean!"),
    query('page')
        .isInt({ min: 1 }).withMessage("Az oldalszám nem megfelelő!")
        .toInt(),
    validate
], async (request, response) => {
    try {
        let { mireKeresek, mit, status, adminChecked, modChecked, userChecked, page } = request.query;

        let users = await databaseUsers.sortedUsers(
            mireKeresek,
            mit,
            status,
            adminChecked,
            modChecked,
            userChecked,
            page
        );

        response.status(200).json({ users: users.rows, total: users.total });
    } catch (error) {
        response.status(500).json({ error: "Hiba történt a szűrt felhasználók lekérése során!" });
    }
});

router.get('/getUser',
    [
        query('id')
            .isInt({ min: 1 }).withMessage("A user ID nem megfelelő!")
            .toInt()
    ], validate,
    async (request, response) => {
        try {
            let params = request.query.id;
            let users = await databaseUsers.getUser(params);
            if (users && users.length === 0) {
                response.status(404).json({ message: "Nincs ilyen felhasználó!" });
            }
            else {
                response.status(200).json({ message: "Sikeres lekérés", users: users });
            }
        } catch (error) {
            response.status(500).json({ error: "Hiba történt a felhasználó lekérése során!" });
        }
    })

//POST

router.post("/signupFromAdmin",
    [
        body("username")
            .not().isEmail().withMessage("Felhasználónév nem lehet email cim!")
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]*$/).withMessage('A felhasználónév csak betűket, számokat, - vagy _ karaktert, és ékezetes betűket tartalmazhat.')
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 250 }).withMessage("Email max 250 karakter"),
        body("password")
            .isLength({ min: 8, max: 50 }).withMessage("Jelszó hossza 8-50")
            .matches(/\d/).withMessage("Kell benne szám")
            .matches(/[A-Z]/).withMessage("Kell benne nagybetű"),
        body("role")
            .isIn(['user', 'MOD']).withMessage("A szerepkör nem megfelelő!"),
    ], validate,
    async (request, response) => {
        try {
            const { username, email, password, role } = request.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            let insert = await databaseUsers.newUserFromAdmin(username, email, hashedPassword, role);
            if (insert.success) {
                let userid = insert.insertId;
                await databaseLogs.addLog(userid, 'Sign up (A)');
                // await sendWelcomeEmail(email, username);
                response.status(201).json({
                    success: true,
                    message: "Sikeres regisztráció!"
                });
            }
            else {
                throw new Error("Sikertelen regisztráció!");
            }
        } catch (error) {
            response.status(500).json({ error: "Hiba a regisztráció során!" });
        }
    }
);

router.post('/exportUsers',
    [
        body('mireKeresek')
            .optional({ values: 'null' })
            .isIn(['user_id', 'username', 'email']).withMessage("A keresési típus nem megfelelő!"),
        body('mit')
            .optional({ values: 'null' })
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]*$/).withMessage("A keresési érték csak betűket, számokat, -, _, @ vagy . karaktert tartalmazhat!")
            .isLength({ max: 254 }).withMessage("A keresési érték hossza nem megfelelő!"),
        body('status')
            .isIn(['statusActive', 'statusDeleted', 'statusAny']).withMessage("A státusz nem megfelelő!"),
        body('adminChecked')
            .isBoolean().withMessage("A adminChecked paraméter nem boolean!"),
        body('modChecked')
            .isBoolean().withMessage("A modChecked paraméter nem boolean!"),
        body('userChecked')
            .isBoolean().withMessage("A userChecked paraméter nem boolean!"),
    ], validate,
    async (request, response) => {
        try {
            let { mireKeresek, mit, status, adminChecked, modChecked, userChecked } = request.body;
            let users = (await databaseUsers.sortedUsers(mireKeresek, mit, status, adminChecked, modChecked, userChecked, 1, 999999)).rows;

            let csvContent = "\uFEFFID;Username;Email;Status;Role\n";

            users.forEach(user => {
                let statusText = user.deleted_at ? "Deleted" : "Active";
                csvContent += `${user.user_id};${user.username};${user.email};${statusText};${user.role}\n`;
            });

            response.setHeader('Content-Type', 'text/csv; charset=utf-8');
            response.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');

            return response.status(200).send(csvContent);

        } catch (error) {
            console.log(error.message)
            return response.status(500).json({ error: "Hiba az exportálás során!" });
        }
    });

//PUT

router.put('/updateUserFromAdmin',
    [
        body("user_id")
            .isInt({ min: 1 }).withMessage("A user ID nem megfelelő!")
            .toInt(),
        body("username")
            .optional({ values: 'null' })
            .not().isEmail().withMessage("Felhasználónév nem lehet email cim!")
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage('A felhasználónév csak betűket, számokat, - vagy _ karaktert, és ékezetes betűket tartalmazhat.')
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .optional({ values: 'null' })
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 250 }).withMessage("Email max 250 karakter!"),
        body("role")
            .optional({ values: 'null' })
            .isIn(['user', 'MOD', 'ADMIN']).withMessage("A szerepkör nem megfelelő!"),
    ], validate,
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
                let { user_id, username, email, role } = request.body;
                if (role == "ADMIN" && request.session.role != "LORD") {
                    response.status(403).json({ message: "Nincs jogosultságod ehhez!" });
                }
                else {
                    let success = await databaseUsers.updateUserByAdmin(user_id, username, email, role);
                    if (success == 1) {
                        await databaseLogs.addLog(request.session.userid, 'User update (A)', user_id);
                        // await sendChangeEmail(email, username);
                        response.status(204).json({ message: "Sikeres felhasználófrissités!" });
                    }
                    else {
                        response.status(404).json({ message: "Nincs ilyen felhasználó, vagy a felhasználó inaktiv már!" });
                    }
                }
            }
        } catch (error) {
            response.status(500).json({ error: "Hiba a felhasználó frissítésekor!" });
        }
    })

router.put('/userSelfUpdate',
    [
        body("username")
            .optional({ values: 'null' })
            .not().isEmail().withMessage("Felhasználónév nem lehet email cim!")
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage('A felhasználónév csak betűket, számokat, - vagy _ karaktert, és ékezetes betűket tartalmazhat.')
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .optional({ values: 'null' })
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 250 }).withMessage("Email max 250 karakter!")
    ], validate,
    async (request, response) => {
        try {
            let { username, email } = request.body;
            let success = await databaseUsers.updateUserByAdmin(request.session.userid, username, email);
            if (success == 1) {
                await databaseLogs.addLog(request.session.userid, 'User update');
                // await sendChangeEmail(email, username);
                response.status(204).json({ message: "Sikeres felhasználófrissités!" });
            }
            else {
                response.status(404).json({ error: "Nincs ilyen felhasználó, vagy a felhasználó inaktiv már!" });
            }
        } catch (error) {
            response.status(500).json({ error: "Hiba a felhasználó frissítésekor!" });
        }
    })

router.put('/updateProfilePicFromAdmin', upload.single('profilePic'), async (request, response) => {
    let originalFile;
    let newFilePath;
    try {
        if (!request.file) {
            return response.status(400).json({ message: "Nincs kép!" });
        }
        else {
            let user_id = request.body.user_id;
            originalFile = request.file.path;

            let newFileName = `processed-${Date.now()}.webp`;
            newFilePath = path.join(TARGET_UPLOADS_DIR, newFileName);

            sharp.cache(false);
            const metadata = await sharp(originalFile)
                .resize(400, 400, {
                    fit: 'cover',
                    position: 'center'
                })
                .toFormat('webp')
                .toFile(newFilePath);

            let { width, height } = metadata;
            let lastPfp = await databaseUsers.uploadProfilePic(newFileName, width, height, user_id);

            await fs.unlink(originalFile);

            if (lastPfp) {
                let lastPfpPath = path.join(TARGET_UPLOADS_DIR, lastPfp);
                await fs.unlink(lastPfpPath);
            }

            await databaseLogs.addLog(request.session.userid, 'Profile picture update (A)', user_id);
            response.status(201).json({ success: true, message: "Profilkép frissítve!" });

        }
    } catch (error) {
        if (originalFile) await fs.unlink(originalFile).catch(() => { });
        if (newFilePath) await fs.unlink(newFilePath).catch(() => { });
        response.status(500).json({ error: "Hiba a profilkép frissítésekor!" });
    }
});

//DELETE

router.delete('/userToInactive',
    [
        body("role")
            .not().matches("ADMIN").withMessage("Nem frissithetsz admin-t!")
            .isIn(['user', 'MOD']).withMessage("A szerepkör nem megfelelő!"),
        body("deleted")
            .custom(value => value === true).withMessage("Inaktiv felhasználót nem frissithetsz!")
    ], validate,
    async (request, response) => {
        try {
            let { userId } = request.body;
            let sorok = await databaseUsers.userToInactive(userId);
            if (sorok === 0) {
                response.status(200).json({ message: "A felhasználó már inaktiv volt!" })
            }
            else {
                await databaseLogs.addLog(request.session.userid, 'User delete (A)', userId);
                // await sendDeleteEmail(email, username);
                response.status(204).end();
            }
        } catch (error) {
            response.status(500).json({ error: "Hiba a felhasználó inaktiválásakor!" });
        }
    })

router.delete('/deleteProfilePicFromAdmin', async (request, response) => {
    try {
        let user_id = request.body.user_id;
        let lastPfp = await databaseUsers.deleteProfilePic(user_id);

        if (!lastPfp) {
            response.status(200).json({ success: true, message: "A profilkép már alapértelmezett volt." });
        }
        else {
            let lastPfpPath = path.join(TARGET_UPLOADS_DIR, lastPfp);
            await fs.unlink(lastPfpPath).catch(() => { });

            await databaseLogs.addLog(request.session.userid, 'Profile picture delete (A)', user_id);
            response.status(201).json({ success: true, message: "Profilkép törölve!" });
        }
    } catch (error) {
        response.status(500).json({ error: "Hiba a profilkép törlésekor!" });
    }
});

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            errors: errors.array()
        });
    }
    else {
        next();
    }
}

module.exports = router;