const pool = require('./connection.js');
const bcrypt = require('bcrypt');


//!SQL Queries

async function newUser(username, email, password) {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const queryInsertNewUser = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const [result] = await connection.execute(queryInsertNewUser, [username, email, password]);

        if (result.affectedRows === 0) {
            throw new Error("Beszúrás sikertelen, nulla érintett sor.");
        }
        await connection.commit();
        return { success: true, insertId: result.insertId };
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, error: "A felhasználónév vagy az e-mail cím már foglalt!" };
        }
        console.error('DB hiba a newUser során: ', error);
        return { success: false, error: "Hiba történt a regisztráció során!" };
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function getUserByUsername(username) {
    try {
        const query = 'SELECT users.username, users.password, users.user_id, users.role, users.deleted_at, users.language FROM users WHERE users.username = ?';
        const [result] = await pool.execute(query, [username]);
        return result;
    } catch (error) {
        console.error('DB hiba getUserByUsername: ', error);
        throw error;
    }
}

async function getUserByEmail(email) {
    try {
        const query = 'SELECT users.username, users.password, users.user_id, users.role, users.deleted_at, users.language FROM users WHERE users.email = ?';
        const [result] = await pool.execute(query, [email]);
        return result;
    } catch (error) {
        console.error('DB hiba getUserByEmail: ', error);
        throw error;
    }

}

async function getUser(id) {
    const query = 'SELECT users.user_id, users.username, users.email, users.role, users.is_2fa, users.darkmode, users.language, users.created_at, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
    const [result] = await pool.execute(query, [id]);
    return result;
}

async function getUserNameProfile(user_id) {
    try {
        const query = 'SELECT users.username, users.darkmode, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
        const [result] = await pool.execute(query, [user_id]);
        return result;
    } catch (error) {
        console.error('DB hiba getUserNameProfile: ', error);
        throw error;
    }

}

async function updateUser(user_id, username, email, language, darkmode) {
    let query = 'UPDATE users ';
    let updates = [];
    let params = [];
    let updatedCount = 0;

    if (username != null) {
        updates.push('users.username = ?');
        params.push(username);
    }
    if (email != null) {
        updates.push('users.email = ?');
        params.push(email);
    }
    if (language != null) {
        updates.push('users.language = ?');
        params.push(language);
    }
    if (darkmode != null) {
        updates.push('users.darkmode = ?');
        params.push(darkmode);
    }

    if (updates.length !== 0) {
        query += ' SET ' + updates.join(' , ');
        query += ` WHERE users.user_id = ?`;
        params.push(user_id);
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const [rows] = await connection.execute(query, params);
            await connection.commit();
            updatedCount = rows.affectedRows;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('DB hiba updateUser: ', error);
            throw error;
        }
        finally {
            if (connection) connection.release();
        }
    }
    return updatedCount;
}

async function updatePassword(user_id, oldPass, newPass) {
    let connection;
    try {
        const getPasswordQuery = 'SELECT users.username, users.email, users.password FROM users WHERE users.user_id = ?';
        const [result] = await pool.execute(getPasswordQuery, [user_id]);

        if (result.length == 0) {
            throw new Error('Felhasználó nem található!');
        }
        let egyezes = await bcrypt.compare(oldPass, result[0].password);
        if (!egyezes) {
            throw new Error('Nem ez a régi jelszavad!');
        }
        const hashedPassword = await bcrypt.hash(newPass, 10);
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const passwordUpdateQuery = 'UPDATE users SET password = ? WHERE user_id = ?';
        await connection.execute(passwordUpdateQuery, [hashedPassword, user_id]);
        await connection.commit();
        return { username: result[0].username, email: result[0].email };
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Hiba az updatePassword során:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

async function userToInactive(user_id) {
    let connection;
    try {
        const getUserQuery = 'SELECT users.username, users.email FROM users WHERE users.user_id = ?';
        const [userResult] = await pool.execute(getUserQuery, [user_id]);
        if (userResult.length == 0) {
            throw new Error('Felhasználó nem található!');
        }
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const query = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND deleted_at IS NULL';
        const [result] = await connection.execute(query, [user_id]);
        await connection.commit();
        return { username: userResult[0].username, email: userResult[0].email };
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Hiba az userToInactive során:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

async function uploadProfilePic(filepath, width, height, user_id) {
    let connection;
    try {
        const queryGetLastImage = 'SELECT images.image_id, images.filepath FROM users LEFT JOIN images ON users.pfp = images.image_id WHERE users.user_id = ?'
        const [oldImageData] = await pool.execute(queryGetLastImage, [user_id]);

        if (oldImageData.length === 0) {
            throw new Error('Felhasználó nem található!');
        }

        let oldFilePath = oldImageData[0] ? oldImageData[0].filepath : null;
        let oldImageId = oldImageData[0] ? oldImageData[0].image_id : null;

        connection = await pool.getConnection();
        await connection.beginTransaction();
        const queryInsertNewPic = 'INSERT INTO images (filepath, width, height) VALUES (?, ?, ?)';
        const [pictureInsertResult] = await connection.execute(queryInsertNewPic, [filepath, width, height]);
        const queryUpdatePfpId = 'UPDATE users SET pfp = ? WHERE user_id = ?';
        await connection.execute(queryUpdatePfpId, [pictureInsertResult.insertId, user_id])
        if (oldImageId != null) {
            const queryDeleteOldPic = 'DELETE FROM images WHERE image_id = ?';
            await connection.execute(queryDeleteOldPic, [oldImageId]);
        }
        await connection.commit();
        return oldFilePath;
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('DB hiba uploadProfilePic: ', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

async function deleteProfilePic(user_id) {
    let connection;
    try {
        const queryGetLastImage = 'SELECT images.image_id, images.filepath FROM users LEFT JOIN images ON users.pfp = images.image_id WHERE users.user_id = ?'
        const [oldImageData] = await pool.execute(queryGetLastImage, [user_id]);

        if (oldImageData.length === 0) {
            throw new Error('Felhasználó nem található!');
        }

        let oldFilePath = oldImageData[0] ? oldImageData[0].filepath : null;
        let oldImageId = oldImageData[0] ? oldImageData[0].image_id : null;

        connection = await pool.getConnection();
        await connection.beginTransaction();
        const queryDeleteOldPic = 'DELETE FROM images WHERE image_id = ?';
        await connection.execute(queryDeleteOldPic, [oldImageId]);
        await connection.commit();
        return oldFilePath;
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('DB hiba deleteProfilePic: ', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

async function addLog(user_id, activity, victimid = null) {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        if (victimid == null) {
            const query = 'INSERT INTO log (user_id, activity) VALUES (?, ?)';
            await connection.execute(query, [user_id, activity]);
        }
        else {
            const query = 'INSERT INTO log (user_id, victim_id, activity) VALUES (?, ?, ?)';
            await connection.execute(query, [user_id, victimid, activity]);
        }
        await connection.commit();
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('DB hiba addLog: ', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
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

async function insertConnection(connection, startPointId, endPointId, gameMapId, startToEndDirection, endToStartDirection) {
    const query = `
        INSERT INTO point_connections (start_point_id, end_point_id, game_maps_id, direction_start_to_end, direction_end_to_start)
        VALUES (?, ?, ?, ?, ?)
    `;
    const smallerId = Math.min(startPointId, endPointId);
    const largerId = Math.max(startPointId, endPointId);
    const [result] = await connection.execute(query, [smallerId, largerId, gameMapId, startToEndDirection, endToStartDirection]);
    return result.insertId;
}

async function updateImagePath(connection, imageId, filepath) {
    const query = `
        UPDATE images
        SET filepath = ?
        WHERE image_id = ?
    `;
    const [result] = await connection.execute(query, [filepath, imageId]);
    return result.affectedRows == 1;
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
        SELECT images.image_id, images.filepath, images.width, images.height, points.north_direction
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
            end_point.map_id AS end_map_id,
            point_connections.direction_start_to_end,
            point_connections.direction_end_to_start
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
    return result.affectedRows == 1;
}

async function deleteImageById(connection, imageId) {
    const query = `
        DELETE FROM images
        WHERE images.image_id = ?
    `;
    const [result] = await connection.execute(query, [imageId]);
    return result.affectedRows == 1;
}

async function arePointsInSameGameMap(connection, pointId1, pointId2, gameMapId) {
    const query = `
        SELECT COUNT(DISTINCT points.point_id) AS count
        FROM points
            INNER JOIN map ON (points.map_id = map.map_id)
        WHERE points.point_id IN (?, ?) 
          AND map.game_maps_id = ?;
    `;

    const [rows] = await connection.execute(query, [pointId1, pointId2, gameMapId]);

    return rows[0].count == 2;
}

async function arePointsInSameMap(connection, pointId1, pointId2) {
    const query = `
        SELECT COUNT(DISTINCT map_id) AS map_count
        FROM points
        WHERE point_id IN (?, ?);
    `;

    const [rows] = await connection.execute(query, [pointId1, pointId2]);

    return rows[0].map_count == 1;
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

async function updateConnectionDirections(connection, connectionId, dirStartToEnd, dirEndToStart) {
    const query = `
        UPDATE point_connections
        SET direction_start_to_end = COALESCE(?, direction_start_to_end),
            direction_end_to_start = COALESCE(?, direction_end_to_start)
        WHERE connection_id = ?
    `;
    const [result] = await connection.execute(query, [dirStartToEnd, dirEndToStart, connectionId]);
    return result.affectedRows == 1;
}

async function isConnectionCrossMap(connection, connectionId) {
    const query = `
        SELECT 
            start_point.map_id AS start_map_id,
            end_point.map_id AS end_map_id
        FROM point_connections
            INNER JOIN points start_point ON (start_point.point_id = point_connections.start_point_id)
            INNER JOIN points end_point ON (end_point.point_id = point_connections.end_point_id)
        WHERE point_connections.connection_id = ?
    `;
    const [rows] = await connection.execute(query, [connectionId]);
    return rows[0].start_map_id != rows[0].end_map_id;
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
    getUserByUsername,
    getUserByEmail,
    arePointsInSameGameMap,
    doesConnectionAlreadyExist,
    deletePointById,
    deleteMapById,
    deleteConnectionById,
    getUsers,
    getUser,
    getUserNameProfile,
    updateUser,
    updatePassword,
    userToInactive,
    uploadProfilePic,
    deleteProfilePic,
    getGameMaps,
    getImagePath,
    addLog,
    getMapImageIdByMapId,
    getMapInfo,
    getAllImageIdsForMap,
    arePointsInSameMap,
    updateConnectionDirections,
    isConnectionCrossMap
};
