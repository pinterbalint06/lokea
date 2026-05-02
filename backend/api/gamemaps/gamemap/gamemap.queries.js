const pool = require('#sql/connection.js');
const { isIdUpdateSuccessful } = require('#sql/db-utils.js');

async function getTopScoresForGameMap(gameMapID) {
    const query = `
        SELECT 
            COALESCE(users.username, 'Ismeretlen felhasználó') AS username,
            SUM(session_guesses.points_awarded) AS score,
            game_sessions.finished_at AS score_time
        FROM game_sessions
            LEFT JOIN session_guesses ON (game_sessions.session_id = session_guesses.session_id)
            LEFT JOIN users ON (game_sessions.user_id = users.user_id)
        WHERE game_sessions.game_maps_id = ? AND game_sessions.finished_at IS NOT NULL
        GROUP BY game_sessions.session_id
        ORDER BY score DESC
        LIMIT 5
    `;
    const [rows] = await pool.execute(query, [gameMapID]);
    return rows;
}

async function createGameMap(userId) {
    const query = `
        INSERT INTO game_maps (creator_id)
        VALUES (?)
    `;
    const [result] = await pool.execute(query, [userId]);
    return result.insertId;
}

async function updateGameMapDetails(connection, gameMapId, title, description) {
    const query = `
        UPDATE game_maps
        SET game_maps.title = COALESCE(?, game_maps.title),
            game_maps.game_description = COALESCE(?, game_maps.game_description)
        WHERE game_maps.game_maps_id = ?
    `;
    const [result] = await connection.execute(query, [title, description, gameMapId]);
    return isIdUpdateSuccessful(result);
}

async function getAllImageIdsForGameMap(connection, gameMapId) {
    const query = `
        SELECT DISTINCT images.image_id
        FROM game_maps
            LEFT JOIN map ON (game_maps.game_maps_id = map.game_maps_id)
            LEFT JOIN points ON (map.map_id = points.map_id)
            INNER JOIN images ON (points.image_id = images.image_id OR map.image_id = images.image_id OR game_maps.cover_image_id = images.image_id)
        WHERE game_maps.game_maps_id = ?
    `;
    const [rows] = await connection.execute(query, [gameMapId]);
    return rows.length > 0 ? rows.map((row) => row.image_id) : [];
}

async function deleteGameMapById(connection, gameMapId) {
    const query = `
        DELETE FROM game_maps
        WHERE game_maps.game_maps_id = ?
    `;
    const [result] = await connection.execute(query, [gameMapId]);
    return result.affectedRows == 1;
}

module.exports = {
    getTopScoresForGameMap,
    createGameMap,
    updateGameMapDetails,
    getAllImageIdsForGameMap,
    deleteGameMapById
};
