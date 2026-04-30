const pool = require('./connection.js');

async function getConnection() {
    return await pool.getConnection();
}

async function getGameMaps(sort = 'plays', user_id = null, offset = 0) {
    const safeSort = String(sort).toLowerCase();
    const sortOrders = {
        created: 'game_maps.game_created DESC',
        rating: 'rating DESC',
        plays: 'plays DESC',
        favorites: 'game_maps.game_created DESC',
    };
    if (!sortOrders[safeSort]) throw new Error('INVALID_SORT');

    const isFavorites = safeSort === 'favorites';
    const query = `
        SELECT
            game_maps.game_maps_id, game_maps.creator_id, game_maps.title, game_maps.cover_image_id,
            game_maps.game_created, game_maps.game_description,
            COUNT(points.point_id) AS point_count,
            COALESCE((SELECT ROUND(AVG(gmc.rating), 1) FROM game_maps_comments gmc WHERE gmc.game_maps_id = game_maps.game_maps_id), 0) AS rating,
            (SELECT COUNT(*) FROM game_sessions gs WHERE gs.game_maps_id = game_maps.game_maps_id AND gs.finished_at IS NOT NULL) AS plays
        FROM game_maps
            ${isFavorites ? 'INNER JOIN favorites ON game_maps.game_maps_id = favorites.game_maps_id' : ''}
            LEFT JOIN map ON (game_maps.game_maps_id = map.game_maps_id)
            LEFT JOIN points ON (map.map_id = points.map_id)
        ${isFavorites ? 'WHERE favorites.user_id = ?' : ''}
        GROUP BY game_maps.game_maps_id
        ORDER BY ${sortOrders[safeSort]}
        LIMIT 20 OFFSET ${offset}
    `;
    const [result] = await pool.execute(query, isFavorites ? [user_id] : []);
    return result;
}

async function getImagePath(image_id) {
    const query = 'SELECT images.filepath FROM images WHERE images.image_id = ?';
    const [result] = await pool.execute(query, [image_id]);
    if (result.length === 0) {
        return null;
    }
    return result[0].filepath;
}

async function getGameTitleById(gameMapId) {
    const query = `
        SELECT game_maps.title
        FROM game_maps
        WHERE game_maps.game_maps_id = ?
    `;
    const [result] = await pool.execute(query, [gameMapId]);
    return result.length > 0 ? result[0].title : null;
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

async function getRandomPoint(gameMapId, gameSessionId) {
    const query = `
        SELECT points.point_id, points.point_u, points.point_v, points.north_direction, images.image_id, images.filepath, images.width, images.height, map.map_id
        FROM points
            INNER JOIN images ON points.image_id = images.image_id
            INNER JOIN map ON map.map_id = points.map_id
        WHERE map.game_maps_id =  ?
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

async function getAllMaps(gameMapId) {
    const query = `
        SELECT map.map_id, map.title, images.image_id, images.filepath, images.width, images.height
        FROM map
            INNER JOIN images ON map.image_id = images.image_id
        WHERE map.game_maps_id = ?
    `;
    const [result] = await pool.execute(query, [gameMapId]);
    return result;
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

async function incrementCurrentRound(connection, sessionId) {
    const query = `
        UPDATE game_sessions
        SET current_round = current_round + 1
        WHERE session_id = ?
    `;
    const [result] = await connection.execute(query, [sessionId]);
    return result;
}

async function saveGuess(connection, sessionId, pointId, mapId, guessu, guessv, distanceError, score, cycle, round) {
    const query = `
        INSERT INTO session_guesses (session_id, point_id, map_id, guessed_u, guessed_v, distance_error, points_awarded, cycle, round)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [sessionId, pointId, mapId, guessu, guessv, distanceError, score, cycle, round]);
    return result.insertId;
}

async function totalScore(sessionId) {
    const query = `
        SELECT SUM(points_awarded) AS total_score
        FROM session_guesses
        WHERE session_id = ?
    `;
    const [result] = await pool.execute(query, [sessionId]);
    return result[0].total_score || 0;
}

async function getCurrentPointId(sessionId) {
    const query = `SELECT current_point_id FROM game_sessions WHERE session_id = ?`;
    const [result] = await pool.execute(query, [sessionId]);
    return result[0]?.current_point_id ?? null;
}

async function getPointById(pointId) {
    const query = `
        SELECT points.point_id, points.point_u, points.point_v, points.north_direction,
               images.image_id, images.filepath, images.width, images.height, map.map_id
        FROM points
            INNER JOIN images ON points.image_id = images.image_id
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

async function clearCurrentPoint(connection, sessionId) {
    const query = `UPDATE game_sessions SET current_point_id = NULL WHERE session_id = ?`;
    await connection.execute(query, [sessionId]);
}

module.exports = {
    getConnection,
    getGameMaps,
    getImagePath,
    getGameTitleById,
    insertGameSession,
    selectLatestActiveGameSession,
    finishGameSession,
    getRandomPoint,
    getAllMaps,
    incrementCycle,
    incrementCurrentRound,
    saveGuess,
    totalScore,
    getCurrentPointId,
    getPointById,
    setCurrentPoint,
    clearCurrentPoint
};
