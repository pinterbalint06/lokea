const pool = require('#sql/connection.js');

async function getGameMapDetails(gameMapID) {
    const query = `
        SELECT
            game_maps.creator_id,
            COALESCE(users.username, 'Ismeretlen felhasználó') AS creator_name,
            game_maps.title,
            COALESCE(
                (
                    SELECT ROUND(AVG(game_maps_comments.rating), 1)
                    FROM game_maps_comments
                    WHERE game_maps_comments.game_maps_id = ?
                ),
                0
            ) AS rating,
            (
                SELECT COUNT(*)
                FROM scores
                WHERE scores.game_maps_id = ?
            ) AS plays,
            game_maps.game_created,
            game_maps.game_description
        FROM game_maps
            LEFT JOIN users ON (game_maps.creator_id = users.user_id)
        WHERE game_maps.game_maps_id = ?
    `;
    const [rows] = await pool.execute(query, [gameMapID, gameMapID, gameMapID]);
    return rows.length > 0 ? rows[0] : null;
}

async function doesGameMapExist(gameMapId) {
    const query = `
        SELECT 1
        FROM game_maps
        WHERE game_maps.game_maps_id = ?
        LIMIT 1
    `;
    const [rows] = await pool.execute(query, [gameMapId]);
    return rows.length > 0;
}

module.exports = {
    getGameMapDetails,
    doesGameMapExist
}
