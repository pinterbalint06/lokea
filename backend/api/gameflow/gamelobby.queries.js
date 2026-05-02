const pool = require('#sql/connection.js');

async function getGameMaps(sort = 'plays', user_id = null, offset = 0, filter = null) {
    const safeSort = String(sort).toLowerCase();
    const sortOrders = {
        created: 'game_maps.game_created DESC',
        rating: 'rating DESC',
        plays: 'plays DESC',
        favorites: 'game_maps.game_created DESC',
    };
    if (!sortOrders[safeSort]) throw new Error('INVALID_SORT');

    const isFavorites = safeSort === 'favorites';
    const isMine = filter === 'mine';

    const conditions = [];
    if (isFavorites) conditions.push('favorites.user_id = ?');
    if (isMine) conditions.push('game_maps.creator_id = ?');
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const query = `
        SELECT
            game_maps.game_maps_id, game_maps.creator_id, game_maps.title,
            game_maps.game_created, game_maps.game_description,
            COUNT(points.point_id) AS point_count,
            COALESCE((SELECT ROUND(AVG(gmc.rating), 1) FROM game_maps_comments gmc WHERE gmc.game_maps_id = game_maps.game_maps_id), 0) AS rating,
            (SELECT COUNT(*) FROM game_sessions gs WHERE gs.game_maps_id = game_maps.game_maps_id AND gs.finished_at IS NOT NULL) AS plays,
            CASE WHEN fav.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favorited
        FROM game_maps
            ${isFavorites ? 'INNER JOIN favorites ON game_maps.game_maps_id = favorites.game_maps_id' : ''}
            LEFT JOIN favorites fav ON (game_maps.game_maps_id = fav.game_maps_id AND fav.user_id = ?)
            LEFT JOIN map ON (game_maps.game_maps_id = map.game_maps_id)
            LEFT JOIN points ON (map.map_id = points.map_id)
        ${whereClause}
        GROUP BY game_maps.game_maps_id
        ORDER BY ${sortOrders[safeSort]}
        LIMIT 20 OFFSET ${offset}
    `;
    const params = [user_id];
    if (isFavorites) params.push(user_id);
    if (isMine) params.push(user_id);
    const [result] = await pool.execute(query, params);
    return result;
}

module.exports = { getGameMaps };
