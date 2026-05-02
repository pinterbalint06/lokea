const pool = require('#sql/connection.js');

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

async function getConnection() {
    return await pool.getConnection();
}

module.exports = {
    newUser,
    getUserByUsername,
    getUserByEmail,
    getUserNameProfile,
    addLog
};
