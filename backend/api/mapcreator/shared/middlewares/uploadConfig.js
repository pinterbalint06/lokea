const multer = require("multer");
const fs = require("fs/promises");
const crypto = require("crypto");
const { TEMP_DIR, MAX_FILE_SIZE } = require("#config/mapStorage.js");
const ERRORS = require("#utils/errorMessages.js");
const AppError = require("#utils/AppError.js");

const ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
};

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
        const extension = ALLOWED_IMAGE_TYPES[file.mimetype] || "";

        callback(null, uuid + extension);
    }
});

const fileFilter = (request, file, callback) => {
    if (ALLOWED_IMAGE_TYPES[file.mimetype]) {
        callback(null, true);
    } else {
        callback(new AppError(ERRORS.COMMON.INVALID_IMAGE_TYPE, 415));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter
});

module.exports = upload;
