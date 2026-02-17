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
    if (isAllowed(request)) {
        next();
    } else {
        response.status(401).json({
            success: false,
            error: "Jogosulatlan feltöltés"
        });
    }
};
let currPointID = 0;

async function moveUpload(tempPath, destDir, destFilename) {
    await fs.mkdir(destDir, { recursive: true });
    let finalPath = path.join(destDir, destFilename);
    await fs.rename(tempPath, finalPath);
    return finalPath;
}

async function handleUploadError(response, error, file, dbConnection, finalPath) {
    console.error(error);
    if (file) {
        fs.unlink(file.path).catch(function (error) {
            console.error("Átmeneti fáj törlése sikertelen volt:", error)
        });
    }

    if (dbConnection) {
        dbConnection.rollback();
    }
    let statusCode = error.statusCode ? error.statusCode : 500;
    let message = error.statusCode ? error.message : "Váratlan hiba történt!";

    response.status(statusCode).json({
        success: false,
        error: message
    });
}

//!Endpoints:
//?POST /api/map_creator/savePoint
router.post("/savePoint", checkAuth, upload.single("equirectangularImage"), async (request, response) => {
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

        const gameMapID = Number(request.body.gameMapID);
        if (!Number.isInteger(gameMapID)) {
            const error = new Error("Helytelen pálya ID!");
            error.statusCode = 400;
            throw error;
        }
        const mapID = Number(request.body.mapID);
        if (!Number.isInteger(mapID) && mapID > 0) {
            const error = new Error("Helytelen térkép ID!");
            error.statusCode = 400;
            throw error;
        }
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

        let pathInfo = path.parse(request.file.path);

        currPointID++;

        // private/userId/gameMapId/mapId/point_images/pointId/
        let targetPath = path.join(
            UPLOAD_ROOT,
            userId.toString(),
            gameMapID.toString(),
            mapID.toString(),
            "point_images",
            currPointID.toString()
        );
        let targetFileName = currPointID.toString() + pathInfo.ext;

        await moveUpload(request.file.path, targetPath, targetFileName);

        // TODO: create low resolution version of the image
        // TODO: if succesful til here save to database too

        await new Promise(r => setTimeout(r, 2000));
        response.status(200).json({
            success: true,
            pointId: currPointID
        });
    } catch (error) {
        await handleUploadError(response, error, request.file);
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
        const gameMapID = Number(request.body.gameMapID);
        if (!Number.isInteger(gameMapID)) {
            const error = new Error("Helytelen pálya ID!");
            error.statusCode = 400;
            throw error;
        }

        if (!request.file) {
            const error = new Error("Nem adott meg képet!");
            error.statusCode = 400;
            throw error;
        }

        let image = sharp(request.file.path);
        let imageData = await image.metadata();
        let imageWidth = imageData.width;
        let imageHeight = imageData.height;

        let pathInfo = path.parse(request.file.path);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let imageId = await database.insertImage(dbConnection, imageWidth, imageHeight, "pending");

        let newMapId = await database.insertMap(dbConnection, gameMapID, imageId);

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
        let targetFileName = newMapId.toString() + pathInfo.ext;

        finalPath = await moveUpload(request.file.path, targetPath, targetFileName);

        let dbPath = path.join(relativeDestDir, targetFileName);
        await database.updateImagePath(dbConnection, imageId, dbPath);

        await dbConnection.commit();

        await new Promise(r => setTimeout(r, 1000));

        response.status(200).json({
            success: true,
            mapId: newMapId,
            message: "Térkép sikeresen mentve!"
        });

    } catch (error) {
        console.error(error);

        if (dbConnection) {
            dbConnection.rollback();
        }

        if (finalPath) {
            await fs.unlink(finalPath).catch(() => { });
        }

        if (request.file) {
            await fs.access(request.file.path)
                .then(() =>
                    fs.unlink(request.file.path)
                        .catch(function (error) {
                            console.error("Átmeneti fáj törlése sikertelen volt:", error)
                        }))
                .catch(() => { });
        }

        let statusCode = error.statusCode ? error.statusCode : 500;
        let message = error.statusCode ? error.message : "Váratlan hiba történt!";

        response.status(statusCode).json({
            success: false,
            error: message
        });
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?GET /api/map_creator/testImage
router.get("/testImage", async (request, response) => {
    let options = {
        root: path.join(UPLOAD_ROOT, "equirectangular")
    };

    response.sendFile("Cathedral.webp", options, function (err) {
        if (err) {
            if (!response.headersSent) {
                return response.status(404).json({
                    success: false,
                    error: "A fájl nem létezik vagy helytelen"
                });
            }
        }
    });
});


module.exports = router;
