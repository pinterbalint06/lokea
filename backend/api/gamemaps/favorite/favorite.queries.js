const pool = require('#sql/connection.js');

async function isUserFavorite(gameMapId, userId) {
    const query = `
        SELECT 1
        FROM favorites
        WHERE favorites.game_maps_id = ? AND favorites.user_id = ?
        LIMIT 1
    `;
    const [rows] = await pool.execute(query, [gameMapId, userId]);
    return rows.length > 0;
}

async function insertFavorite(connection, gameMapId, userId) {
    const query = `
        INSERT INTO favorites (game_maps_id, user_id)
        VALUES (?, ?)
    `;
    await connection.execute(query, [gameMapId, userId]);
}

async function deleteFavorite(connection, gameMapId, userId) {
    const query = `
        DELETE FROM favorites
        WHERE favorites.game_maps_id = ? AND favorites.user_id = ?
    `;
    const [result] = await connection.execute(query, [gameMapId, userId]);
    return result.affectedRows === 1;
}

module.exports = {
    isUserFavorite,
    insertFavorite,
    deleteFavorite
};
