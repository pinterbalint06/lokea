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
    const query = 'SELECT users.password, users.userid, users.role FROM users WHERE users.username = ?';
    const [result] = await pool.execute(query, [username]);
    return result;
}

async function getUserByEmail(email) {
    const query = 'SELECT users.password, users.userid, users.role FROM users WHERE users.email = ?';
    const [result] = await pool.execute(query, [email]);
    return result;
}

//Játékhoz szükséges ab adatok lekérése
async function getGameMaps() {
    const query = 'SELECT game_maps_id, creator_id, title, cover_image_id, rating, plays, game_created FROM game_maps;';
    const [result] = await pool.execute(query);
    return result;
}
//!Export
module.exports = {
    // selectall,
    newUser, 
    getUserByUsername,
    getUserByEmail,
    getGameMaps
};
