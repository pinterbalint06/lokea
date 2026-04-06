const path = require("path");

// config
const TEMP_DIR = path.join(__dirname, "..", "temp");
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "mapdatas");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function isInsideRoot(targetPath) {
    let isSafe = false;

    if (typeof targetPath == "string" && targetPath.trim() !== "") {
        const absoluteRoot = path.resolve(UPLOAD_ROOT);
        const absoluteTarget = path.resolve(targetPath);

        const isNotRoot = absoluteTarget != absoluteRoot;
        const isInside = absoluteTarget.startsWith(absoluteRoot + path.sep);

        isSafe = isNotRoot && isInside;
    }

    return isSafe;
}

module.exports = {
    TEMP_DIR,
    UPLOAD_ROOT,
    MAX_FILE_SIZE,
    isInsideRoot
};
