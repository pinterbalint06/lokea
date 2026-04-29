const database = require("#gamemaps/paths/paths.queries.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");

const RAD_TO_DEG = 180.0 / Math.PI;

// TODO: tesztek
function radianToDegree(angleInRadians) {
    return angleInRadians * RAD_TO_DEG;
}

function normalizeAngleDegrees(angle) {
    let normalizedAngle = angle;

    if (Number.isFinite(normalizedAngle)) {
        normalizedAngle = angle - 360 * Math.floor(angle / 360);

        if (Math.abs(360 - normalizedAngle) < 1e-5) {
            normalizedAngle = 0.0;
        }
    }

    return normalizedAngle;
}

async function getPointPaths(pointID) {
    const connections = await database.getConnectionsByPointId(pointID);
    const paths = [];

    if (connections.length > 0) {
        if (connections[0].start_point_id != pointID && connections[0].end_point_id != pointID) {
            throw new AppError(ERRORS.COMMON.UNEXPECTED_ERROR, 500);
        }

        for (const connection of connections) {
            const isStart = connection.start_point_id == pointID;

            const targetPointId = isStart ? connection.end_point_id : connection.start_point_id;

            let directionDegrees;

            if (connection.start_map_id != connection.end_map_id) {
                if (isStart) {
                    directionDegrees = parseFloat(connection.direction_start_to_end);
                } else {
                    directionDegrees = parseFloat(connection.direction_end_to_start);
                }
            } else {
                if (connection.map_width == null || connection.map_height == null) {
                    throw new AppError(ERRORS.COMMON.UNEXPECTED_ERROR, 500);
                }
                const sourceU = isStart ? connection.start_u : connection.end_u;
                const sourceV = isStart ? connection.start_v : connection.end_v;

                const targetU = isStart ? connection.end_u : connection.start_u;
                const targetV = isStart ? connection.end_v : connection.start_v;

                const sourceX = sourceU * connection.map_width;
                const sourceY = sourceV * connection.map_height;

                const targetX = targetU * connection.map_width;
                const targetY = targetV * connection.map_height;

                const vectorX = targetX - sourceX;
                const vectorY = targetY - sourceY;

                let headingRadians = Math.atan2(vectorY, vectorX) + Math.PI / 2;  // add 90 degrees so it points up

                directionDegrees = radianToDegree(headingRadians);
            }

            paths.push({
                targetPointId: targetPointId,
                directionDegrees: normalizeAngleDegrees(directionDegrees)
            });
        }
    }

    return paths;
}

module.exports = {
    getPointPaths
};
