const pool = require('../connection.js');
const bcrypt = require('bcrypt');

//!SQL Queries

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

    if (adminChecked === 'true') roles.push('ADMIN');
    if (modChecked === 'true') roles.push('MOD');
    if (userChecked === 'true') roles.push('USER');

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

async function getUser(user_id) {
    try {
        const query = 'SELECT users.user_id, users.username, users.email, users.role, users.darkmode, users.created_at, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
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
        const [result] = await pool.execute(query, [user_id]);
        return result;
    } catch (error) {
        console.error('DB hiba getUser:', error);
        throw error;
    }
}

async function getOldPicturePath(user_id) {
    try {
        const queryGetLastImage = 'SELECT images.image_id, images.filepath FROM users LEFT JOIN images ON users.pfp = images.image_id WHERE users.user_id = ?'
        const [oldImageData] = await pool.execute(queryGetLastImage, [user_id]);
        return oldImageData[0];
    } catch (error) {
        console.error('DB hiba getOldPicturePath:', error);
        throw error;
    }
}

async function newUserFromAdmin(username, email, password, role) {
    let success = false;
    let error;
    const queryUserExistsCheck = 'SELECT email, username FROM users WHERE username = ? OR email = ?';
    let [result] = await pool.execute(queryUserExistsCheck, [username, email]);
    if (result.length == 0) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const queryInsertNewUser = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?, ?)';
            [result] = await connection.execute(queryInsertNewUser, [username, email, password, role]);
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

async function updateUserByAdmin(user_id, username, email, role = null) {
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

async function userToInactive(user_id) {
    let connection;
    let result;
    let userData = {};
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.execute('SELECT email, username FROM users WHERE user_id = ?', [user_id]);
        if (rows.length > 0) {
            userData = rows[0];
        }

        const query = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND deleted_at IS NULL';
        [result] = await connection.execute(query, [user_id]);
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
    return { ...userData, affectedRows: result.affectedRows };
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

module.exports = {
    getUsers,
    sortedUsers,
    getUser,
    getUserNameProfile,
    getOldPicturePath,
    newUserFromAdmin,
    uploadProfilePic,
    updateUserByAdmin,
    userToInactive,
    deleteProfilePic
}