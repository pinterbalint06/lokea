const pool = require('#sql/connection.js');

async function getMapImage(mapId) {
    const query = `
        SELECT images.image_id, images.filepath, images.width, images.height
        FROM map
            INNER JOIN images ON (map.image_id = images.image_id)
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    return rows[0];
}

async function getPointImage(pointId) {
    const query = `
        SELECT images.image_id, images.filepath, images.width, images.height, points.north_direction
        FROM points
            INNER JOIN images ON (points.image_id = images.image_id)
        WHERE points.point_id = ?
    `;
    const [rows] = await pool.execute(query, [pointId]);
    return rows[0];
}

module.exports = {
    getMapImage,
    getPointImage
}