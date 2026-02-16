const path = require("path");

// config
const TEMP_DIR = path.join(__dirname, "../temp");
const UPLOAD_ROOT = path.join(__dirname, "..", "..", "private");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

module.exports = {
    TEMP_DIR,
    UPLOAD_ROOT,
    MAX_FILE_SIZE
};
