const pool = require('#sql/connection.js');
const { isIdUpdateSuccessful } = require('#sql/db-utils.js');

async function insertConnection(connection, startPointId, endPointId, gameMapId, startToEndDirection, endToStartDirection) {
    const query = `
        INSERT INTO point_connections (start_point_id, end_point_id, game_maps_id, direction_start_to_end, direction_end_to_start)
        VALUES (?, ?, ?, ?, ?)
    `;
    const smallerId = Math.min(startPointId, endPointId);
    const largerId = Math.max(startPointId, endPointId);
    const [result] = await connection.execute(query, [smallerId, largerId, gameMapId, startToEndDirection, endToStartDirection]);
    return result.insertId;
}

async function getConnectionsByGameMapId(gameMapId) {
    const query = `
        SELECT
            point_connections.connection_id,
            point_connections.start_point_id,
            point_connections.end_point_id,
            start_point.map_id AS start_map_id,
            end_point.map_id AS end_map_id,
            point_connections.direction_start_to_end,
            point_connections.direction_end_to_start
        FROM point_connections
            INNER JOIN points AS start_point ON (start_point.point_id = point_connections.start_point_id)
            INNER JOIN points AS end_point ON (end_point.point_id = point_connections.end_point_id)
        WHERE point_connections.game_maps_id = ?
    `;
    const [rows] = await pool.execute(query, [gameMapId]);
    return rows;
}

async function updateConnectionDirections(connection, connectionId, dirStartToEnd, dirEndToStart) {
    const query = `
        UPDATE point_connections
        SET direction_start_to_end = COALESCE(?, direction_start_to_end),
            direction_end_to_start = COALESCE(?, direction_end_to_start)
        WHERE connection_id = ?
    `;
    const [result] = await connection.execute(query, [dirStartToEnd, dirEndToStart, connectionId]);
    return isIdUpdateSuccessful(result);
}

async function isConnectionCrossMap(connection, connectionId) {
    const query = `
        SELECT 
            start_point.map_id AS start_map_id,
            end_point.map_id AS end_map_id
        FROM point_connections
            INNER JOIN points start_point ON (start_point.point_id = point_connections.start_point_id)
            INNER JOIN points end_point ON (end_point.point_id = point_connections.end_point_id)
        WHERE point_connections.connection_id = ?
    `;
    const [rows] = await connection.execute(query, [connectionId]);
    return rows[0].start_map_id != rows[0].end_map_id;
}

async function arePointsInSameGameMap(connection, pointId1, pointId2, gameMapId) {
    const query = `
        SELECT COUNT(DISTINCT points.point_id) AS count
        FROM points
            INNER JOIN map ON (points.map_id = map.map_id)
        WHERE points.point_id IN (?, ?) 
          AND map.game_maps_id = ?;
    `;

    const [rows] = await connection.execute(query, [pointId1, pointId2, gameMapId]);

    return rows[0].count == 2;
}

async function arePointsInSameMap(connection, pointId1, pointId2) {
    const query = `
        SELECT COUNT(DISTINCT map_id) AS map_count
        FROM points
        WHERE point_id IN (?, ?);
    `;

    const [rows] = await connection.execute(query, [pointId1, pointId2]);

    return rows[0].map_count == 1;
}

async function doesConnectionAlreadyExist(connection, pointId1, pointId2) {
    const query = `
        SELECT 1
        FROM point_connections
        WHERE
            (point_connections.start_point_id, point_connections.end_point_id) IN ((?, ?), (?, ?))
        LIMIT 1
    `;
    const [rows] = await connection.execute(query, [pointId1, pointId2, pointId2, pointId1]);
    return rows.length == 1;
}

async function deleteConnectionById(connection, connectionId) {
    const query = `
        DELETE FROM point_connections
        WHERE point_connections.connection_id = ?
    `;
    const [result] = await connection.execute(query, [connectionId]);
    return result.affectedRows == 1;
}

module.exports = {
    insertConnection,
    getConnectionsByGameMapId,
    updateConnectionDirections,
    isConnectionCrossMap,
    arePointsInSameGameMap,
    arePointsInSameMap,
    doesConnectionAlreadyExist,
    deleteConnectionById
};
