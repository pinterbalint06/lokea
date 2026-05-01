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

module.exports = {
    insertImage,
    updateImagePath,
    deleteImageById
}
