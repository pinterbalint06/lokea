const express = require("express");
const router = express.Router();
const database = require("../../sql/database.js");
const path = require('path');
const multer = require('multer');
const { checkAuth } = require("#root/auth.js");

router.use(checkAuth);

const upload = multer();

router.get('/game_maps',  async (request, response) => {
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

        const user_id = request.session?.userid;
        const palyak = await database.getGameMaps(sort, user_id, offset);

        response.status(200).json({
            success: true,
            results: palyak
        });
    } catch (error) {
        response.status(500).json({ success: false, message: 'Error fetching game maps' });
    }
});

router.get('/get_cover_image/:cover_image_id', async (request, response) => {
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
        const userId = request.session?.userid;
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
        response.status(500).json({ success: false, message: 'Error checking active session' });
    }
});

router.post('/post_game_id', upload.none(), async (request, response) => {
    const difficulty = request.body.difficulty;
    const gameMapId = parseInt(request.body.gameMapId);
    const rounds = parseInt(request.body.rounds);
    const roundTime = parseInt(request.body.roundTime);
    const userId = request.session?.userid;
    const allowedDifficulties = { easy: -1.5, normal: -3, hard: -5 };
    const sharpness = allowedDifficulties[difficulty] ?? -3;

    if (!Number.isInteger(gameMapId) || gameMapId <= 0) {
        return response.status(400).json({ success: false, message: 'Invalid gameMapId' });
    }
    try {
        const existing = await database.selectLatestActiveGameSession(userId);
        if (existing) {
            return response.status(409).json({ success: false, message: 'Van már aktív játék munkamenet' });
        }
        const activeSession = await database.insertGameSession(userId, rounds, roundTime, gameMapId, sharpness);
        const gameTitle = await database.getGameTitleById(gameMapId) ?? 'N/A';
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
        const status = error.statusCode ?? 500;
        response.status(status).json({ success: false, message: error.message });
    }
});

module.exports = router;
