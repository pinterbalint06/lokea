const express = require("express");
const router = express.Router();
const database = require("../../sql/database.js");
const path = require('path');
const multer = require('multer');
const AppError = require("../../utils/AppError.js");
const { checkAuth } = require("#root/auth.js");

// router.use(checkAuth);

const upload = multer();

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

        const userId = request.session?.userid || 1; //TODO: törlés ha van login
        const palyak = await database.getGameMaps(sort, userId, offset);

        response.status(200).json({
            success: true,
            results: palyak
        });
    } catch (error) {
        response.status(500).json({ success: false, message: 'Error fetching game maps' + error.message });
    }
});

router.get('/get_cover_image/:cover_image_id', async (request, response) => {
    //TODO: képek visszadásának átdolgozása majd a lowhighres szerint
    try {
        let uploads = path.join(__dirname, '../../uploads');
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
        response.status(500).json({ success: false, message: 'Error fetching cover image' });
    }
});

router.get('/active_game_session', async (request, response) => {
    try {
        const userId = request.session?.userid || 1; //TODO: törlés ha van login
        const activeSession = await database.selectLatestActiveGameSession(userId);
        if (!activeSession) {
            response.status(200).json({ success: true, hasActiveSession: false });
        } else {
            request.session.game = {
                activeSessionId: activeSession.session_id,
                gameMapId: activeSession.game_maps_id,
                currentCycle: activeSession.current_cycle,
                sharpness: activeSession.sharpness,
                rounds: activeSession.rounds,
                currentRound: activeSession.current_round,
                roundTime: activeSession.time_per_round,
                gameTitle: activeSession.title
            };
            response.status(200).json({
                success: true,
                hasActiveSession: true,
                gameTitle: activeSession.title
            });
        }
    } catch (error) {
        response.status(500).json({ success: false, message: 'Error checking active session' + error.message });
    }
});

router.post('/post_game_id', upload.none(), async (request, response) => {
    const difficulty = request.body.difficulty;
    const gameMapId = parseInt(request.body.gameMapId);
    const rounds = parseInt(request.body.rounds);
    const roundTime = parseInt(request.body.roundTime);
    const userId = request.session?.userid || 1; //TODO: törlés ha van login
    const allowedDifficulties = { easy: -1.5, normal: -3, hard: -5 };
    const sharpness = allowedDifficulties[difficulty];

    try {
        if (!Number.isInteger(gameMapId) || gameMapId <= 0) {
            throw new AppError('Invalid gameMapId', 400);
        }
        if (!Number.isInteger(rounds) || rounds < 1 || rounds > 100) {
            throw new AppError('Invalid rounds (1–100)', 400);
        }
        if (!Number.isInteger(roundTime) || roundTime < 1 || roundTime > 300) {
            throw new AppError('Invalid roundTime (1–300)', 400);
        }
        if (!Object.hasOwn(allowedDifficulties, difficulty)) {
            throw new AppError('Invalid difficulty', 400);
        }
        const gameTitle = await database.getGameTitleById(gameMapId);
        if (!gameTitle) {
            throw new AppError('Game map not found', 404);
        }
        const activeSession = await database.insertGameSession(userId, rounds, roundTime, gameMapId, sharpness);
        request.session.game = {
            activeSessionId: activeSession,
            gameMapId: gameMapId,
            currentCycle: 1,
            sharpness: sharpness,
            rounds: rounds,
            currentRound: 0,
            roundTime: roundTime,
            gameTitle: gameTitle
        };
        response.status(200).json({ success: true, message: 'Game map ID saved in session' });
    } catch (error) {
        if (error.statusCode) {
            response.status(400).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error posting game" });
        }
    }
});

module.exports = router;
