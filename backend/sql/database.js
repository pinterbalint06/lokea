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
async function getGameMapsByCreated() {
    const query = 'SELECT game_maps.game_maps_id, game_maps.creator_id, game_maps.title, game_maps.cover_image_id, game_maps.rating, game_maps.plays, game_maps.game_created, game_maps.game_description FROM game_maps ORDER BY game_maps.game_created DESC;';
    const [result] = await pool.execute(query);
    return result;
}

async function getGameMapsByRating() {
    const query = 'SELECT game_maps.game_maps_id, game_maps.creator_id, game_maps.title, game_maps.cover_image_id, game_maps.rating, game_maps.plays, game_maps.game_created, game_maps.game_description FROM game_maps ORDER BY game_maps.rating DESC;';
    const [result] = await pool.execute(query);
    return result;
}

async function getGameMapsByPlays() {
    const query = 'SELECT game_maps.game_maps_id, game_maps.creator_id, game_maps.title, game_maps.cover_image_id, game_maps.rating, game_maps.plays, game_maps.game_created, game_maps.game_description FROM game_maps ORDER BY game_maps.plays DESC;';
    const [result] = await pool.execute(query);
    return result;
}

async function getGameMapsByFavorites(user_id) {
    const query = 'SELECT game_maps.game_maps_id, game_maps.creator_id, game_maps.title, game_maps.cover_image_id, game_maps.rating, game_maps.plays, game_maps.game_created, game_maps.game_description FROM game_maps INNER JOIN favorites ON game_maps.game_maps_id = favorites.game_maps_id WHERE favorites.user_id = ? ORDER BY game_maps.game_created DESC;';
    const [result] = await pool.execute(query, [user_id]);
    return result;
}

async function getImagePath(image_id) {
    const query = 'SELECT images.filepath FROM images WHERE images.image_id = ?';
    const [result] = await pool.execute(query, [image_id]);
    let re = result[0].filepath;
    return re;
}
//!Export
module.exports = {
    // selectall,
    newUser, 
    getUserByUsername,
    getUserByEmail,
    getGameMapsByCreated,
    getGameMapsByRating,
    getGameMapsByPlays,
    getGameMapsByFavorites,
    getImagePath
};
