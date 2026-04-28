const pool = require('#sql/connection.js');
const { isIdUpdateSuccessful } = require('#sql/db-utils.js');

async function insertMap(connection, title, gameMapId, imageId) {
    const query = `
        INSERT INTO map (title, game_maps_id, image_id)
        VALUES (?, ?, ?)
    `;
    const [result] = await connection.execute(query, [title, gameMapId, imageId]);
    return result.insertId;
}

async function getMapInfo(mapId) {
    const query = `
        SELECT map.title, map.game_maps_id
        FROM map
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    return rows.length > 0 ? rows[0] : null;
}

async function getMapsByGameMapId(gameMapId) {
    const query = `
        SELECT map.map_id, map.title
        FROM game_maps
            INNER JOIN map ON (game_maps.game_maps_id = map.game_maps_id)
        WHERE game_maps.game_maps_id = ?
    `;
    const [rows] = await pool.execute(query, [gameMapId]);
    return rows;
}

async function updateMapTitle(connection, mapId, title) {
    const query = `
        UPDATE map
        SET map.title = ?
        WHERE map.map_id = ?
    `;
    const [result] = await connection.execute(query, [title, mapId]);
    return isIdUpdateSuccessful(result);
}

async function getAllImageIdsForMap(connection, mapId) {
    const query = `
        SELECT DISTINCT images.image_id
        FROM map
            LEFT JOIN points ON (map.map_id = points.map_id)
            INNER JOIN images ON (points.image_id = images.image_id OR map.image_id = images.image_id)
        WHERE map.map_id = ?
    `;
    const [rows] = await connection.execute(query, [mapId]);
    return rows.length > 0 ? rows.map((row) => row.image_id) : [];
}

async function deleteMapById(connection, mapId) {
    const query = `
        DELETE FROM map
        WHERE map.map_id = ?
    `;
    const [result] = await connection.execute(query, [mapId]);
    return result.affectedRows == 1;
}

module.exports = {
    insertMap,
    getMapInfo,
    getMapsByGameMapId,
    updateMapTitle,
    getAllImageIdsForMap,
    deleteMapById
}
