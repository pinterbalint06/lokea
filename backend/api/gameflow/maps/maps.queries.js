const pool = require('#sql/connection.js');

async function getAllMaps(gameMapId) {
    const query = `
        SELECT map.map_id, map.title, images.width, images.height
        FROM map
            INNER JOIN images ON map.image_id = images.image_id
        WHERE map.game_maps_id = ?
    `;
    const [result] = await pool.execute(query, [gameMapId]);
    return result;
}

async function getMapDimensions(mapId) {
    const query = `
        SELECT images.width, images.height
        FROM map
            INNER JOIN images ON map.image_id = images.image_id
        WHERE map.map_id = ?
    `;
    const [result] = await pool.execute(query, [mapId]);
    return result[0] || null;
}

module.exports = { getAllMaps, getMapDimensions };
