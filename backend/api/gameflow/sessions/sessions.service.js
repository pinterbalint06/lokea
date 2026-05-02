const sessionsQueries = require("#gameflow/sessions/sessions.queries.js");
const AppError = require("#utils/app-error.js");

const DIFFICULTY_SHARPNESS = { easy: -1.5, normal: -3, hard: -5 };
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 100;
const MIN_ROUND_TIME = 1;
const MAX_ROUND_TIME = 300;

function buildSessionObject({ activeSessionId, gameMapId, currentCycle, sharpness, rounds, currentRound, roundTime, gameTitle }) {
    return { activeSessionId, gameMapId, currentCycle, sharpness, rounds, currentRound, roundTime, gameTitle };
}

function validateGameStartInput(body) {
    const gameMapId = parseInt(body.gameMapId);
    const rounds = parseInt(body.rounds);
    const roundTime = parseInt(body.roundTime);
    const { difficulty } = body;

    if (!Number.isInteger(gameMapId) || gameMapId <= 0) {
        throw new AppError("Invalid gameMapId", 400);
    }
    if (!Number.isInteger(rounds) || rounds < MIN_ROUNDS || rounds > MAX_ROUNDS) {
        throw new AppError(`Invalid rounds (${MIN_ROUNDS}–${MAX_ROUNDS})`, 400);
    }
    if (!Number.isInteger(roundTime) || roundTime < MIN_ROUND_TIME || roundTime > MAX_ROUND_TIME) {
        throw new AppError(`Invalid roundTime (${MIN_ROUND_TIME}–${MAX_ROUND_TIME})`, 400);
    }
    if (!Object.hasOwn(DIFFICULTY_SHARPNESS, difficulty)) {
        throw new AppError("Invalid difficulty", 400);
    }

    return { gameMapId, rounds, roundTime, difficulty };
}

function validateGameInfo(gameInfo) {
    if (!gameInfo) {
        throw new AppError("Game map not found", 404);
    }
    if (!gameInfo.map_id) {
        throw new AppError("Game map has no points", 400);
    }
    if (!gameInfo.point_id) {
        throw new AppError("Game map has no points", 400);
    }
}

async function getActiveSession(userId) {
    const row = await sessionsQueries.selectLatestActiveGameSession(userId);
    return row
        ? buildSessionObject({
            activeSessionId: row.session_id,
            gameMapId: row.game_maps_id,
            currentCycle: row.current_cycle,
            sharpness: row.sharpness,
            rounds: row.rounds,
            currentRound: row.current_round,
            roundTime: row.time_per_round,
            gameTitle: row.title
        })
        : null;
}

async function createGameSession(userId, body) {
    const { gameMapId, rounds, roundTime, difficulty } = validateGameStartInput(body);
    const sharpness = DIFFICULTY_SHARPNESS[difficulty];

    const gameInfo = await sessionsQueries.getGameInfoById(gameMapId);
    validateGameInfo(gameInfo);
    const sessionId = await sessionsQueries.insertGameSession(userId, rounds, roundTime, gameMapId, sharpness);

    return buildSessionObject({
        activeSessionId: sessionId,
        gameMapId,
        currentCycle: 1,
        sharpness,
        rounds,
        currentRound: 0,
        roundTime,
        gameTitle: gameInfo.title
    });
}

module.exports = { getActiveSession, createGameSession };
