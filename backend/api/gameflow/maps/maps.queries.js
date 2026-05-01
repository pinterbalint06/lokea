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

module.exports = { getAllMaps };
