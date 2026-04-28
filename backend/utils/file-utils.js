const fs = require("fs/promises");

async function deleteFile(filePath) {
    if (filePath) {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            // error no entry = file doesn't exist
            if (error.code != "ENOENT") {
                console.error("Failed to delete file " + filePath + ":", error);
            }
        }
    }
}

module.exports = { deleteFile };
