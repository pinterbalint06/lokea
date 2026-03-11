const express = require("express");
const router = express.Router();
const database = require("../sql/database.js");

const path = require("path");

const { UPLOAD_ROOT } = require("../config/mapStorage.js");

// TESZT
function isAllowedToGetImage(request, imageId) {
    return true;
}

function validateId(id, idName) {
    let num = Number(id);
    if (!Number.isInteger(num) || num <= 0) {
        const err = new Error("Helytelen " + idName);
        err.statusCode = 400;
        throw err;
    }
    return num;
};

function resolvePointImagePath(filePath, resolution) {
    let finalFilePath = filePath;
    if (resolution == "low") {
        let imagePath = path.parse(filePath);

        finalFilePath = path.join(imagePath.dir, imagePath.name + "_low_res" + imagePath.ext);
    }
    return finalFilePath;
}

//?GET /api/game-maps/points/:pointID/image
router.get("/points/:pointID/image", async (request, response) => {
    try {
        const pointID = parseInt(request.params.pointID);
        if (isNaN(pointID)) {
            const error = new Error("Helytelen pont ID");
            error.statusCode = 400;
            throw error;
        }
        if (!isAllowedToGetImage(request, pointID)) {
            const error = new Error("Nincs hozzáférése ehhez a ponthoz");
            error.statusCode = 403;
            throw error;
        }

        let resolution = "high";
        if (request.query.resolution != undefined) {
            if (typeof request.query.resolution != "string") {
                const error = new Error("Helytelen felbontás");
                error.statusCode = 400;
                throw error;
            }

            resolution = request.query.resolution.trim().toLowerCase();
            if (resolution != "low" && resolution != "high") {
                const error = new Error("Helytelen felbontás");
                error.statusCode = 400;
                throw error;
            }
        }

        let imageData = await database.getPointImage(pointID);
        let imagePath = resolvePointImagePath(imageData.filepath, resolution);

        let options = {
            root: UPLOAD_ROOT
        };
        response.set("Access-Control-Expose-Headers", "imageWidth, imageHeight");
        response.set("imageWidth", imageData.width);
        response.set("imageHeight", imageData.height);
        response.sendFile(imagePath, options, function (err) {
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

//?GET /api/game-maps/maps/:mapID/image
router.get("/maps/:mapID/image", async (request, response) => {
    try {
        const mapID = parseInt(request.params.mapID);
        if (isNaN(mapID)) {
            const error = new Error("Helytelen térkép ID");
            error.statusCode = 400;
            throw error;
        }
        // TODOp isAllowed mapId
        // if (!isAllowedToGetImage(request, mapId)) {
        //     const error = new Error("Nincs hozzáférése ehhez a ponthoz");
        //     error.statusCode = 403;
        //     throw error;
        // }

        let resolution = "high";
        if (request.query.resolution != undefined) {
            if (typeof request.query.resolution != "string") {
                const error = new Error("Helytelen felbontás");
                error.statusCode = 400;
                throw error;
            }

            resolution = request.query.resolution.trim().toLowerCase();
            if (resolution != "low" && resolution != "high") {
                const error = new Error("Helytelen felbontás");
                error.statusCode = 400;
                throw error;
            }
        }

        let imageData = await database.getMapImage(mapID);
        let imagePath = resolvePointImagePath(imageData.filepath, resolution);

        let options = {
            root: UPLOAD_ROOT
        };
        response.set("Access-Control-Expose-Headers", "imageWidth, imageHeight");
        response.set("imageWidth", imageData.width);
        response.set("imageHeight", imageData.height);
        response.sendFile(imagePath, options, function (err) {
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

//?GET /api/game-maps/points/:pointID/connections
router.get("/points/:pointID/connections", async (request, response) => {
    try {
        const pointID = validateId(request.params.pointID, "pont ID");
        // TODOp isAllowed pointId
        // if (!isAllowedToGetConnections(request, pointId)) {
        //     const error = new Error("Nincs hozzáférése ehhez a ponthoz");
        //     error.statusCode = 403;
        //     throw error;
        // }

        let connectionList = await database.getConnectionsByPointId(pointID);


        response.status(200).json({
            success: true,
            connections: connectionList
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
