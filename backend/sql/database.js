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

async function insertPoint(connection, mapId, x, y, imageId) {
    const query = `
        INSERT INTO points (map_id, point_x, point_y, image_id)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [mapId, x, y, imageId]);
    return result.insertId;
}

async function updateImagePath(connection, imageId, filepath) {
    const query = `
        UPDATE images
        SET filepath = ?
        WHERE image_id = ?
    `;
    await connection.execute(query, [filepath, imageId]);
}

async function getMapImage(mapId) {
    const query = `
        SELECT images.filepath, images.width, images.height 
        FROM map
            INNER JOIN images ON (map.image_id = images.image_id)
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    return rows[0];
}

async function getPointImage(pointId) {
    const query = `
        SELECT images.filepath, images.width, images.height 
        FROM points
            INNER JOIN images ON (points.image_id = images.image_id)
        WHERE points.point_id = ?
    `;
    const [rows] = await pool.execute(query, [pointId]);
    return rows[0];
}

async function getPointsOnMap(mapId) {
    const query = `
        SELECT points.point_id, points.point_x, points.point_y 
        FROM map
            INNER JOIN points ON (map.map_id = points.map_id)
        WHERE map.map_id = ?
    `;
    const [rows] = await pool.execute(query, [mapId]);
    return rows;
}

async function getMapsByGameMapId(gameMapId) {
    const sql = `
        SELECT map.map_id, map.title
        FROM game_maps
            INNER JOIN map ON (game_maps.game_maps_id = map.game_maps_id)
        WHERE game_maps.game_maps_id = ?
    `;
    const [rows] = await pool.execute(sql, [gameMapId]);
    return rows;
}

//!Export
module.exports = {
    // selectall,
    getConnection,
    insertImage,
    insertMap,
    insertPoint,
    updateImagePath,
    getMapImage,
    getPointImage,
    getPointsOnMap,
    getMapsByGameMapId,
    newUser,
    getUserByUsername,
    getUserByEmail
};
