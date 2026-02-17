const express = require("express");
const router = express.Router();
const database = require("../sql/database.js");
const fs = require("fs/promises");
const crypto = require("crypto");
const sharp = require("sharp");

sharp.cache(false);

//!Multer
const multer = require("multer"); //?npm in stall multer
const path = require("path");

const { TEMP_DIR, UPLOAD_ROOT, MAX_FILE_SIZE } = require("../config/mapStorage.js");

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, TEMP_DIR);
    },
    filename: (request, file, callback) => {
        let uuid = crypto.randomBytes(16).toString("hex");
        let extension = path.extname(file.originalname).toLowerCase();

        callback(null, uuid + extension);
    },
    limits: { fileSize: MAX_FILE_SIZE }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE }
});

//TESZT
function isAllowed(request) {
    return true;
}

const checkAuth = (request, response, next) => {
    // TODO: check authentication
    if (isAllowed(request)) {
        next();
    } else {
        response.status(401).json({
            success: false,
            error: "Jogosulatlan feltöltés"
        });
    }
};

function validateId(id, idName) {
    let num = Number(id);
    if (!Number.isInteger(num) || num <= 0) {
        const err = new Error("Invalid " + idName);
        err.statusCode = 400;
        throw err;
    }
    return num;
};

async function moveUpload(tempPath, destDir, destFilename) {
    await fs.mkdir(destDir, { recursive: true });
    let finalPath = path.join(destDir, destFilename);
    await fs.rename(tempPath, finalPath);
    return finalPath;
}

async function deleteFile(filePath) {
    if (filePath) {
        try {
            await fs.unlink(filePath);
        } catch (err) {
            // error no entry file doesn't exist
            if (err.code != 'ENOENT') {
                console.error("Failed to delete " + filePath + ":", err.message);
            }
        }
    }
}

async function handleUploadError(response, error, file, dbConnection, finalPath) {
    if (dbConnection) {
        try {
            await dbConnection.rollback();
        } catch (rollbackError) {
            console.error("Database rollback failed:", rollbackError);
        }
    }

    if (finalPath) {
        await deleteFile(finalPath);
    }    // Delete destination file if moved


    if (file) {
        await deleteFile(file);
    }
    let statusCode = error.statusCode ? error.statusCode : 500;
    let message = error.statusCode ? error.message : "Váratlan hiba történt!";

    if (statusCode == 500) {
        // unexpected errors are logged
        console.error(error);
    }

    if (!response.headersSent) {
        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
}

async function processImageMetadata(filePath) {
    let image = sharp(filePath);
    let metadata = await image.metadata();
    return {
        width: metadata.width,
        height: metadata.height,
        extension: "." + metadata.format
    };
}

//!Endpoints:
//?POST /api/map_creator/savePoint
router.post("/savePoint", checkAuth, upload.single("equirectangularImage"), async (request, response) => {
    let dbConnection;
    let finalPath;
    try {
        // console.log(request.session.userid);
        // const userId = request.session.userid;
        // if (userId == undefined) {
        //     const error = new Error("Nincs bejelentkezve!");
        //     error.statusCode = 400;
        //     throw error;
        // }

        // login doesn't work on this branch yet
        const userId = 1;

        const gameMapID = validateId(request.body.gameMapID, "pálya ID");
        const mapID = validateId(request.body.mapID, "térkép ID");

        const xCoordinate = Number(request.body.x);
        const yCoordinate = Number(request.body.y);
        if (!Number.isFinite(xCoordinate) || !Number.isFinite(yCoordinate)) {
            const error = new Error("Helytelen koordináták!");
            error.statusCode = 400;
            throw error;
        }

        if (!request.file) {
            const error = new Error("Nem adott meg képet!");
            error.statusCode = 400;
            throw error;
        }

        let imageData = await processImageMetadata(request.file.path);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let imageId = await database.insertImage(dbConnection, imageData.width, imageData.height, "pending");

        let newPointId = await database.insertPoint(dbConnection, mapID, xCoordinate, yCoordinate, imageId);

        // private/userId/gameMapId/mapId/point_images/pointId/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            mapID.toString(),
            "point_images",
            newPointId.toString()
        );
        let targetPath = path.join(
            UPLOAD_ROOT,
            relativeDestDir
        );
        let targetFileName = newPointId.toString() + imageData.extension;

        finalPath = await moveUpload(request.file.path, targetPath, targetFileName);

        // TODO: create low resolution version of the image
        let dbPath = path.join(relativeDestDir, targetFileName);
        await database.updateImagePath(dbConnection, imageId, dbPath);

        await dbConnection.commit();

        response.status(200).json({
            success: true,
            pointId: newPointId
        });
    } catch (error) {
        await handleUploadError(response, error, request.file, dbConnection, finalPath);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?POST /api/map_creator/saveNewMap
router.post("/saveNewMap", checkAuth, upload.single("mapImage"), async (request, response) => {
    let dbConnection;
    let finalPath;
    try {
        // console.log(request.session.userid);
        // const userId = request.session.userid;
        // if (userId == undefined) {
        //     const error = new Error("Nincs bejelentkezve!");
        //     error.statusCode = 400;
        //     throw error;
        // }

        // login doesn't work on this branch yet
        const userId = 1;
        const gameMapID = validateId(request.body.gameMapID, "pálya ID");
        const title = request.body.title;
        // ^\w{1,20}$ atleast one character long and only characters numbers or underscores
        if (!title || title.trim() == "" || !title.match(/^\w{1,20}$/)) {
            const error = new Error("Helytelen cím!");
            error.statusCode = 400;
            throw error;
        }

        if (!request.file) {
            const error = new Error("Nem adott meg képet!");
            error.statusCode = 400;
            throw error;
        }

        let imageData = await processImageMetadata(request.file.path);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let imageId = await database.insertImage(dbConnection, imageData.width, imageData.height, "pending");

        let newMapId = await database.insertMap(dbConnection, title, gameMapID, imageId);

        // private/userId/gameMapId/mapId/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            newMapId.toString()
        );
        let targetPath = path.join(
            UPLOAD_ROOT,
            relativeDestDir
        );
        // TODO: create low res version
        let targetFileName = newMapId.toString() + imageData.extension;

        finalPath = await moveUpload(request.file.path, targetPath, targetFileName);

        let dbPath = path.join(relativeDestDir, targetFileName);
        await database.updateImagePath(dbConnection, imageId, dbPath);

        await dbConnection.commit();

        response.status(200).json({
            success: true,
            mapId: newMapId,
            message: "Térkép sikeresen mentve!"
        });

    } catch (error) {
        await handleUploadError(response, error, request.file, dbConnection, finalPath);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?GET /api/map_creator/:mapid/points
router.get("/:mapid/points", async (request, response) => {
    try {
        let mapId = Number(request.params.mapid);
        if (!Number.isInteger(mapId)) {
            const error = new Error("Helytelen map ID");
            error.statusCode = 400;
            throw error;
        }

        // TODO: check if has access
        let point_data = await database.getPointsOnMap(mapId);

        response.status(200).json({
            success: true,
            points: point_data
        });
    } catch (error) {
        let statusCode = error.statusCode ? error.statusCode : 500;
        let message = error.statusCode ? error.message : "Váratlan hiba történt!";
        if (statusCode == 500) {
            console.error(error);
        }

        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
});

//?GET /api/map_creator/maps?gameMapID=1
router.get("/maps", checkAuth, async (request, response) => {
    try {
        const gameMapID = validateId(request.query.gameMapID, "pálya ID");

        let mapList = await database.getMapsByGameMapId(gameMapID);

        response.status(200).json({
            success: true,
            maps: mapList
        });
    } catch (error) {
        let statusCode = error.statusCode ? error.statusCode : 500;
        let message = error.message || "Váratlan hiba történt!";

        if (statusCode === 500) console.error(error);

        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
});

module.exports = router;
