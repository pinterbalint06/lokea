const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'rootpassword',
    database: 'bigprojekt_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//!SQL Queries
// async function selectall() {
//     const query = 'SELECT * FROM exampletable;';
//     const [rows] = await pool.execute(query);
//     return rows;
// }

async function newUser(username, email, password) {
    let success = false;
    let error;
    const queryUserExistsCheck = 'SELECT email, username FROM users WHERE username LIKE ? OR email LIKE ?';
    let [result] = await pool.execute(queryUserExistsCheck, [username, email]);
    if (result.length == 0) {
        try {
            const queryInsertNewUser = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            [result] = await pool.execute(queryInsertNewUser, [username, email, password]);
            if (result.affectedRows == 1) {
                success = true;
            }
            else {
                error = "Failed insert";
            }
        } catch (fault) {
            if (fault.code == 'ER_DUP_ENTRY') {
                error = "User exists";
            }
            else {
                error = "Failed insert";
            }
        }
    }
    else {
        error = "User exists";
    }

    return success ? { success } : { success, error };
}

async function newUserFromAdmin(username, email, password, role, is_2fa) {
    let success = false;
    let error;
    const queryUserExistsCheck = 'SELECT email, username FROM users WHERE username LIKE ? OR email LIKE ?';
    let [result] = await pool.execute(queryUserExistsCheck, [username, email]);
    if (result.length == 0) {
        try {
            const queryInsertNewUser = 'INSERT INTO users (username, email, password, role, is_2fa) VALUES (?, ?, ?, ?, ?)';
            [result] = await pool.execute(queryInsertNewUser, [username, email, password, role, is_2fa]);
            if (result.affectedRows == 1) {
                success = true;
            }
            else {
                error = "Failed insert";
            }
        } catch (fault) {
            if (fault.code == 'ER_DUP_ENTRY') {
                error = "User exists";
            }
            else {
                error = "Failed insert";
            }
        }
    }
    else {
        error = "User exists";
    }

    return success ? { success } : { success, error };
}

async function getUserByUsername(username) {
    const query = 'SELECT users.password, users.user_id, users.role, users.deleted_at FROM users WHERE users.username = ?';
    const [result] = await pool.execute(query, [username]);
    return result;
}

async function getUserByEmail(email) {
    const query = 'SELECT users.password, users.user_id, users.role, users.deleted_at FROM users WHERE users.email = ?';
    const [result] = await pool.execute(query, [email]);
    return result;
}

async function getUsers() {
    const query = 'SELECT users.deleted_at, users.user_id, users.username, users.email, users.role FROM users';
    const [rows] = await pool.execute(query);
    return rows;
}

async function getUser(id) {
    const query = 'SELECT users.user_id, users.username, users.email, users.role, users.is_2fa, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
    const [result] = await pool.execute(query, [id]);
    return result;
}

async function sortedUsers(mireKeresek, mit, status, adminChecked, modChecked, userChecked) {
    let query = 'SELECT deleted_at, user_id, username, email, role FROM users';
    let conditions = [];
    let params = [];

    // 1. Keresés (ID, Username vagy Email alapján)
    // Csak akkor szűrünk, ha a 'mit' nem üres string
    if (mit && mit.trim() !== '') {
        // A 'mireKeresek' változó tartalmazza az oszlopnevet (id, username, email)
        // A biztonság kedvéért itt ellenőrizni kell az oszlopnevet, 
        // mert az oszlopnevek nem lehetnek paraméterek (?)
        const validColumns = ['user_id', 'username', 'email'];
        const targetColumn = validColumns.includes(mireKeresek) ? mireKeresek : 'username';

        conditions.push(`${targetColumn} LIKE ?`);
        params.push(`%${mit}%`);
    }

    // 2. Státusz szűrés
    // Ha üres string, akkor nem szűrünk (vagyis az összes jön)
    if (status && status !== '') {
        if (status === 'statusActive') {
            conditions.push('deleted_at IS NULL');
        } else {
            if (status === 'statusDeleted') {
                conditions.push('deleted_at IS NOT NULL');
            }
        }
    }

    // 3. Role szűrés (Checkboxok halmaza)
    let roles = [];
    if (adminChecked) roles.push('ADMIN');
    if (modChecked) roles.push('MODERATOR');
    if (userChecked) roles.push('USER');

    if (roles.length > 0) {
        // IN ('ADMIN', 'USER') formátum létrehozása
        const placeHolders = roles.map(() => '?').join(',');
        conditions.push(`role IN (${placeHolders})`);
        params.push(...roles);
    }

    // WHERE feltételek összefűzése, ha vannak
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    const [rows] = await pool.execute(query, params);
    return rows;
}

async function updateUser(user_id, username, email, role, is_2fa) {
    let query = 'UPDATE users ';
    let updates = [];
    let params = [];

    if (username != null) {
        updates.push('users.username = ?');
        params.push(username);
    }
    if (email != null) {
        updates.push('users.email = ?');
        params.push(email);
    }
    if (role != null) {
        updates.push('users.role = ?');
        params.push(role);
    }
    // if (pfp != null) {
    //     updates.push('users.pfp = ?');
    //     params.push(pfp);
    // }
    if (is_2fa != null) {
        updates.push('users.is_2fa = ?');
        params.push(is_2fa);
    }

    if (updates.length === 0) {
        throw new Error('Nincs frissítendő mező');
    }
    query += ' SET ' + updates.join(' , ');
    query += ` WHERE users.user_id = ?`;
    params.push(user_id);

    const [rows] = await pool.execute(query, params);
    return rows.affectedRows;
}

async function userToInactive(userId) {
    const query = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND deleted_at IS NULL';
    const [result] = await pool.execute(query, [userId]);
    return result.affectedRows;
}

async function uploadProfilePic(filepath, width, height, user_id) {
    //Régi profilkép elérési útvonala + id lekérése későbbi törlésre

    const queryGetLastImage = 'SELECT images.image_id, images.filepath FROM users LEFT JOIN images ON users.pfp = images.image_id WHERE users.user_id = ?'
    const [oldImageData] = await pool.execute(queryGetLastImage, [user_id]);

    let oldFilePath = oldImageData[0] ? oldImageData[0].filepath : null;
    let oldImageId = oldImageData[0] ? oldImageData[0].image_id : null;

    //Új profilkép adatainak feltöltése + users táblában az pfp frissitése
    const queryInsertNewPic = 'INSERT INTO images (filepath, width, height) VALUES (?, ?, ?)';
    let [id] = await pool.execute(queryInsertNewPic, [filepath, width, height]);
    const queryUpdatePfpId = 'UPDATE users SET pfp = ? WHERE user_id = ?';
    await pool.execute(queryUpdatePfpId, [id.insertId, user_id]);

    //Ha volt előtte egy másik profilkép, törli
    if (oldImageId != null) {
        const queryDeleteOldPic = 'DELETE FROM images WHERE image_id = ?';
        await pool.execute(queryDeleteOldPic, [oldImageId]);
    }

    //Visszaadja a régi kép elérési útvonalát, hogy törlésre kerülhessen. Amennyiben nem volt, null értéket ad vissza.
    return oldFilePath;
}

async function deleteProfilePic(user_id) {
    //Régi profilkép elérési útvonala + id lekérése a törlésre

    const queryGetLastImage = 'SELECT images.image_id, images.filepath FROM users LEFT JOIN images ON users.pfp = images.image_id WHERE users.user_id = ?'
    const [oldImageData] = await pool.execute(queryGetLastImage, [user_id]);

    let oldFilePath = oldImageData[0] ? oldImageData[0].filepath : null;
    let oldImageId = oldImageData[0] ? oldImageData[0].image_id : null;

    //Users táblában az adott felhasználónak a pfp-t NULL-ra állitja
    const queryUpdatePfpId = 'UPDATE users SET pfp = NULL WHERE user_id = ?';
    await pool.execute(queryUpdatePfpId, [user_id]);

    //Törlés az images táblából
    const queryDeleteOldPic = 'DELETE FROM images WHERE image_id = ?';
    await pool.execute(queryDeleteOldPic, [oldImageId]);

    //Visszaadja a régi kép elérési útvonalát a törléshez.
    return oldFilePath;
}


//Játékhoz szükséges ab adatok lekérése
async function getGameMaps(sort = 'plays', user_id = null, offset = 0) {
    const safeSort = String(sort).toLowerCase();
    const baseSelect = 'SELECT game_maps.game_maps_id, game_maps.creator_id, game_maps.title, game_maps.cover_image_id, game_maps.rating, game_maps.plays, game_maps.game_created, game_maps.game_description FROM game_maps';
    let query;
    let params = [offset];
    switch (safeSort) {
        case 'created':
            query = `${baseSelect} ORDER BY game_maps.game_created DESC`;
            break;
        case 'rating':
            query = `${baseSelect} ORDER BY game_maps.rating DESC`;
            break;
        case 'plays':
            query = `${baseSelect} ORDER BY game_maps.plays DESC`;
            break;
        case 'favorites':
            query = `${baseSelect} INNER JOIN favorites ON game_maps.game_maps_id = favorites.game_maps_id WHERE favorites.user_id = ? ORDER BY game_maps.game_created DESC`;
            params.unshift(user_id);
            break;
        default:
            throw new Error('INVALID_SORT');
    }
    query = `${query} LIMIT 20 OFFSET ${offset}`;
    const [result] = await pool.execute(query, params);
    return result;
}

async function getImagePath(image_id) {
    const query = 'SELECT images.filepath FROM images WHERE images.image_id = ?';
    const [result] = await pool.execute(query, [image_id]);
    let re;
    if (result.length === 0) {
        re = null;
    }
    else {
        re = result[0].filepath;
    }
    return re;
}

async function getConnection() {
    return await pool.getConnection();
}

async function insertImage(connection, width, height, filepath) {
    const query = `
        INSERT INTO images (width, height, filepath)
        VALUES (?, ?, ?)
    `;
    const [result] = await connection.execute(query, [width, height, filepath]);
    return result.insertId;
}

async function insertMap(connection, title, gameMapId, imageId) {
    const query = `
        INSERT INTO map (title, game_maps_id, image_id)
        VALUES (?, ?, ?)
    `;
    const [result] = await connection.execute(query, [title, gameMapId, imageId]);
    return result.insertId;
}

async function insertPoint(connection, mapId, u, v, northDirection, imageId) {
    const query = `
        INSERT INTO points (map_id, point_u, point_v, north_direction, image_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [mapId, u, v, northDirection, imageId]);
    return result.insertId;
}

async function insertConnection(connection, startPointId, endPointId, gameMapId) {
    const query = `
        INSERT INTO point_connections (start_point_id, end_point_id, game_maps_id)
        VALUES (?, ?, ?)
    `;
    const smallerId = Math.min(startPointId, endPointId);
    const largerId = Math.max(startPointId, endPointId);
    const [result] = await connection.execute(query, [smallerId, largerId, gameMapId]);
    return result.insertId;
}

async function updateImagePath(connection, imageId, filepath) {
    const query = `
        UPDATE images
        SET filepath = ?
        WHERE image_id = ?
    `;
    await connection.execute(query, [filepath, imageId]);
}

async function getMapImage(mapId) {
    const query = `
        SELECT images.image_id, images.filepath, images.width, images.height
        FROM map
            INNER JOIN images ON (map.image_id = images.image_id)
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    return rows[0];
}

async function getPointImage(pointId) {
    const query = `
        SELECT images.image_id, images.filepath, images.width, images.height 
        FROM points
            INNER JOIN images ON (points.image_id = images.image_id)
        WHERE points.point_id = ?
    `;
    const [rows] = await pool.execute(query, [pointId]);
    return rows[0];
}

async function getPointsOnMap(mapId) {
    const query = `
        SELECT points.point_id, points.point_u, points.point_v, points.north_direction 
        FROM map
            INNER JOIN points ON (map.map_id = points.map_id)
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    return rows;
}

async function getConnectionsByGameMapId(gameMapId) {
    const query = `
        SELECT
            point_connections.connection_id,
            point_connections.start_point_id,
            point_connections.end_point_id,
            start_point.map_id AS start_map_id,
            end_point.map_id AS end_map_id
        FROM point_connections
            INNER JOIN points AS start_point ON (start_point.point_id = point_connections.start_point_id)
            INNER JOIN points AS end_point ON (end_point.point_id = point_connections.end_point_id)
        WHERE point_connections.game_maps_id = ?
    `;
    const [rows] = await pool.execute(query, [gameMapId]);
    return rows;
}

async function getConnectionsByPointId(pointId) {
    const query = `
        SELECT point_connections.connection_id, point_connections.start_point_id, point_connections.end_point_id
        FROM point_connections
        WHERE ? IN (point_connections.start_point_id, point_connections.end_point_id)
    `;
    const [rows] = await pool.execute(query, [pointId]);
    return rows;
}

async function getPointInfo(pointId) {
    const query = `
        SELECT points.point_id, points.point_u, points.point_v, points.north_direction, map.map_id, game_maps.game_maps_id
        FROM points
            INNER JOIN map ON (map.map_id = points.map_id)
            INNER JOIN game_maps ON (game_maps.game_maps_id = map.game_maps_id)
        WHERE points.point_id = ?
    `;
    const [rows] = await pool.execute(query, [pointId]);
    return rows[0];
}

async function getPointOnMapByCoordinates(connection, mapId, u, v) {
    let query = `
        SELECT points.point_id
        FROM points
        WHERE points.map_id = ?
            AND points.point_u = ?
            AND points.point_v = ?
    `;
    const [rows] = await connection.execute(query, [mapId, u, v]);
    return rows;
}

async function getMapImageIdByMapId(mapId) {
    const query = `
        SELECT map.image_id, images.filepath
        FROM map
            INNER JOIN images ON (map.image_id = images.image_id)
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    let ret = null;
    if (rows.length > 0) {
        ret = rows[0].image_id;
    }
    return ret;
}

async function getMapInfo(mapId) {
    const query = `
        SELECT map.title, map.game_maps_id
        FROM map
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    return rows.length > 0 ? rows[0] : null;
}

async function getAllImageIdsForMap(connection, mapId) {
    const query = `
        SELECT DISTINCT images.image_id
        FROM map
            LEFT JOIN points ON (map.map_id = points.map_id)
            INNER JOIN images ON (points.image_id = images.image_id OR map.image_id = images.image_id)
        WHERE map.map_id = ?
    `;
    const [rows] = await connection.execute(query, [mapId]);
    return rows.length > 0 ? rows.map((row) => row.image_id) : [];
}

async function getMapsByGameMapId(gameMapId) {
    const query = `
        SELECT map.map_id, map.title
        FROM game_maps
            INNER JOIN map ON (game_maps.game_maps_id = map.game_maps_id)
        WHERE game_maps.game_maps_id = ?
    `;
    const [rows] = await pool.execute(query, [gameMapId]);
    return rows;
}

async function getGameMapIdByMapId(mapId) {
    const query = `
        SELECT map.game_maps_id
        FROM map
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    return rows.length > 0 ? rows[0].game_maps_id : null;
}

async function checkUserOwnsGameMap(userId, gameMapId) {
    const query = `
        SELECT COUNT(*) as count
        FROM game_maps
        WHERE game_maps.creator_id = ? AND game_maps.game_maps_id = ?
    `;
    const [rows] = await pool.execute(query, [userId, gameMapId]);
    return rows[0].count > 0;
}

async function checkUserOwnsMap(userId, mapId) {
    const query = `
        SELECT COUNT(*) as count
        FROM map
            INNER JOIN game_maps ON (map.game_maps_id = game_maps.game_maps_id)
        WHERE game_maps.creator_id = ? AND map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [userId, mapId]);
    return rows[0].count > 0;
}

async function checkUserOwnsPoint(userId, pointId) {
    const query = `
        SELECT COUNT(*) as count
        FROM points
            INNER JOIN map ON (points.map_id = map.map_id)
            INNER JOIN game_maps ON (map.game_maps_id = game_maps.game_maps_id)
        WHERE game_maps.creator_id = ? AND points.point_id = ?
    `;
    const [rows] = await pool.execute(query, [userId, pointId]);
    return rows[0].count > 0;
}

async function checkUserOwnsConnection(userId, connectionId) {
    const query = `
        SELECT COUNT(*) as count
        FROM point_connections
            INNER JOIN game_maps ON (point_connections.game_maps_id = game_maps.game_maps_id)
        WHERE game_maps.creator_id = ? AND point_connections.connection_id = ?
    `;
    const [rows] = await pool.execute(query, [userId, connectionId]);
    return rows[0].count > 0;
}

async function updatePointCoordinates(connection, pointId, u, v) {
    const query = `
        UPDATE points
        SET points.point_u = ?,
            points.point_v = ?
        WHERE points.point_id = ?
    `;
    const [result] = await connection.execute(query, [u, v, pointId]);
    return result.affectedRows == 1;
}

async function updatePointNorthDirection(connection, pointId, northDirection) {
    const query = `
        UPDATE points
        SET points.north_direction = ?
        WHERE points.point_id = ?
    `;
    const [result] = await connection.execute(query, [northDirection, pointId]);
    return result.affectedRows == 1;
}

async function updatePointImage(connection, pointId, imageId) {
    const query = `
        UPDATE points
        SET points.image_id = ?
        WHERE points.point_id = ?
    `;
    const [result] = await connection.execute(query, [imageId, pointId]);
    return result.affectedRows == 1;
}

async function updateMapTitle(connection, mapId, title) {
    const query = `
        UPDATE map
        SET map.title = ?
        WHERE map.map_id = ?
    `;
    const [result] = await connection.execute(query, [title, mapId]);
    return result.affectedRows;
}

async function deleteImageById(connection, imageId) {
    const query = `
        DELETE FROM images
        WHERE images.image_id = ?
    `;
    const [result] = await connection.execute(query, [imageId]);
    return result.affectedRows == 1;
}

async function arePointsInSameGameMap(connection, pointId1, pointId2) {
    const query = `
            SELECT COUNT(*) as count 
            FROM points points1
                INNER JOIN map map1 ON (points1.map_id = map1.map_id)
                INNER JOIN points points2 ON (points2.point_id = ?)
                INNER JOIN map map2 ON (points2.map_id = map2.map_id)
            WHERE points1.point_id = ?
                AND map1.game_maps_id = map2.game_maps_id;
    `;
    const [rows] = await connection.execute(query, [pointId1, pointId2]);
    return rows[0].count == 1;
}

async function doesConnectionAlreadyExist(connection, pointId1, pointId2) {
    const query = `
        SELECT COUNT(*) as count 
        FROM point_connections
        WHERE
            (point_connections.start_point_id, point_connections.end_point_id) IN ((?, ?), (?, ?))
    `;
    const [rows] = await connection.execute(query, [pointId1, pointId2, pointId2, pointId1]);
    return rows[0].count == 1;
}

async function deletePointById(connection, pointId) {
    const query = `
        DELETE FROM points
        WHERE points.point_id = ?
    `;
    const [result] = await connection.execute(query, [pointId]);
    return result.affectedRows == 1;
}

async function deleteMapById(connection, mapId) {
    const query = `
        DELETE FROM map
        WHERE map.map_id = ?
    `;
    const [result] = await connection.execute(query, [mapId]);
    return result.affectedRows == 1;
}

async function deleteConnectionById(connection, connectionId) {
    const query = `
        DELETE FROM point_connections
        WHERE point_connections.connection_id = ?
    `;
    const [result] = await connection.execute(query, [connectionId]);
    return result.affectedRows == 1;
}

//!Export
module.exports = {
    // selectall,
    getConnection,
    insertImage,
    insertMap,
    insertPoint,
    insertConnection,
    updateImagePath,
    getMapImage,
    getPointImage,
    getPointsOnMap,
    getConnectionsByGameMapId,
    getConnectionsByPointId,
    getMapsByGameMapId,
    getGameMapIdByMapId,
    checkUserOwnsGameMap,
    checkUserOwnsMap,
    checkUserOwnsPoint,
    checkUserOwnsConnection,
    updatePointCoordinates,
    updatePointImage,
    updatePointNorthDirection,
    updateMapTitle,
    deleteImageById,
    getPointInfo,
    getPointOnMapByCoordinates,
    newUser,
    newUserFromAdmin,
    getUserByUsername,
    getUserByEmail,
    arePointsInSameGameMap,
    doesConnectionAlreadyExist,
    deletePointById,
    deleteMapById,
    deleteConnectionById,
    getUsers,
    getUser,
    sortedUsers,
    updateUser,
    userToInactive,
    uploadProfilePic,
    deleteProfilePic,
    getGameMaps,
    getImagePath,
    getMapImageIdByMapId,
    getMapInfo,
    getAllImageIdsForMap
};
