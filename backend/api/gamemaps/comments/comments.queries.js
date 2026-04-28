const pool = require('#sql/connection.js');
const { isIdUpdateSuccessful } = require('#sql/db-utils.js');

async function getGameMapComments(gameMapId, page) {
    const safePage = Number.isInteger(Number(page)) && page > 0 ? page : 1;
    const offset = (safePage - 1) * 50;
    const query = `
        SELECT 
            COALESCE(users.username, 'Ismeretlen felhasználó') AS username,
            game_maps_comments.rating,
            game_maps_comments.comment_text,
            game_maps_comments.created_at
        FROM game_maps_comments
            LEFT JOIN users ON (game_maps_comments.user_id = users.user_id)
        WHERE game_maps_comments.game_maps_id = ?
        ORDER BY game_maps_comments.created_at DESC
        LIMIT 50 OFFSET ${offset}
    `;
    const [rows] = await pool.execute(query, [gameMapId]);
    return rows;
}

async function getGameMapCommentCount(gameMapId) {
    const query = `
        SELECT 
            COUNT(*) AS comment_count
        FROM game_maps_comments
        WHERE game_maps_comments.game_maps_id = ?
    `;
    const [rows] = await pool.execute(query, [gameMapId]);
    return rows[0].comment_count;
}

async function hasUserCommentedOnGameMap(gameMapId, userId) {
    const query = `
        SELECT COUNT(*) AS comment_count
        FROM game_maps_comments
        WHERE game_maps_comments.game_maps_id = ?
          AND game_maps_comments.user_id = ?
    `;
    const [rows] = await pool.execute(query, [gameMapId, userId]);
    return rows[0].comment_count > 0;
}

async function insertGameMapComment(connection, gameMapId, userId, commentText, rating) {
    const query = `
        INSERT INTO game_maps_comments (game_maps_id, user_id, comment_text, rating)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [gameMapId, userId, commentText, rating]);
    return result.insertId;
}

async function getUserCommentOnGameMap(gameMapId, userId) {
    const query = `
        SELECT game_maps_comments.comment_id, game_maps_comments.comment_text, game_maps_comments.rating, game_maps_comments.created_at
        FROM game_maps_comments
        WHERE game_maps_id = ? AND user_id = ?
    `;
    const [rows] = await pool.execute(query, [gameMapId, userId]);
    return rows[0] || null;
}

async function updateUserCommentOnGameMap(connection, gameMapId, userId, commentText, rating) {
    const query = `
        UPDATE game_maps_comments
        SET game_maps_comments.comment_text = ?, game_maps_comments.rating = ?
        WHERE game_maps_comments.game_maps_id = ? AND game_maps_comments.user_id = ?
    `;
    const [result] = await connection.execute(query, [commentText, rating, gameMapId, userId]);

    return isIdUpdateSuccessful(result);
}

async function deleteUserCommentOnGameMap(connection, gameMapId, userId) {
    const query = `
        DELETE FROM game_maps_comments
        WHERE game_maps_comments.game_maps_id = ? AND game_maps_comments.user_id = ?
    `;
    const [result] = await connection.execute(query, [gameMapId, userId]);
    return result.affectedRows == 1;
}

module.exports = {
    getGameMapComments,
    getGameMapCommentCount,
    hasUserCommentedOnGameMap,
    insertGameMapComment,
    getUserCommentOnGameMap,
    updateUserCommentOnGameMap,
    deleteUserCommentOnGameMap
}