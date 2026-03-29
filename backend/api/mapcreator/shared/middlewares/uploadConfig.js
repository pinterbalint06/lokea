const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const { TEMP_DIR, MAX_FILE_SIZE } = require("../../../../config/mapStorage.js");

const storage = multer.diskStorage({
    destination: async (request, file, callback) => {
        try {
            await fs.mkdir(TEMP_DIR, { recursive: true });
            callback(null, TEMP_DIR);
        } catch (error) {
            callback(error, null);
        }
    },
    filename: (request, file, callback) => {
        let uuid = crypto.randomBytes(16).toString("hex");
        let extension = path.extname(file.originalname).toLowerCase();

        callback(null, uuid + extension);
    },
    limits: { fileSize: MAX_FILE_SIZE }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE }
});

module.exports = upload;