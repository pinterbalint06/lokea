const pool = require('#sql/connection.js');
const { isIdUpdateSuccessful } = require('#sql/db-utils.js');

async function insertPoint(connection, mapId, u, v, northDirection, imageId) {
    const query = `
        INSERT INTO points (map_id, point_u, point_v, north_direction, image_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [mapId, u, v, northDirection, imageId]);
    return result.insertId;
}

async function getPointsOnMap(mapId) {
    const query = `
        SELECT points.point_id, points.point_u, points.point_v, points.north_direction 
        FROM map
            INNER JOIN points ON (map.map_id = points.map_id)
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    return rows;
}

async function getPointInfo(pointId) {
    const query = `
        SELECT points.point_id, points.point_u, points.point_v, points.north_direction, map.map_id, game_maps.game_maps_id
        FROM points
            INNER JOIN map ON (map.map_id = points.map_id)
            INNER JOIN game_maps ON (game_maps.game_maps_id = map.game_maps_id)
        WHERE points.point_id = ?
    `;
    const [rows] = await pool.execute(query, [pointId]);
    return rows[0];
}

async function getPointOnMapByCoordinates(connection, mapId, u, v) {
    let query = `
        SELECT points.point_id
        FROM points
        WHERE points.map_id = ?
            AND points.point_u = ?
            AND points.point_v = ?
    `;
    const [rows] = await connection.execute(query, [mapId, u, v]);
    return rows;
}

async function getGameMapIdByMapId(mapId) {
    const query = `
        SELECT map.game_maps_id
        FROM map
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    return rows.length > 0 ? rows[0].game_maps_id : null;
}

async function updatePointCoordinates(connection, pointId, u, v) {
    const query = `
        UPDATE points
        SET points.point_u = ?,
            points.point_v = ?
        WHERE points.point_id = ?
    `;
    const [result] = await connection.execute(query, [u, v, pointId]);
    return isIdUpdateSuccessful(result);
}

async function updatePointNorthDirection(connection, pointId, northDirection) {
    const query = `
        UPDATE points
        SET points.north_direction = ?
        WHERE points.point_id = ?
    `;
    const [result] = await connection.execute(query, [northDirection, pointId]);
    return isIdUpdateSuccessful(result);
}

async function updatePointImage(connection, pointId, imageId) {
    const query = `
        UPDATE points
        SET points.image_id = ?
        WHERE points.point_id = ?
    `;
    const [result] = await connection.execute(query, [imageId, pointId]);
    return isIdUpdateSuccessful(result);
}

async function deletePointById(connection, pointId) {
    const query = `
        DELETE FROM points
        WHERE points.point_id = ?
    `;
    const [result] = await connection.execute(query, [pointId]);
    return result.affectedRows == 1;
}

module.exports = {
    insertPoint,
    getPointsOnMap,
    getPointInfo,
    getPointOnMapByCoordinates,
    getGameMapIdByMapId,
    updatePointCoordinates,
    updatePointNorthDirection,
    updatePointImage,
    deletePointById
}
