const database = require("../../../sql/database.js");
const AppError = require("../../../utils/AppError.js");
const { COUNTDOWN_SECONDS } = require("../shared/gameflow.utils.js");

const MAX_SCORE = 5000;
const MIN_TIME_MULTIPLIER = 0.1;
const TIME_PUNISHMENT_BUFFER_SECONDS = 5;

function assertSessionReady(game) {
    if (!game.mapInfo) {
        throw new AppError("Game maps not loaded", 400);
    }
    if (!game.point) {
        throw new AppError("No active point in session", 400);
    }
    if (game.sharpness == null || !isFinite(game.sharpness)) {
        throw new AppError("Invalid game configuration", 500);
    }
}

function parseGuessInput(body) {
    const u = parseFloat(body.u);
    const v = parseFloat(body.v);
    const mapI = parseInt(body.map_i);
    if (isNaN(u) || isNaN(v) || !isFinite(u) || !isFinite(v)) {
        throw new AppError("Invalid guess coordinates", 400);
    }
    if (isNaN(mapI)) {
        throw new AppError("Invalid map index", 400);
    }
    return { u, v, mapI };
}

function findCorrectMap(game) {
    const index = game.mapInfo.findIndex(m => m.mapId === game.point.mapId);
    if (index === -1) {
        throw new AppError("Invalid map index", 400);
    }
    return { map: game.mapInfo[index], index };
}

function calculateTimeLeft(game) {
    const roundEndAt = (game.roundStartedAt ?? 0) + (COUNTDOWN_SECONDS + game.roundTime) * 1000;
    return Math.max(0, Math.ceil((roundEndAt - Date.now()) / 1000));
}

function calculateScore(distance, timeLeft, roundTime, sharpness) {
    const base = MAX_SCORE * Math.exp(sharpness * (distance / Math.SQRT2));
    const timePunishment = roundTime - TIME_PUNISHMENT_BUFFER_SECONDS;
    if (timeLeft > timePunishment) {
        return Math.round(base);
    }
    if (timeLeft === 0) {
        return Math.round(base * MIN_TIME_MULTIPLIER);
    }
    return Math.round(base * (timeLeft / timePunishment));
}

function buildGuessResult(guess, game, correctMap, correctMapIndex) {
    const outOfBounds = guess.u < 0 || guess.v < 0 || guess.u > 1 || guess.v > 1;
    const wrongMap = correctMapIndex !== guess.mapI;

    if (outOfBounds || wrongMap) {
        return { score: 0, distance: -1, pixelDistance: null, mapIndex: correctMapIndex };
    }

    const du = guess.u - game.point.pointu;
    const dv = guess.v - game.point.pointv;
    const distance = Math.sqrt(du * du + dv * dv);

    const pixelDx = du * correctMap.width;
    const pixelDy = dv * correctMap.height;
    const pixelDistance = Math.round(Math.sqrt(pixelDx * pixelDx + pixelDy * pixelDy));

    const timeLeft = calculateTimeLeft(game);
    const score = calculateScore(distance, timeLeft, game.roundTime, game.sharpness);

    return { score, distance, pixelDistance, mapIndex: correctMapIndex };
}

async function persistGuess(sessionId, game, correctMap, guess, result) {
    const conn = await database.getConnection();
    try {
        await conn.beginTransaction();
        await database.saveGuess(conn, sessionId, game.point.pointId, correctMap.mapId, guess.u, guess.v, result.distance, result.score, game.currentCycle);
        await database.incrementCurrentRound(conn, sessionId);
        await database.clearCurrentPoint(conn, sessionId);
        await conn.commit();
    } catch (error) {
        try { await conn.rollback(); } catch (_) {}
        throw error;
    } finally {
        conn.release();
    }
}

async function processGuess(sessionId, game, body) {
    const activePointId = await database.getCurrentPointId(sessionId);
    if (!activePointId) {
        throw new AppError("No active round", 400);
    }

    assertSessionReady(game);

    const guess = parseGuessInput(body);
    const { map: correctMap, index: correctMapIndex } = findCorrectMap(game);

    const result = buildGuessResult(guess, game, correctMap, correctMapIndex);

    await persistGuess(sessionId, game, correctMap, guess, result);

    const totalScore = await database.totalScore(sessionId);

    return {
        success: true,
        score: result.score,
        distance: result.pixelDistance,
        mapI: result.mapIndex,
        totalScore,
        pointu: game.point.pointu,
        pointv: game.point.pointv,
        pointx: Math.round(game.point.pointu * correctMap.width),
        pointy: Math.round(game.point.pointv * correctMap.height)
    };
}

module.exports = { processGuess };
