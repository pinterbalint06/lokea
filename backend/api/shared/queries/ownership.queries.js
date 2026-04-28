const pool = require('#sql/connection.js');

async function checkUserOwnsGameMap(userId, gameMapId) {
    const query = `
        SELECT 1
        FROM game_maps
        WHERE game_maps.creator_id = ? AND game_maps.game_maps_id = ?
        LIMIT 1
    `;
    const [rows] = await pool.execute(query, [userId, gameMapId]);
    return rows.length > 0;
}

async function checkUserOwnsMap(userId, mapId) {
    const query = `
        SELECT 1
        FROM map
            INNER JOIN game_maps ON (map.game_maps_id = game_maps.game_maps_id)
        WHERE game_maps.creator_id = ? AND map.map_id = ?
        LIMIT 1
    `;
    const [rows] = await pool.execute(query, [userId, mapId]);
    return rows.length > 0;
}

async function checkUserOwnsPoint(userId, pointId) {
    const query = `
        SELECT 1
        FROM points
            INNER JOIN map ON (points.map_id = map.map_id)
            INNER JOIN game_maps ON (map.game_maps_id = game_maps.game_maps_id)
        WHERE game_maps.creator_id = ? AND points.point_id = ?
        LIMIT 1
    `;
    const [rows] = await pool.execute(query, [userId, pointId]);
    return rows.length > 0;
}

async function checkUserOwnsConnection(userId, connectionId) {
    const query = `
        SELECT 1
        FROM point_connections
            INNER JOIN game_maps ON (point_connections.game_maps_id = game_maps.game_maps_id)
        WHERE game_maps.creator_id = ? AND point_connections.connection_id = ?
        LIMIT 1
    `;
    const [rows] = await pool.execute(query, [userId, connectionId]);
    return rows.length > 0;
}

module.exports = {
    checkUserOwnsGameMap,
    checkUserOwnsMap,
    checkUserOwnsPoint,
    checkUserOwnsConnection
}
