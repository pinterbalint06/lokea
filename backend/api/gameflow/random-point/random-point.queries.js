const pool = require('#sql/connection.js');

async function getRandomPoint(gameMapId, gameSessionId) {
    const query = `
        SELECT points.point_id, points.point_u, points.point_v, map.map_id
        FROM points
            INNER JOIN map ON map.map_id = points.map_id
        WHERE map.game_maps_id = ?
        AND points.point_id NOT IN (
            SELECT session_guesses.point_id
            FROM session_guesses
                INNER JOIN game_sessions ON session_guesses.session_id = game_sessions.session_id
            WHERE session_guesses.session_id = ? AND session_guesses.cycle = game_sessions.current_cycle
            )
        ORDER BY RAND()
        LIMIT 1;
    `;
    const [result] = await pool.execute(query, [gameMapId, gameSessionId]);
    return result[0];
}

async function getCurrentPointId(sessionId) {
    const query = `SELECT current_point_id FROM game_sessions WHERE session_id = ?`;
    const [result] = await pool.execute(query, [sessionId]);
    return result[0]?.current_point_id ?? null;
}

async function getPointById(pointId) {
    const query = `
        SELECT points.point_id, points.point_u, points.point_v, map.map_id
        FROM points
            INNER JOIN map ON map.map_id = points.map_id
        WHERE points.point_id = ?
    `;
    const [result] = await pool.execute(query, [pointId]);
    return result[0];
}

async function setCurrentPoint(sessionId, pointId) {
    const query = `UPDATE game_sessions SET current_point_id = ? WHERE session_id = ?`;
    await pool.execute(query, [pointId, sessionId]);
}

async function incrementCycle(sessionId) {
    const query = `
        UPDATE game_sessions
        SET current_cycle = current_cycle + 1
        WHERE session_id = ?
    `;
    const [result] = await pool.execute(query, [sessionId]);
    return result;
}

module.exports = { getRandomPoint, getCurrentPointId, getPointById, setCurrentPoint, incrementCycle };
