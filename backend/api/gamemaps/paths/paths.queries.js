const pool = require('#sql/connection.js');

async function getConnectionsByPointId(pointId) {
    const query = `
        SELECT 
            point_connections.start_point_id, 
            point_connections.end_point_id,
            point_connections.direction_start_to_end,
            point_connections.direction_end_to_start,
            start_point.point_u AS start_u,
            start_point.point_v AS start_v,
            start_point.map_id AS start_map_id,
            end_point.point_u AS end_u,
            end_point.point_v AS end_v,
            end_point.map_id AS end_map_id,
            images.width AS map_width,
            images.height AS map_height
        FROM point_connections
            INNER JOIN points start_point ON (point_connections.start_point_id = start_point.point_id)
            INNER JOIN points end_point ON (point_connections.end_point_id = end_point.point_id)
            INNER JOIN map ON (start_point.map_id = map.map_id)
            LEFT JOIN images ON (map.image_id = images.image_id)
        WHERE point_connections.start_point_id = ? OR point_connections.end_point_id = ?
    `;
    const [rows] = await pool.execute(query, [pointId, pointId]);
    return rows;
}

module.exports = {
    getConnectionsByPointId
}
