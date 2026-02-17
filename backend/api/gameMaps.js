const express = require("express");
const router = express.Router();
const database = require("../sql/database.js");

const path = require("path");

const { UPLOAD_ROOT } = require("../config/mapStorage.js");

// TESZT
function isAllowedToGetImage(request, imageId) {
    return true;
}

//?GET /api/game_maps/getImageByPointId
router.get("/getImageByPointId", async (request, response) => {
    try {
        if (!request.query.pointId || request.query.pointId.trim() == "") {
            const error = new Error("Nem adott pont ID-t");
            error.statusCode = 400;
            throw error;
        }
        let pointId = Number(request.query.pointId);
        if (!Number.isInteger(pointId)) {
            const error = new Error("Helytelen pont ID");
            error.statusCode = 400;
            throw error;
        }
        if (!isAllowedToGetImage(request, pointId)) {
            const error = new Error("Nincs hozzáférése ehhez a ponthoz");
            error.statusCode = 403;
            throw error;
        }

        let imageData = await database.getPointImage(pointId);

        let options = {
            root: UPLOAD_ROOT
        };
        response.set("Access-Control-Expose-Headers", "imageWidth, imageHeight");
        response.set("imageWidth", imageData.width);
        response.set("imageHeight", imageData.height);
        response.sendFile(imageData.filepath, options, function (err) {
            if (err) {
                if (!response.headersSent) {
                    return response.status(404).json({
                        success: false,
                        error: "A fájl nem létezik vagy helytelen"
                    });
                }
            }
        });
    } catch (error) {
        let message, statusCode;
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

//?GET /api/game_maps/getMapImageById
router.get("/getMapImageById", async (request, response) => {
    try {
        if (!request.query.mapId || request.query.mapId.trim() == "") {
            const error = new Error("Nem adott térkép ID-t");
            error.statusCode = 400;
            throw error;
        }
        let mapId = Number(request.query.mapId);
        if (!Number.isInteger(mapId)) {
            const error = new Error("Helytelen pont ID");
            error.statusCode = 400;
            throw error;
        }
        // TODO isAllowed mapId
        // if (!isAllowedToGetImage(request, mapId)) {
        //     const error = new Error("Nincs hozzáférése ehhez a ponthoz");
        //     error.statusCode = 403;
        //     throw error;
        // }

        let imageData = await database.getMapImage(mapId);

        let options = {
            root: UPLOAD_ROOT
        };
        response.set("Access-Control-Expose-Headers", "imageWidth, imageHeight");
        response.set("imageWidth", imageData.width);
        response.set("imageHeight", imageData.height);
        response.sendFile(imageData.filepath, options, function (err) {
            if (err) {
                if (!response.headersSent) {
                    return response.status(404).json({
                        success: false,
                        error: "A fájl nem létezik vagy helytelen"
                    });
                }
            }
        });
    } catch (error) {
        let message, statusCode;
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
