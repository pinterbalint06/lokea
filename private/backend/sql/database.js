const mysql = require('../../../backend/node_modules/mysql2/promise');
const bcrypt = require('../../../backend/node_modules/bcrypt');

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

    return success ? { success, insertId: result.insertId } : { success, error };
}

async function getUsers(limit = 10) {
    try {
        const countQuery = 'SELECT COUNT(*) as total FROM users';
        const [[{ total }]] = await pool.execute(countQuery);

        const query = 'SELECT deleted_at, user_id, username, email, role FROM users ORDER BY user_id LIMIT ?';
        const [rows] = await pool.execute(query, [limit]);

        return { rows, total };
    } catch (error) {
        console.error('DB hiba getUsers:', error);
        throw error;
    }
}

async function getUser(user_id) {
    try {
        const query = 'SELECT users.user_id, users.username, users.email, users.role, users.is_2fa, users.darkmode, users.created_at, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
        const [result] = await pool.execute(query, [user_id]);
        return result;
    } catch (error) {
        console.error('DB hiba getUser:', error);
        throw error;
    }
}

async function getUserNameProfile(user_id) {
    try {
        const query = 'SELECT users.username, users.darkmode, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
        const [result] = await pool.execute(query, [id]);
        return result;
    } catch (error) {
        console.error('DB hiba getUser:', error);
        throw error;
    }
}

async function sortedUsers(mireKeresek, mit, status, adminChecked, modChecked, userChecked, page = 1, customLimit = 10) {
    const limit = customLimit;
    const offset = (page - 1) * limit;

    let conditions = [];
    let params = [];

    if (mit && mit.trim() !== '') {
        const validColumns = ['user_id', 'username', 'email'];
        const targetColumn = validColumns.includes(mireKeresek) ? mireKeresek : 'username';
        conditions.push(`${targetColumn} LIKE ?`);
        params.push(`%${mit}%`);
    }

    if (status && status !== '') {
        if (status === 'statusActive') {
            conditions.push('deleted_at IS NULL');
        } else if (status === 'statusDeleted') {
            conditions.push('deleted_at IS NOT NULL');
        }
    }

    let roles = [];
    if (adminChecked) roles.push('ADMIN');
    if (modChecked) roles.push('MOD');
    if (userChecked) roles.push('USER');

    if (roles.length > 0) {
        const placeHolders = roles.map(() => '?').join(',');
        conditions.push(`role IN (${placeHolders})`);
        params.push(...roles);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const dataQuery = `SELECT deleted_at, user_id, username, email, role FROM users ${whereClause} ORDER BY user_id LIMIT ? OFFSET ?`;

    try {
        let [[{ total }]] = await pool.execute(countQuery, params);
        const [rows] = await pool.execute(dataQuery, [...params, limit, offset]);

        return { rows, total };
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
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

async function updateDarkMode(user_id, darkmode) {
    let connection;
    let result;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const query = 'UPDATE users SET darkmode = ? WHERE user_id = ? AND deleted_at IS NULL';
        [result] = await connection.execute(query, [darkmode, user_id]);
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

async function userToInactive(user_id) {
    let connection;
    let result;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const query = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND deleted_at IS NULL';
        [result] = await connection.execute(query, [user_id]);
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

async function getUserCount() {
    try {
        const queryUserCount = 'SELECT COUNT(*) AS jatekosok_szama FROM users;'
        const [oldImageData] = await pool.execute(queryUserCount);
        return oldImageData[0].jatekosok_szama;
    } catch (error) {
        console.error('DB hiba getUserNumbers:', error);
        throw error;
    }
}

async function getActiveUserCount() {
    try {
        const queryUserCount = "SELECT COUNT(DISTINCT log.user_id) AS egyedi_belepok_szama FROM log WHERE log.activity = 'Login' AND log.happened_at >= DATE_SUB(NOW(), INTERVAL 31 DAY);";
        const [result] = await pool.execute(queryUserCount);
        return result[0].egyedi_belepok_szama;
    } catch (error) {
        console.error('DB hiba getUserNumbers:', error);
        throw error;
    }
}

async function getUserActivityByWeek() {
    try {
        const queryUserCount = "SELECT DATE_FORMAT(log.happened_at, '%v.') AS het_megnevezes, COUNT(log.log_id) AS felhasznalok_szama FROM log WHERE log.activity LIKE '%Login%' GROUP BY het_megnevezes ORDER BY YEARWEEK(log.happened_at, 1);";
        const [result] = await pool.execute(queryUserCount);
        return result;
    } catch (error) {
        console.error('DB hiba getUserNumbers:', error);
        throw error;
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
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

async function getLogs(limit = 15) {
    try {
        const countQuery = `SELECT COUNT(*) as total FROM log LEFT JOIN users AS who ON log.user_id = who.user_id LEFT JOIN users AS victim ON log.victim_id = victim.user_id`;
        const [[{ total }]] = await pool.execute(countQuery);

        const query = 'SELECT who.username, victim.username AS victim, log.activity, log.happened_at FROM log INNER JOIN users who ON log.user_id = who.user_id LEFT JOIN users victim ON log.victim_id = victim.user_id ORDER BY log.happened_at DESC LIMIT ?';
        const [rows] = await pool.execute(query, [limit]);
        return { rows, total };
    } catch (error) {
        console.error('DB hiba getLogs:', error);
        throw error;
    }
}

async function sortedLogs(username, periodFrom, periodTo, roles, activities, page = 1, customLimit = 15) {
    const limit = customLimit;
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];

    if (username && username.trim() !== "") {
        whereClause += ` AND (who.username LIKE ? OR victim.username LIKE ?)`;
        let searchStr = `%${username}%`;
        params.push(searchStr, searchStr);
    }

    if (periodFrom) {
        whereClause += ` AND log.happened_at >= ?`;
        params.push(periodFrom);
    }
    if (periodTo) {
        whereClause += ` AND log.happened_at <= ?`;
        params.push(periodTo);
    }

    if (roles && roles.length > 0) {
        let placeholders = roles.map(() => '?').join(',');
        whereClause += ` AND who.role IN (${placeholders})`;
        params.push(...roles);
    }

    if (activities && activities.length > 0) {
        let likeStrings = [];
        for (let i = 0; i < activities.length; i++) {
            likeStrings.push("log.activity LIKE ?");
            params.push("%" + activities[i] + "%");
        }
        whereClause += " AND (" + likeStrings.join(" OR ") + ")";
    }

    const countQuery = `SELECT COUNT(*) as total FROM log LEFT JOIN users AS who ON log.user_id = who.user_id LEFT JOIN users AS victim ON log.victim_id = victim.user_id WHERE 1=1 ${whereClause}`;

    const sortedLogQuery = `SELECT who.username, victim.username AS victim, log.activity, log.happened_at FROM log LEFT JOIN users AS who ON log.user_id = who.user_id LEFT JOIN users AS victim ON log.victim_id = victim.user_id WHERE 1=1 ${whereClause} ORDER BY log.happened_at DESC LIMIT ? OFFSET ?`;

    try {
        let [[{ total }]] = await pool.execute(countQuery, params);
        const finalParams = [...params, limit, offset];
        let [rows] = await pool.execute(sortedLogQuery, finalParams);

        return { rows, total };

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
    updateDarkMode,
    userToInactive,
    uploadProfilePic,
    deleteProfilePic,
    getUserCount,
    getActiveUserCount,
    getUserActivityByWeek,
    addLog,
    getLogs,
    sortedLogs
};
