const database = require("#sql/game.database.js");
const AppError = require("../../../utils/app-error.js");
const { COUNTDOWN_SECONDS } = require("../shared/gameflow.utils.js");

async function resolveCurrentPoint(gameMapId, sessionId) {
    const currentPointId = await database.getCurrentPointId(sessionId);
    if (currentPointId) {
        return { point: await database.getPointById(currentPointId), cycleIncremented: false };
    }

    let point = await database.getRandomPoint(gameMapId, sessionId);
    if (point) {
        return { point, cycleIncremented: false };
    }

    await database.incrementCycle(sessionId);
    point = await database.getRandomPoint(gameMapId, sessionId);
    console.log("Cycle incremented, new point:", point);
    return { point, cycleIncremented: true };
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
        throw new AppError("No points available", 500);
    }

    await database.setCurrentPoint(sessionId, point.point_id);

    const timing = calculateRoundTiming(game.roundStartedAt, game.roundTime);
    const { sessionPoint, responsePoint } = buildPointObjects(point, timing);

    return { sessionPoint, responsePoint, cycleIncremented };
}

module.exports = { getRandomPoint };
