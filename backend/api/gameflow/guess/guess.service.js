const guessQueries = require("#gameflow/guess/guess.queries.js");
const { getCurrentPointId } = require("#gameflow/random-point/random-point.queries.js");
const { getMapDimensions } = require("#gameflow/maps/maps.queries.js");
const { getConnection } = require("#sql/database.js");
const AppError = require("#utils/app-error.js");
const { COUNTDOWN_SECONDS } = require("../shared/gameflow.utils.js");

const MAX_SCORE = 5000;
const MIN_TIME_MULTIPLIER = 0.1;
const TIME_PUNISHMENT_BUFFER_SECONDS = 5;

function assertSessionReady(game) {
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
    const mapId = parseInt(body.map_id);
    if (isNaN(u) || isNaN(v) || !isFinite(u) || !isFinite(v)) {
        throw new AppError("Invalid guess coordinates", 400);
    }
    if (!Number.isFinite(mapId) || mapId <= 0) {
        throw new AppError("Invalid map id", 400);
    }
    return { u, v, mapId };
}

function calculateTimeLeft(game) {
    const roundEndAt = (game.roundStartedAt ?? 0) + (COUNTDOWN_SECONDS + game.roundTime) * 1000;
    return Math.max(0, Math.ceil((roundEndAt - Date.now()) / 1000));
}

function calculateScore(distance, timeLeft, roundTime, sharpness) {
    const base = MAX_SCORE * Math.exp(sharpness * (distance / Math.SQRT2));
    const timePunishment = roundTime - TIME_PUNISHMENT_BUFFER_SECONDS;
    let multiplier;
    if (timeLeft > timePunishment) {
        multiplier = 1;
    } else if (timeLeft === 0) {
        multiplier = MIN_TIME_MULTIPLIER;
    } else {
        multiplier = timeLeft / timePunishment;
    }
    return Math.round(base * multiplier);
}

function buildGuessResult(guess, game, correctMapDimensions) {
    const outOfBounds = guess.u < 0 || guess.v < 0 || guess.u > 1 || guess.v > 1;
    const wrongMap = guess.mapId !== game.point.mapId;
    let re = { score: 0, pixelDistance: null };
    if (!outOfBounds && !wrongMap) {
        const du = guess.u - game.point.pointu;
        const dv = guess.v - game.point.pointv;
        const distance = Math.sqrt(du * du + dv * dv);

        const pixelDx = du * correctMapDimensions.width;
        const pixelDy = dv * correctMapDimensions.height;
        const pixelDistance = Math.round(Math.sqrt(pixelDx * pixelDx + pixelDy * pixelDy));

        const timeLeft = calculateTimeLeft(game);
        const score = calculateScore(distance, timeLeft, game.roundTime, game.sharpness);
        re = { score, pixelDistance };
    }
    return re;
}

async function persistGuess(sessionId, game, guessedMapId, guess, result) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();
        await guessQueries.saveGuess(conn, sessionId, game.point.pointId, guessedMapId, guess.u, guess.v, result.score, game.currentCycle, game.currentRound + 1);
        await guessQueries.incrementCurrentRound(conn, sessionId);
        await guessQueries.clearCurrentPoint(conn, sessionId);
        await conn.commit();
    } catch (error) {
        try { await conn.rollback(); } catch (_) { }
        throw error;
    } finally {
        conn.release();
    }
}

async function processGuess(sessionId, game, body) {
    const activePointId = await getCurrentPointId(sessionId);
    if (!activePointId) {
        throw new AppError("No active round", 400);
    }

    assertSessionReady(game);

    const guess = parseGuessInput(body);
    const correctMapId = game.point.mapId;
    const correctMapDimensions = await getMapDimensions(correctMapId);
    if (!correctMapDimensions) {
        throw new AppError("Map not found", 500);
    }

    const result = buildGuessResult(guess, game, correctMapDimensions);

    await persistGuess(sessionId, game, guess.mapId, guess, result);

    const total = await guessQueries.totalScore(sessionId);

    return {
        score: result.score,
        distance: result.pixelDistance,
        correctMapId,
        totalScore: total,
        pointu: game.point.pointu,
        pointv: game.point.pointv,
        pointx: Math.round(game.point.pointu * correctMapDimensions.width),
        pointy: Math.round(game.point.pointv * correctMapDimensions.height)
    };
}

module.exports = { processGuess };
