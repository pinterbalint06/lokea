const database = require("#sql/game.database.js");
const AppError = require("../../../utils/app-error.js");
const { COUNTDOWN_SECONDS, readImageData } = require("../shared/gameflow.utils.js");

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
    return { point, cycleIncremented: true };
}

function calculateRoundTiming(roundStartedAt, roundTime) {
    const roundEndAt = roundStartedAt + (COUNTDOWN_SECONDS + roundTime) * 1000;
    const timeLeft = Math.max(0, Math.ceil((roundEndAt - Date.now()) / 1000));
    return { roundEndAt, timeLeft };
}

function buildPointObjects(point, imageData, timing) {
    const { base64, mimeType } = imageData;
    const { roundEndAt, timeLeft } = timing;
    const image = { id: point.image_id, mimeType, base64, width: point.width, height: point.height };

    const sessionPoint = {
        pointId: point.point_id,
        pointu: point.point_u,
        pointv: point.point_v,
        north_direction: point.north_direction,
        mapId: point.map_id,
        image
    };

    const responsePoint = {
        point_id: point.point_id,
        north_direction: point.north_direction,
        image,
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

    const imageData = await readImageData(point.filepath);
    const timing = calculateRoundTiming(game.roundStartedAt, game.roundTime);
    const { sessionPoint, responsePoint } = buildPointObjects(point, imageData, timing);

    return { sessionPoint, responsePoint, cycleIncremented };
}

module.exports = { getRandomPoint };
