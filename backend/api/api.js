const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const auth = require('../utils/auth.js')
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { body, check, validationResult } = require("express-validator");
const sharp = require('sharp');
const { sendWelcomeEmail, sendDeleteEmail, sendChangeEmail, sendPasswordChangeEmail } = require('../utils/mails.js')

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (request, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
            callback(null, true);
        } else {
            request.fileValidationError = 'Érvénytelen fájltípus! Csak képeket tölthetsz fel.';
            callback(null, false); // Elutasítja a fájlt mentés nélkül
        }
    }
});

//!ENDPOINTS
//test
router.get('/test', (request, response) => {
    response.status(200).json({
        message: 'Ez a végpont működik.'
    });
});

//játékhoz szükséges api-k
router.get('/game_maps', async (request, response) => {
    try {
        const sort = String(request.query.sort || 'created').toLowerCase();
        const offset = parseInt(request.query.offset) || 0;
        const validSorts = ['created', 'rating', 'plays', 'favorites'];
        if (!validSorts.includes(sort)) {
            return response.status(400).json({
                success: false,
                message: 'Érvénytelen rendezés. Használható: created, rating, plays, favorites'
            });
        }

        const user_id = request.session?.userid || 1;
        const palyak = await database.getGameMaps(sort, user_id, offset);

        response.status(200).json({
            success: true,
            results: palyak
        });
    } catch (error) {
        response.status(500).json({
            success: false,
            message: error
        });
    }
});

router.get('/get_cover_image/:cover_image_id', async (request, response) => {

    try {
        let uploads = path.join(__dirname, '../uploads');
        let fileRes;
        if (!request.params || !request.params.cover_image_id) {
            fileRes = 'cover_images/image-not-found.jpg';
        } else {
            let filePath = await database.getImagePath(request.params.cover_image_id);
            if (!filePath) {
                fileRes = 'cover_images/image-not-found.jpg';
            } else {
                fileRes = filePath;
            }
        }
        let res = path.join(uploads, fileRes);
        response.sendFile(res);
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});
module.exports = router;
