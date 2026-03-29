const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { add } = require('lodash');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'bigprojekt_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//!SQL Queries

async function newUserFromAdmin(username, email, password, role, is_2fa) {
    let success = false;
    let error;
    const queryUserExistsCheck = 'SELECT email, username FROM users WHERE username = ? OR email = ?';
    let [result] = await pool.execute(queryUserExistsCheck, [username, email]);
    if (result.length == 0) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const queryInsertNewUser = 'INSERT INTO users (username, email, password, role, is_2fa) VALUES (?, ?, ?, ?, ?)';
            [result] = await connection.execute(queryInsertNewUser, [username, email, password, role, is_2fa]);
            if (result.affectedRows == 1) {
                success = true;
                await connection.commit();
            }
            else {
                throw new Error("Insert failed");
            }
        }
        catch (fault) {
            if (connection) {
                await connection.rollback();
            }
            if (fault.code == 'ER_DUP_ENTRY') {
                error = "User exists";
            }
            else {
                error = "Failed insert";
            }
        }
        finally {
            if (connection) connection.release();
        }
    }
    else {
        error = "User exists";
    }

    return success ? { success } : { success, error };
}

async function getUsers() {
    try {
        const query = 'SELECT users.deleted_at, users.user_id, users.username, users.email, users.role FROM users';
        const [rows] = await pool.execute(query);
        return rows;
    } catch (error) {
        console.error('DB hiba getUsers:', error);
        throw error;
    }
}

async function getUser(id) {
    try {
        const query = 'SELECT users.user_id, users.username, users.email, users.role, users.is_2fa, users.darkmode, users.created_at, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
        const [result] = await pool.execute(query, [id]);
        return result;
    } catch (error) {
        console.error('DB hiba getUser:', error);
        throw error;
    }
}

async function getUserNameProfile(id) {
    try {
        const query = 'SELECT users.username, users.darkmode, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
        const [result] = await pool.execute(query, [id]);
        return result;
    } catch (error) {
        console.error('DB hiba getUser:', error);
        throw error;
    }
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

async function updateUserByAdmin(user_id, username, email, role, is_2fa) {
    let connection;
    let affectedRows = 0;
    try {
        const [userCheck] = await pool.execute(
            'SELECT deleted_at FROM users WHERE user_id = ?',
            [user_id]
        );

        if (userCheck.length > 0 && userCheck[0].deleted_at === null) {
            let updates = [];
            let params = [];
            let result;

            if (username != null) {
                updates.push('username = ?');
                params.push(username);
            }
            if (email != null) {
                updates.push('email = ?');
                params.push(email);
            }
            if (role != null) {
                updates.push('role = ?');
                params.push(role);
            }
            if (is_2fa != null) {
                updates.push('is_2fa = ?');
                params.push(is_2fa);
            }

            if (updates.length === 0) {
                throw new Error('Nincs frissítendő mező');
            }

            const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
            params.push(user_id);

            connection = await pool.getConnection();
            await connection.beginTransaction();
            [result] = await connection.execute(query, params);
            affectedRows = result.affectedRows;
            await connection.commit();
        }
        return affectedRows;

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

async function userToInactive(userId) {
    let connection;
    let result;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const query = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND deleted_at IS NULL';
        [result] = await connection.execute(query, [userId]);
        await connection.commit();
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
    }
    finally {
        if (connection) connection.release();
    }
    return result.affectedRows;
}

async function uploadProfilePic(filepath, width, height, user_id) {
    let connection;
    let result;
    try {
        let oldImageData = await getOldPicturePath(user_id);
        let oldFilePath = oldImageData ? oldImageData.filepath : null;
        let oldImageId = oldImageData ? oldImageData.image_id : null;

        connection = await pool.getConnection();
        await connection.beginTransaction();
        const queryInsertNewPic = 'INSERT INTO images (filepath, width, height) VALUES (?, ?, ?)';
        [result] = await connection.execute(queryInsertNewPic, [filepath, width, height]);
        const queryUpdatePfpId = 'UPDATE users SET pfp = ? WHERE user_id = ?';
        [result] = await connection.execute(queryUpdatePfpId, [result.insertId, user_id])
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
        console.error('DB hiba uploadProfilePic:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

async function deleteProfilePic(user_id) {
    let connection;
    try {
        let oldImageData = await getOldPicturePath(user_id);
        let oldFilePath = oldImageData ? oldImageData.filepath : null;
        let oldImageId = oldImageData ? oldImageData.image_id : null;

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
        console.error('DB hiba deleteProfilePic:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

async function getOldPicturePath(user_id) {
    try {
        const queryGetLastImage = 'SELECT images.image_id, images.filepath FROM users LEFT JOIN images ON users.pfp = images.image_id WHERE users.user_id = ?'
        const [oldImageData] = await pool.execute(queryGetLastImage, [user_id]);
        return oldImageData[0];
    } catch (error) {
        console.error('DB hiba getLogs:', error);
        throw error;
    }
}

async function addLog(userid, activity, victimid = null) {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        if (victimid == null) {
            const query = 'INSERT INTO log (user_id, activity) VALUES (?, ?)';
            await connection.execute(query, [userid, activity]);
        }
        else {
            const query = 'INSERT INTO log (user_id, victim_id, activity) VALUES (?, ?, ?)';
            await connection.execute(query, [userid, victimid, activity]);
        }
        await connection.commit();
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

async function getLogs() {
    try {
        const query = 'SELECT who.username, victim.username AS victim, log.activity, log.happened_at FROM log INNER JOIN users who ON log.user_id = who.user_id LEFT JOIN users victim ON log.victim_id = victim.user_id';
        const [rows] = await pool.execute(query);
        return rows;
    } catch (error) {
        console.error('DB hiba getLogs:', error);
        throw error;
    }
}

async function sortedLogs(username, periodFrom, periodTo, roles, activities) {
    try {
        let query = `SELECT who.username, victim.username AS victim, log.activity, log.happened_at FROM log LEFT JOIN users AS who ON log.user_id = who.user_id LEFT JOIN users AS victim ON log.victim_id = victim.user_id WHERE 1=1`;

        const params = [];

        if (username && username.trim() !== "") {
            query += ` AND (who.username LIKE ? OR victim.username LIKE ?)`;
            const searchStr = `%${username}%`;
            params.push(searchStr, searchStr);
        }

        if (periodFrom) {
            query += ` AND log.happened_at >= ?`;
            params.push(periodFrom);
        }
        if (periodTo) {
            query += ` AND log.happened_at <= ?`;
            params.push(periodTo);
        }

        if (roles && roles.length > 0) {
            const placeholders = roles.map(() => '?').join(',');
            query += ` AND who.role IN (${placeholders})`;
            params.push(...roles);
        }

        if (activities && activities.length > 0) {
            let likeStrings = [];
            for (let i = 0; i < activities.length; i++) {
                likeStrings.push("log.activity LIKE ?");
            }
            query += " AND (" + likeStrings.join(" OR ") + ")";
            for (let i = 0; i < activities.length; i++) {
                params.push("%" + activities[i] + "%");
            }
        }

        query += ` ORDER BY log.happened_at DESC`;
        console.log(query, params);

        const [rows] = await pool.execute(query, params);
        return rows;

    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}
//!Export
module.exports = {
    newUserFromAdmin,
    getUsers,
    getUser,
    getUserNameProfile,
    sortedUsers,
    updateUserByAdmin,
    userToInactive,
    uploadProfilePic,
    deleteProfilePic,
    addLog,
    getLogs,
    sortedLogs
};
