const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const auth = require('../auth.js')
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { body, check, validationResult } = require("express-validator");
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
                    error: errors.array()
                });
            }
            else {
                const { username, email, password } = request.body;
                const hashedPassword = await bcrypt.hash(password, 10);
                let insert = await database.newUser(username, email, hashedPassword);
                if (insert.success) {
                    response.status(201).json({
                        success: true,
                        message: "Sikeres regisztráció"
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
            response.status(500).json({ error: error });
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

                        if (sesRole.role === 'ADMIN') {
                            request.session.cookie.maxAge = 15 * 60 * 1000;
                        }
                        else {
                            request.session.cookie.maxAge = 2 * 60 * 60 * 1000;
                        }

                        request.session.userid = rows[0].user_id;
                        request.session.role = sesRole;
                        response.status(200).json({ message: "Sikeres bejelentkezés", role: sesRole });
                    }
                }
            }
        } catch (error) {
            response.status(500).json({ message: error })
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
//Endpoints - settings

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

            let lastPfp = await database.uploadProfilePic(finalUrl, width, height, request.body.user_id);

            await fs.unlink(originalFile).catch(() => { });

            if (lastPfp) {
                let lastPfpPath = path.join(__dirname, '..', lastPfp);
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
        response.status(500).json({ error: error.message, details: error.stack });
    }
})

router.post('/deleteProfilePic', auth.checkAuth, async (request, response) => {
    try {
        let lastPfp = await database.deleteProfilePic(request.body.user_id);
        if (!lastPfp) {
            response.status(200).json({ success: true, message: "A profilkép már alapértelmezett volt." });
        }
        else {
            let lastPfpPath = path.join(__dirname, '..', lastPfp);
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
            response.status(500).json({ message: error })
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

router.get('/active_game_session', async (request, response) => {
    try {
        const userId = request.session?.userid || 1; //TODO: torles ha mar stabil a session
        const activeSession = await database.selectLatestActiveGameSession(userId);
        let responseData;

        if (!activeSession) {
            responseData = { success: true, hasActiveSession: false };
            responseData.status = 200;
        }
        else {
            request.session.game = {
                activeSessionId: activeSession.session_id,
                gameMapId: activeSession.game_maps_id,
                currentCycle: activeSession.current_cycle,
                sharpness: activeSession.sharpness,
                rounds: activeSession.rounds_left,
                roundTime: activeSession.time_per_round,
                gameTitle: activeSession.title
            };
            responseData = {
                success: true,
                hasActiveSession: true,
                gameTitle: activeSession.title
            };
            responseData.status = 200;
        }
        response.status(responseData.status).json(responseData);
    } catch (error) {
        response.status(500).json({ success: false, message: error.message, error: error });
    }
});

router.post('/finish_game_session', async (request, response) => {
    try {
        await database.finishGameSession(request.session.game.activeSessionId);
        delete request.session.game;
        response.status(200).json({ success: true, message: 'Game session finished' });
    } catch (error) {
        response.status(500).json({ success: false, message: 'Database error', error: error });
    }
});

router.post('/post_game_id', upload.none('file'), async (request, response) => {
    const difficulty = request.body.difficulty;
    const gameMapId = parseInt(request.body.gameMapId);
    const rounds = parseInt(request.body.rounds);
    const roundTime = parseInt(request.body.roundTime);
    const userId = request.session?.userid || 1; //TODO: törlés ha már stabil a session
    const allowedDifficulties = { easy: -1.5, normal: -3, hard: -5 };
    const sharpness = allowedDifficulties[difficulty] ?? -3;

    if (!Number.isInteger(gameMapId) || gameMapId <= 0) {
        const err = new Error('Invalid gameMapId');
        err.statusCode = 400;
        throw err;
    }
    try {
        const activeSession = await database.insertGameSession(userId, rounds, roundTime, gameMapId, sharpness);
        const gameTitle = await database.getGameTitleById(gameMapId);
        request.session.game = {
            activeSessionId: activeSession,
            gameMapId: gameMapId,
            currentCycle: 1,
            sharpness: sharpness,
            rounds: rounds,
            roundTime: roundTime,
            gameTitle: gameTitle
        };

        response.status(200).json({ success: true, message: 'Game map ID saved in session' });
    } catch (error) {
        const status = error.statusCode ?? 500;
        response.status(status).json({ success: false, message: error.message });
    }
});

module.exports = router;
