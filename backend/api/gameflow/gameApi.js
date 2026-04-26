const express = require("express");
const router = express.Router();
const database = require("../../sql/database.js");
const { checkGameSession } = require("../../auth.js");
const fs = require("fs/promises");
const path = require('path');
const AppError = require("../../utils/AppError.js");

router.use(checkGameSession);
//TODO: képek visszadásának átdolgozása majd a lowhighres szerint
function getMimeTypeFromPath(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    let result = "application/octet-stream";
    if (extension === ".jpg" || extension === ".jpeg") result = "image/jpeg";
    if (extension === ".png") result = "image/png";
    if (extension === ".gif") result = "image/gif";
    if (extension === ".webp") result = "image/webp";
    return result;
}

function resolvePathInsideUploadRoot(filePath) {
    const rootPath = path.resolve('./uploads');
    const fullPath = path.resolve(rootPath, filePath);
    if (!fullPath.startsWith(rootPath + path.sep)) {
        const error = new Error("Invalid image path");
        error.statusCode = 400;
        throw error;
    }
    return fullPath;
}


//ENDPOINTS

router.get('/get_game_info', async (request, response) => {
    try {
        const game = request.session.game;
        response.status(200).json({
            success: true,
            game: {
                title: game.gameTitle,
                rounds: game.rounds,
                currentRound: game.currentRound,
                roundTime: game.roundTime
            }
        });
    } catch (error) {
        response.status(500).json({ success: false, message: "Error fetching game info" });
    }
});

router.get("/get_all_maps", async (request, response) => {
    const game = request.session.game;
    try {
        const maps = await database.getAllMaps(game.gameMapId);
        let mapObjects = [];
        let mapInfo = [];
        for (let i = 0; i < maps.length; i++) {
            const map = maps[i];
            const imageFullPath = resolvePathInsideUploadRoot(map.filepath);
            const imageBuffer = await fs.readFile(imageFullPath);
            const mimeType = getMimeTypeFromPath(map.filepath);
            mapInfo.push({ mapId: map.map_id, width: map.width, height: map.height });
            mapObjects.push({
                title: map.title,
                image: {
                    id: map.image_id,
                    mimeType: mimeType,
                    base64: imageBuffer.toString("base64"),
                    width: map.width,
                    height: map.height
                }
            });
        }
        request.session.game.mapInfo = mapInfo;
        response.status(200).json({ success: true, maps: mapObjects });
    } catch (error) {
        if (error.statusCode) {
            response.status(400).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error fetching maps" });
        }
    }
});

router.get("/get_random_point", async (request, response) => {
    try {
        const sessionId = request.session?.game.activeSessionId;
        const gameMapId = request.session?.game.gameMapId;
        let point;
        const currentPointId = await database.getCurrentPointId(sessionId);
        if (currentPointId) {
            point = await database.getPointById(currentPointId);
        } else {
            point = await database.getRandomPoint(gameMapId, sessionId);
            if (!point) {
                await database.incrementCycle(sessionId);
                point = await database.getRandomPoint(gameMapId, sessionId);
                request.session.game.currentCycle += 1;
            }
        }
        if (!point) {
            throw new AppError("No points available", 500);
        }
        await database.setCurrentPoint(sessionId, point.point_id);
        const imageFullPath = resolvePathInsideUploadRoot(point.filepath);
        const imageBuffer = await fs.readFile(imageFullPath);
        const mimeType = getMimeTypeFromPath(point.filepath);
        if (!request.session.game.roundStartedAt) {
            request.session.game.roundStartedAt = Date.now();
        }
        request.session.game.point = {
            pointId: point.point_id,
            pointu: point.point_u,
            pointv: point.point_v,
            north_direction: point.north_direction,
            mapId: point.map_id,
            image: {
                id: point.image_id,
                mimeType: mimeType,
                base64: imageBuffer.toString("base64"),
                width: point.width,
                height: point.height
            }
        };
        point = {
            point_id: request.session.game.point.pointId,
            north_direction: request.session.game.point.north_direction,
            image: {
                id: request.session.game.point.image.id,
                mimeType: request.session.game.point.image.mimeType,
                base64: request.session.game.point.image.base64,
                width: request.session.game.point.image.width,
                height: request.session.game.point.image.height
            }
        };
        response.status(200).json({ success: true, point: point });
    } catch (error) {
        if (error.statusCode) {
            response.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error fetching random point" });
        }
    }
});


router.post('/session_guess', async (request, response) => {
    try {
        const sessionId = request.session?.game.activeSessionId;
        const game = request.session.game;
        const activePointId = await database.getCurrentPointId(sessionId);
        if (!activePointId) {
            throw new AppError("No active round", 400);
        }
        if (!game.mapInfo) {
            throw new AppError("Game maps not loaded", 400);
        }
        if (!game.point) {
            throw new AppError("No active point in session", 400);
        }
        if (game.sharpness == null || !isFinite(game.sharpness)) {
            throw new AppError("Invalid game configuration", 500);
        }

        const guessu = parseFloat(request.body.u);
        const guessv = parseFloat(request.body.v);
        const mapI = parseInt(request.body.map_i);
        if (isNaN(guessu) || isNaN(guessv) || !isFinite(guessu) || !isFinite(guessv)) {
            throw new AppError("Invalid guess coordinates", 400);
        }

        const mapObI = game.mapInfo.findIndex(m => m.mapId === game.point.mapId);
        const mapOb = game.mapInfo[mapObI];
        if (mapOb === undefined || isNaN(mapI)) {
            throw new AppError("Invalid map index", 400);
        }

        const countdownSeconds = 3;
        const elapsed = Math.floor((Date.now() - (game.roundStartedAt ?? 0)) / 1000) - countdownSeconds;
        const timeLeft = Math.max(0, game.roundTime - elapsed);
        const timePunishment = game.roundTime - 5;
        const minTimeMultiplier = 0.1;
        let score;
        let reJson;
        let distance;
        if (guessu < 0 || guessv < 0 || guessu > 1 || guessv > 1) {
            score = 0;
            distance = -1;
            reJson = { success: true, score, distance: null, mapI: mapObI };
        } else if (mapObI !== mapI) {
            score = 0;
            distance = -1;
            reJson = { success: true, score, distance: null, mapI: mapObI };
        } else {
            const du = guessu - game.point.pointu;
            const dv = guessv - game.point.pointv;
            distance = Math.sqrt(du * du + dv * dv);
            const pixelDx = du * mapOb.width;
            const pixelDy = dv * mapOb.height;
            const pixelDistance = Math.round(Math.sqrt(pixelDx * pixelDx + pixelDy * pixelDy));
            if (timeLeft > timePunishment && timeLeft <= game.roundTime) {
                score = Math.round(5000 * Math.exp(game.sharpness * (distance / Math.SQRT2)));
            } else if (timeLeft === 0) {
                score = Math.round(5000 * Math.exp(game.sharpness * (distance / Math.SQRT2)) * minTimeMultiplier);
            } else {
                score = Math.round(5000 * Math.exp(game.sharpness * (distance / Math.SQRT2)) * (timeLeft / timePunishment));
            }
            reJson = { success: true, score, distance: pixelDistance, mapI };
        }

        let conn;
        try {
            conn = await database.getConnection();
            await conn.beginTransaction();
            await database.saveGuess(conn, sessionId, game.point.pointId, mapOb.mapId, guessu, guessv, distance, score, game.currentCycle);
            await database.incrementCurrentRound(conn, sessionId);
            game.currentRound += 1;
            await database.clearCurrentPoint(conn, sessionId);
            await conn.commit();
        } catch (txError) {
            if (conn) {
                try { await conn.rollback(); } catch (_) {}
            }
            throw txError;
        } finally {
            if (conn) conn.release();
        }
        const totalScore = await database.totalScore(sessionId);
        reJson.totalScore = totalScore;
        reJson.pointu = game.point.pointu;
        reJson.pointv = game.point.pointv;
        reJson.pointx = Math.round(game.point.pointu * mapOb.width);
        reJson.pointy = Math.round(game.point.pointv * mapOb.height);
        response.status(200).json(reJson);
    } catch (error) {
        if (error.statusCode) {
            response.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error processing guess" });
        }
    }
});

router.post('/finish_game_session', async (request, response) => {
    try {
        await database.finishGameSession(request.session.game.activeSessionId);
        delete request.session.game;
        response.status(200).json({ success: true, message: 'Game session finished' });
    } catch (error) {
        response.status(500).json({ success: false, message: 'Error finishing game session' });
    }
});

module.exports = router;
