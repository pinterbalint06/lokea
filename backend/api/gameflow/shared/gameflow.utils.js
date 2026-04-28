const path = require("path");
const fs = require("fs/promises");
const AppError = require("../../../utils/app-error.js");

const COUNTDOWN_SECONDS = 3;

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "..", "uploads", "mapdatas");

const MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp"
};

function getMimeTypeFromPath(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    return MIME_TYPES[extension] ?? "application/octet-stream";
}

function resolvePathInsideUploadRoot(filePath) {
    const fullPath = path.resolve(UPLOAD_ROOT, filePath);
    if (!fullPath.startsWith(UPLOAD_ROOT + path.sep)) {
        throw new AppError("Invalid image path", 400);
    }
    return fullPath;
}

async function readImageData(filePath) {
    const fullPath = resolvePathInsideUploadRoot(filePath);
    const buffer = await fs.readFile(fullPath);
    return {
        base64: buffer.toString("base64"),
        mimeType: getMimeTypeFromPath(filePath)
    };
}

module.exports = { COUNTDOWN_SECONDS, getMimeTypeFromPath, resolvePathInsideUploadRoot, readImageData };
