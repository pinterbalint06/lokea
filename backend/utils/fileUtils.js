async function deleteFile(filePath) {
    if (filePath) {
        try {
            await fs.unlink(filePath);
        } catch (err) {
            // error no entry file doesn't exist
            if (err.code != "ENOENT") {
                console.error("Failed to delete " + filePath + ":", err.message);
            }
        }
    }
}

module.exports = { deleteFile };
