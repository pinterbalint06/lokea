const pool = require('#sql/connection.js');
const { isIdUpdateSuccessful } = require('#sql/db-utils.js');

async function insertImage(connection, width, height, filepath) {
    const query = `
        INSERT INTO images (width, height, filepath)
        VALUES (?, ?, ?)
    `;
    const [result] = await connection.execute(query, [width, height, filepath]);
    return result.insertId;
}

async function updateImagePath(connection, imageId, filepath) {
    const query = `
        UPDATE images
        SET filepath = ?
        WHERE image_id = ?
    `;
    const [result] = await connection.execute(query, [filepath, imageId]);
    return isIdUpdateSuccessful(result);
}

async function deleteImageById(connection, imageId) {
    const query = `
        DELETE FROM images
        WHERE images.image_id = ?
    `;
    const [result] = await connection.execute(query, [imageId]);
    return result.affectedRows == 1;
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


module.exports = {
    insertImage,
    updateImagePath,
    deleteImageById,
    getImagePath
}