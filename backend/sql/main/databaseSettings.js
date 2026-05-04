const pool = require('#sql/connection.js');
const bcrypt = require('bcrypt');
const AppError = require('#utils/app-error.js');

async function getUser(id) {
    const query = 'SELECT users.user_id, users.username, users.email, users.role, users.darkmode, users.language, users.created_at, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
    const [result] = await pool.execute(query, [id]);
    return result;
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
            throw new AppError('Felhasználó nem található!', 404);
        }
        let egyezes = await bcrypt.compare(oldPass, result[0].password);
        if (!egyezes) {
            throw new AppError('Nem ez a régi jelszavad!', 400);
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
        const getUserQuery = 'SELECT users.username, users.email, images.filepath, images.image_id FROM users LEFT JOIN images ON users.pfp = images.image_id WHERE users.user_id = ?';
        const [userResult] = await pool.execute(getUserQuery, [user_id]);
        if (userResult.length == 0) {
            throw new AppError('Felhasználó nem található!', 404);
        }
        connection = await pool.getConnection();
        await connection.beginTransaction();

        if (userResult[0].image_id) {
            await connection.execute('DELETE FROM images WHERE image_id = ?', [userResult[0].image_id]);
        }

        const query = "UPDATE users SET deleted_at = CURRENT_TIMESTAMP, username = LEFT(CONCAT('Törölt_', REPLACE(UUID(), '-', '')), 20), email = CONCAT(UUID(), '@lokea.com'), password = '', role = 'user' WHERE user_id = ? AND deleted_at IS NULL";
        const [result] = await connection.execute(query, [user_id]);
        await connection.commit();
        return { username: userResult[0].username, email: userResult[0].email, filepath: userResult[0].filepath };
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
            throw new AppError('Felhasználó nem található!', 404);
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
    let returnValue;
    try {
        const queryGetLastImage = 'SELECT images.image_id, images.filepath FROM users LEFT JOIN images ON users.pfp = images.image_id WHERE users.user_id = ?'
        const [oldImageData] = await pool.execute(queryGetLastImage, [user_id]);

        if (oldImageData.length === 0) {
            throw new AppError('Felhasználó nem található!', 404);
        }

        let oldFilePath = oldImageData[0].filepath;
        let oldImageId = oldImageData[0].image_id;

        if (oldImageId) {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const queryDeleteOldPic = 'DELETE FROM images WHERE image_id = ?';
            await connection.execute(queryDeleteOldPic, [oldImageId]);
            await connection.commit();
        }
        returnValue = oldFilePath;
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
    return returnValue;
}

module.exports = {
    getUser,
    updateUser,
    updatePassword,
    userToInactive,
    uploadProfilePic,
    deleteProfilePic
};
