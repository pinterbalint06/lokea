const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

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
// async function selectall() {
//     const query = 'SELECT * FROM exampletable;';
//     const [rows] = await pool.execute(query);
//     return rows;
// }

async function newUser(username, email, password) {
    let success = false;
    let error;
    const queryUserExistsCheck = 'SELECT email, username FROM users WHERE username = ? OR email = ?';
    let [result] = await pool.execute(queryUserExistsCheck, [username, email]);
    if (result.length == 0) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const queryInsertNewUser = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            [result] = await connection.execute(queryInsertNewUser, [username, email, password]);
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

async function getUserByUsername(username) {
    const query = 'SELECT users.username, users.password, users.user_id, users.role, users.deleted_at FROM users WHERE users.username = ?';
    const [result] = await pool.execute(query, [username]);
    return result;
}

async function getUserByEmail(email) {
    const query = 'SELECT users.username, users.password, users.user_id, users.role, users.deleted_at FROM users WHERE users.email = ?';
    const [result] = await pool.execute(query, [email]);
    return result;
}

async function getUsers() {
    const query = 'SELECT users.deleted_at, users.user_id, users.username, users.email, users.role FROM users';
    const [rows] = await pool.execute(query);
    return rows;
}

async function getUser(id) {
    const query = 'SELECT users.user_id, users.username, users.email, users.role, users.is_2fa, users.darkmode, users.created_at, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
    const [result] = await pool.execute(query, [id]);
    return result;
}

async function getUserNameProfile(id) {
    const query = 'SELECT users.username, users.darkmode, images.filepath FROM users LEFT JOIN images ON (images.image_id = users.pfp) WHERE users.user_id = ?';
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

async function updateUser(user_id, username, email, is_2fa, language, darkmode) {
    let query = 'UPDATE users ';
    let updates = [];
    let params = [];
    let rows;

    if (username != null) {
        updates.push('users.username = ?');
        params.push(username);
    }
    if (email != null) {
        updates.push('users.email = ?');
        params.push(email);
    }
    // if (pfp != null) {
    //     updates.push('users.pfp = ?');
    //     params.push(pfp);
    // }
    if (is_2fa != null) {
        updates.push('users.is_2fa = ?');
        params.push(is_2fa);
    }
    if (language != null) {
        updates.push('users.language = ?');
        params.push(language);
    }
    if (darkmode != null) {
        updates.push('users.darkmode = ?');
        params.push(darkmode);
    }

    if (updates.length === 0) {
        throw new Error('Nincs frissítendő mező');
    }
    else {
        query += ' SET ' + updates.join(' , ');
        query += ` WHERE users.user_id = ?`;
        params.push(user_id);
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            [rows] = await connection.execute(query, params);
            await connection.commit();
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
        }
        finally {
            if (connection) connection.release();
        }
    }
    return rows.affectedRows;
}

async function updateUserByAdmin(user_id, username, email, role, is_2fa) {
    let query = 'UPDATE users ';
    let updates = [];
    let params = [];
    let rows;

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
    else {
        query += ' SET ' + updates.join(' , ');
        query += ` WHERE users.user_id = ?`;
        params.push(user_id);
        let connection;

        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            [rows] = await connection.execute(query, params);
            await connection.commit();
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
        }
        finally {
            if (connection) connection.release();
        }
    }
    return rows.affectedRows;
}

async function updatePassword(userid, oldPass, newPass) {
    try {
        const query = 'SELECT users.password FROM users WHERE users.user_id = ?';
        const [result] = await pool.execute(query, [userid]);
        let egyezes = await bcrypt.compare(oldPass, result[0].password);
        if (egyezes) {
            let connection;
            try {
                const hashedPassword = await bcrypt.hash(newPass, 10);
                connection = await pool.getConnection();
                await connection.beginTransaction();
                const query = 'UPDATE users SET password = ? WHERE user_id = ?';
                await connection.execute(query, [hashedPassword, userid]);
                await connection.commit();
            } catch (error) {
                if (connection) {
                    await connection.rollback();
                }
                throw new Error('Hiba az adatbázissal való kommunikálás során!');
            }
            finally {
                if (connection) connection.release();
            }
        }
        else {
            throw new Error('Nem ez a régi jelszavad!');
        }
    } catch (error) {
        console.error(error);
        throw error;
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
    //Régi profilkép elérési útvonala + id lekérése későbbi törlésre

    const queryGetLastImage = 'SELECT images.image_id, images.filepath FROM users LEFT JOIN images ON users.pfp = images.image_id WHERE users.user_id = ?'
    const [oldImageData] = await pool.execute(queryGetLastImage, [user_id]);

    let oldFilePath = oldImageData[0] ? oldImageData[0].filepath : null;
    let oldImageId = oldImageData[0] ? oldImageData[0].image_id : null;
    let connection;
    let result;
    try {
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
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(error);
    }
    finally {
        if (connection) connection.release();
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
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const queryDeleteOldPic = 'DELETE FROM images WHERE image_id = ?';
        await connection.execute(queryDeleteOldPic, [oldImageId]);
        await connection.commit();
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
    }
    finally {
        if (connection) connection.release();
    }
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
//!Export
module.exports = {
    // selectall,
    newUser,
    newUserFromAdmin,
    getUserByUsername,
    getUserByEmail,
    getUsers,
    getUser,
    getUserNameProfile,
    sortedUsers,
    updateUser,
    updateUserByAdmin,
    updatePassword,
    userToInactive,
    uploadProfilePic,
    deleteProfilePic,
    getGameMaps,
    getImagePath
};
