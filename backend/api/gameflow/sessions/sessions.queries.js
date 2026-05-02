const pool = require('#sql/connection.js');

async function getGameInfoById(gameMapId) {
    const query = `
        SELECT
             game_maps.title,
             (
                 SELECT map.map_id
                 FROM map
                 WHERE map.game_maps_id = game_maps.game_maps_id
                 LIMIT 1
             ) AS map_id,
             (
                 SELECT points.point_id
                 FROM map
                 INNER JOIN points ON map.map_id = points.map_id
                 WHERE map.game_maps_id = game_maps.game_maps_id
                 LIMIT 1
             ) AS point_id
         FROM game_maps
         WHERE game_maps.game_maps_id = ?
         LIMIT 1
    `;
    const [result] = await pool.execute(query, [gameMapId]);
    return result.length > 0 ? result[0] : null;
}

async function insertGameSession(userId, rounds, roundTime, gameMapId, sharpness) {
    const query = 'INSERT INTO game_sessions (user_id, game_maps_id, rounds, sharpness, time_per_round) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [userId, gameMapId, rounds, sharpness, roundTime]);
    return result.insertId;
}

async function selectLatestActiveGameSession(userId) {
    const query = `
        SELECT game_maps.title, game_sessions.session_id, game_sessions.game_maps_id, game_sessions.current_cycle, game_sessions.sharpness, game_sessions.rounds, game_sessions.current_round, game_sessions.time_per_round
        FROM game_sessions
            INNER JOIN game_maps ON game_sessions.game_maps_id = game_maps.game_maps_id
        WHERE game_sessions.user_id = ? AND game_sessions.finished_at IS NULL
        ORDER BY game_sessions.session_id DESC
        LIMIT 1;
    `;
    const [result] = await pool.execute(query, [userId]);
    return result.length > 0 ? result[0] : null;
}

async function finishGameSession(sessionId) {
    const query = `
        UPDATE game_sessions
        SET finished_at = CURRENT_TIMESTAMP
        WHERE session_id = ? AND finished_at IS NULL`;
    const [result] = await pool.execute(query, [sessionId]);
    return result;
}

module.exports = { getGameInfoById, insertGameSession, selectLatestActiveGameSession, finishGameSession };
