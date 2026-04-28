const multer = require("multer");
const fs = require("fs/promises");
const crypto = require("crypto");
const path = require("path");
const ERRORS = require("#utils/error-messages.js");
const AppError = require("#utils/app-error.js");

const TEMP_DIR = process.env.JEST_WORKER_ID
    ? path.join(__dirname, "..", "temp", `test-${process.env.JEST_WORKER_ID}`)
    : path.join(__dirname, "..", "temp");
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");
const UPLOAD_ROOT_MAP_DATA = path.join(UPLOAD_ROOT, "mapdatas");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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

function isInsideRoot(targetPath) {
    let isSafe = false;

    if (typeof targetPath == "string" && targetPath.trim() !== "") {
        const absoluteRoot = path.resolve(UPLOAD_ROOT_MAP_DATA);
        const absoluteTarget = path.resolve(targetPath);

        const isNotRoot = absoluteTarget != absoluteRoot;
        const isInside = absoluteTarget.startsWith(absoluteRoot + path.sep);

        isSafe = isNotRoot && isInside;
    }

    return isSafe;
}

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter
});

module.exports = {
    upload,
    TEMP_DIR,
    UPLOAD_ROOT,
    UPLOAD_ROOT_MAP_DATA,
    MAX_FILE_SIZE,
    isInsideRoot
};
