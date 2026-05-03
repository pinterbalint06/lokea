const randomPointQueries = require("#gameflow/random-point/random-point.queries.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");
const { COUNTDOWN_SECONDS } = require("../shared/gameflow.utils.js");

async function resolveCurrentPoint(gameMapId, sessionId) {
    let point;
    let cycleIncremented = false;

    const currentPointId = await randomPointQueries.getCurrentPointId(sessionId);
    if (currentPointId) {
        point = await randomPointQueries.getPointById(currentPointId);
    } else {
        point = await randomPointQueries.getRandomPoint(gameMapId, sessionId);
        if (!point) {
            await randomPointQueries.incrementCycle(sessionId);
            point = await randomPointQueries.getRandomPoint(gameMapId, sessionId);
            cycleIncremented = true;
        }
    }
    return { point, cycleIncremented };
}

function calculateRoundTiming(roundStartedAt, roundTime) {
    const roundEndAt = roundStartedAt + (COUNTDOWN_SECONDS + roundTime) * 1000;
    const timeLeft = Math.max(0, Math.ceil((roundEndAt - Date.now()) / 1000));
    return { roundEndAt, timeLeft };
}

function buildPointObjects(point, timing) {
    const { roundEndAt, timeLeft } = timing;

    const sessionPoint = {
        pointId: point.point_id,
        pointu: point.point_u,
        pointv: point.point_v,
        mapId: point.map_id,
    };

    const responsePoint = {
        pointId: point.point_id,
        game: { timeLeft, roundEndAt }
    };
    return { sessionPoint, responsePoint };
}

async function getRandomPoint(sessionId, game) {
    const { point, cycleIncremented } = await resolveCurrentPoint(game.gameMapId, sessionId);
    if (!point) {
        throw new AppError(ERRORS.GAMEFLOW.NO_POINTS_AVAILABLE, 500);
    }

    await randomPointQueries.setCurrentPoint(sessionId, point.point_id);

    const timing = calculateRoundTiming(game.roundStartedAt, game.roundTime);
    const { sessionPoint, responsePoint } = buildPointObjects(point, timing);

    return { sessionPoint, responsePoint, cycleIncremented };
}

module.exports = { getRandomPoint };
