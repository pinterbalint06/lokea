//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

// diskStorage for profile pic endpoint (api.js)
const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const fileFilter = (request, file, callback) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
        callback(null, true);
    } else {
        request.fileValidationError = 'Érvénytelen fájltípus! Csak képeket tölthetsz fel.';
        callback(null, false); // Elutasítja a fájlt mentés nélkül
    }
};

const uploadDisk = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter
});

const uploadMemory = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter
});

module.exports = {
    uploadDisk,
    uploadMemory
};
