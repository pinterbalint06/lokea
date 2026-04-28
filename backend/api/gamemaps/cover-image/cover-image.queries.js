const pool = require('#sql/connection.js');
const { isIdUpdateSuccessful } = require('#sql/db-utils.js');

async function getGameMapCoverImage(gameMapId) {
    const query = `
        SELECT images.image_id, images.filepath, images.width, images.height
        FROM game_maps
            INNER JOIN images ON (game_maps.cover_image_id = images.image_id)
        WHERE game_maps.game_maps_id = ?
    `;
    const [rows] = await pool.execute(query, [gameMapId]);
    return rows.length > 0 ? rows[0] : null;
}

async function updateGameMapCoverImage(connection, gameMapId, imageId) {
    const query = `
        UPDATE game_maps
        SET game_maps.cover_image_id = ?
        WHERE game_maps.game_maps_id = ?
    `;
    const [result] = await connection.execute(query, [imageId, gameMapId]);
    return isIdUpdateSuccessful(result);
}

module.exports = {
    getGameMapCoverImage,
    updateGameMapCoverImage
}