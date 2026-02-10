const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

const upload = multer({ storage });

//TESZT
let currPointID = 0;

//!Endpoints:
//?POST /api/map_creator/saveMap
router.post("/saveMap", (request, response) => {
    response.status(200).json({
        success: true
    });
});
//?POST /api/map_creator/savePoint
router.post("/savePoint", async (request, response) => {
    try {
        console.log(request.body);
        currPointID++;
        await new Promise(r => setTimeout(r, 2000));
        response.status(200).json({
            success: true,
            pointId: currPointID
        });
    } catch (error) {
        if (error.statusCode) {
            message = error.message;
            statusCode = error.statusCode;
        } else {
            console.error(error);
            message = "Váratlan hiba történt!";
            statusCode = 500;
        }
        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
});
//?POST /api/map_creator/uploadEquirectangularImage
router.post("/uploadEquirectangularImage", upload.single("uploadedFile"), async (request, response) => {
    try {
        if (!request.file) {
            const error = new Error("No file provided");
            error.statusCode = 400;
            throw error;
        }
        await new Promise(r => setTimeout(r, 2000));
        await fs.unlink(request.file.path);
        response.status(200).json({
            success: true
        });
    } catch (error) {
        if (error.statusCode) {
            message = error.message;
            statusCode = error.statusCode;
        } else {
            console.error(error);
            message = "Váratlan hiba történt!";
            statusCode = 500;
        }
        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
});

module.exports = router;
