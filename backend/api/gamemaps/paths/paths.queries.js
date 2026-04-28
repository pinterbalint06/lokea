const pool = require('#sql/connection.js');

async function getConnectionsByPointId(pointId) {
    const query = `
        SELECT point_connections.connection_id, point_connections.start_point_id, point_connections.end_point_id
        FROM point_connections
        WHERE ? IN (point_connections.start_point_id, point_connections.end_point_id)
    `;
    const [rows] = await pool.execute(query, [pointId]);
    return rows;
}

module.exports = {
    getConnectionsByPointId
}