const express = require("express");
const router = express.Router();
const database = require("../sql/database.js");
const fs = require("fs/promises");

const path = require('path');

function getMimeTypeFromPath(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    let result = "application/octet-stream";
    if (extension === ".jpg" || extension === ".jpeg") {
        result = "image/jpeg";
    }
    if (extension === ".png") {
        result = "image/png";
    }
    if (extension === ".gif") {
        result = "image/gif";
    }
    if (extension === ".webp") {
        result = "image/webp";
    }
    return result;
}

function resolvePathInsideUploadRoot(filePath) {
    const rootPath = path.resolve('./uploads');
    const fullPath = path.resolve(rootPath, filePath);
    if (!fullPath.startsWith(rootPath)) {
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
        if (!game || !game.activeSessionId) {
            const err = new Error("No active game session found");
            err.statusCode = 404;
            throw err;
        }
        console.log("Game info requested for session:", game);
        response.status(200).json({
            success: true,
            game: {
                title: game.gameTitle,
                rounds: game.rounds,
                roundTime: game.roundTime
            }
        });
    } catch (error) {
        if (error.statusCode) {
            response.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error fetching game info" });
        }
    }
});

router.get("/get_random_point", async (request, response) => {
    try {
        const sessionId = request.session?.game.activeSessionId || 1; //TODO: törlés amikor login kész lesz
        const gameMapId = request.session?.game.gameMapId || 1; //TODO: törlés amikor login kész lesz
        if (!sessionId || !request.session.game) {
            const err = new Error("No active game session found");
            err.statusCode = 404;
            throw err;
        }
        let point = await database.getRandomPoint(gameMapId, sessionId);
        if (!point) {
            await database.incrementCycle(sessionId);
            point = await database.getRandomPoint(gameMapId, sessionId);
            request.session.game.currentCycle += 1;
        }
        const imageFullPath = resolvePathInsideUploadRoot(point.filepath);
        const imageBuffer = await fs.readFile(imageFullPath);
        const mimeType = getMimeTypeFromPath(point.filepath);

        request.session.game.point = {
            pointId: point.point_id,
            pointu: point.point_u,
            pointv: point.point_v,
            mapId: point.map_id
        }

        point = {
            point_id: point.point_id,
            north_direction: point.north_direction,
            image: {
                id: point.image_id,
                mime_type: mimeType,
                base64: imageBuffer.toString("base64"),
                width: point.width,
                height: point.height
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

router.get("/get_all_maps", async (request, response) => {
    const sessionId = request.session?.activeSessionId || 1; //TODO: törlés amikor login kész lesz
    try {
        const maps = await database.getAllMaps(sessionId);

        let mapObjects = [];
        let mapInfo = [];

        for (let i = 0; i < maps.length; i++) {
            const map = maps[i];
            const imageFullPath = resolvePathInsideUploadRoot(map.filepath);
            const imageBuffer = await fs.readFile(imageFullPath);
            const mimeType = getMimeTypeFromPath(map.filepath);
            mapInfo.push({
                mapId: map.map_id,
                width: map.width,
                height: map.height
            });
            mapObjects.push({
                title: map.title,
                image: {
                    id: map.image_id,
                    mime_type: mimeType,
                    base64: imageBuffer.toString("base64"),
                    width: map.width,
                    height: map.height
                }
            });
        }

        request.session.game.mapInfo = mapInfo;

        response.status(200).json({ success: true, maps: mapObjects });
    } catch (error) {
        response.status(500).json({ success: false, message: "Error fetching all maps" });
    }
});

router.post('/session_guess', async (request, response) => {
    try {
        //TODO: map ellenőrzése
        const sessionId = request.session?.game.activeSessionId || 1; //TODO: törlés amikor login kész lesz
        const game = request.session.game;
        const guessu = parseFloat(request.body.u);
        const guessv = parseFloat(request.body.v);
        const timeLeft = parseInt(request.body.timeLeft);
        const mapI = parseInt(request.body.map_i);
        const mapOb = game.mapInfo[mapI];
        const timePunishment = game.roundTime - 5;
        const minTimeMultiplier = 0.1;
        let score;
        let reJson;
        if (!sessionId) {
            const err = new Error("No active game session found");
            err.statusCode = 404;
            throw err;
        }
        if (!game || !game.point) {
            const err = new Error("No active game or game point found");
            err.statusCode = 404;
            throw err;
        }
        if (isNaN(guessu) || isNaN(guessv) || isNaN(timeLeft)) {
            const err = new Error("Invalid guess coordinates or time left");
            err.statusCode = 400;
            throw err;
        }
        if (mapOb === undefined || isNaN(mapI)) {
            const err = new Error("Invalid map index");
            err.statusCode = 400;
            throw err;
        }
        if (guessu < 0 || guessv < 0) {
            score = 0;
            reJson = { success: true, score: score, distance: null, mapI: mapI };
            await database.saveGuess(sessionId, game.point.pointId, mapOb.mapId, guessu, guessv, -1, 0, game.currentCycle);
        } else if (mapOb.mapId !== game.point.mapId) {
            score = 0;
            reJson = { success: true, score: score, distance: null, mapI: mapI };
            await database.saveGuess(sessionId, game.point.pointId, mapOb.mapId, guessu, guessv, -1, 0, game.currentCycle);
        }
        else {
            const du = (guessu - game.point.pointu);
            const dv = (guessv - game.point.pointv);
            const distance = Math.sqrt(du * du + dv * dv);
            const pixelDx = du * game.mapInfo.width;
            const pixelDy = dv * game.mapInfo.height;
            const pixelDistance = Math.round(Math.sqrt(pixelDx * pixelDx + pixelDy * pixelDy));
            if (timeLeft > timePunishment && timeLeft <= game.roundTime) {
                score = Math.round(5000 * Math.exp(game.sharpness * (distance / Math.SQRT2)));
            } else if (timeLeft == 0) {
                score = Math.round(5000 * Math.exp(game.sharpness * (distance / Math.SQRT2)) * minTimeMultiplier);
            } else {
                score = Math.round(5000 * Math.exp(game.sharpness * (distance / Math.SQRT2)) * (timeLeft / timePunishment));
            }
            reJson = { success: true, score: score, distance: pixelDistance, mapI: mapI };
            await database.saveGuess(sessionId, game.point.pointId, mapOb.mapId, guessu, guessv, distance, score, game.currentCycle);
            await database.incrementCurrentRound(sessionId);
        }
        const totalScore = await database.totalScore(sessionId);
        reJson.totalScore = totalScore;
        reJson.pointu = game.point.pointu;
        reJson.pointv = game.point.pointv;

        response.status(200).json(reJson);
    } catch (error) {
        if (error.statusCode) {
            response.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error processing guess" });
        }
    }
});

module.exports = router;