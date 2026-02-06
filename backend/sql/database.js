const mysql = require('mysql2/promise');

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
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    const [result] = await pool.execute(query, [username, email, password]);
    return result;
}

async function getUserByUsername(username) {
    const query = 'SELECT users.password, users.user_id, users.role FROM users WHERE users.username = ?';
    const [result] = await pool.execute(query, [username]);
    return result;
}

async function getUserByEmail(email) {
    const query = 'SELECT users.password, users.user_id, users.role FROM users WHERE users.email = ?';
    const [result] = await pool.execute(query, [email]);
    return result;
}

async function getUsers() {
    const query = 'SELECT users.deleted_at, users.user_id, users.username, users.email, users.role FROM users';
    const [rows] = await pool.execute(query);
    return rows;
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

async function userToInactive(userId) {
    const query = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = ? AND deleted_at IS NULL';
    const [result] = await pool.execute(query, [userId]);
    return result.affectedRows;
}
//!Export
module.exports = {
    // selectall,
    newUser,
    getUserByUsername,
    getUserByEmail,
    getUsers,
    sortedUsers,
    userToInactive
};
