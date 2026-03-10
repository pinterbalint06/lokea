const express = require("express");
const router = express.Router();
const database = require("../sql/database.js");
const fs = require("fs/promises");
const { checkAuth } = require("../auth.js");
const crypto = require("crypto");
const sharp = require("sharp");

sharp.cache(false);

//!Multer
const multer = require("multer"); //?npm install multer
const path = require("path");

const { TEMP_DIR, UPLOAD_ROOT, MAX_FILE_SIZE } = require("../config/mapStorage.js");

const storage = multer.diskStorage({
    destination: async (request, file, callback) => {
        try {
            await fs.mkdir(TEMP_DIR, { recursive: true });
            callback(null, TEMP_DIR);
        } catch (error) {
            callback(error, null);
        }
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

function validateId(id, idName) {
    let num = Number(id);
    if (!Number.isInteger(num) || num <= 0) {
        const err = new Error("Helytelen " + idName);
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
            if (err.code != "ENOENT") {
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


    if (file && file.path) {
        await deleteFile(file.path);
    }
    let statusCode = error.statusCode ? error.statusCode : 500;
    let message = error.statusCode ? error.message : "Váratlan hiba történt!";

    if (!error.statusCode) {
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
        sharpInstance: image,
        width: metadata.width,
        height: metadata.height,
        extension: "." + metadata.format
    };
}

async function assertUserOwnsGameMap(userId, gameMapID) {
    if (!await database.checkUserOwnsGameMap(userId, gameMapID)) {
        const error = new Error("Nincs hozzáférése ehhez a pályához");
        error.statusCode = 403;
        throw error;
    }
}

async function assertUserOwnsMap(userId, mapID) {
    if (!await database.checkUserOwnsMap(userId, mapID)) {
        const error = new Error("Nincs hozzáférése ehhez a térképhez");
        error.statusCode = 403;
        throw error;
    }
}

async function assertUserOwnsPoint(userId, pointID) {
    if (!await database.checkUserOwnsPoint(userId, pointID)) {
        const error = new Error("Nincs hozzáférése ehhez a ponthoz");
        error.statusCode = 403;
        throw error;
    }
}

async function assertUserOwnsConnection(userId, connectionID) {
    if (!await database.checkUserOwnsConnection(userId, connectionID)) {
        const error = new Error("Nincs hozzáférése ehhez a kapcsolathoz");
        error.statusCode = 403;
        throw error;
    }
}

//!Endpoints:
//?POST /api/map_creator/savePoint
router.post("/savePoint", checkAuth, upload.single("equirectangularImage"), async (request, response) => {
    let dbConnection;
    let finalPath;
    try {
        const userId = request.session.userid;

        const gameMapID = validateId(request.body.gameMapID, "pálya ID");
        const mapID = validateId(request.body.mapID, "térkép ID");

        await assertUserOwnsGameMap(userId, gameMapID);

        const xCoordinate = Number(request.body.x);
        const yCoordinate = Number(request.body.y);
        if (!Number.isFinite(xCoordinate) || !Number.isFinite(yCoordinate)) {
            const error = new Error("Helytelen koordináták!");
            error.statusCode = 400;
            throw error;
        }

        const northDirection = Number(request.body.northDirection);
        if (!Number.isFinite(northDirection) || northDirection > 359 || northDirection < 0) {
            const error = new Error("Helytelen északirány!");
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

        let newPointId = await database.insertPoint(dbConnection, mapID, xCoordinate, yCoordinate, northDirection, imageId);

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
        let baseName = newPointId.toString() + "_" + crypto.randomBytes(4).toString("hex");

        let targetFileName = baseName + ".webp";
        let lowResFileName = baseName + "_low_res.webp";

        await fs.mkdir(targetPath, { recursive: true });

        await imageData.sharpInstance
            .webp(
                {
                    quality: 80
                })
            .toFile(path.join(targetPath, targetFileName));

        await imageData.sharpInstance
            .webp(
                {
                    quality: 50
                })
            .resize(
                {
                    width: 600
                })
            .toFile(path.join(targetPath, lowResFileName));

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

//?DELETE /api/map_creator/point/:pointId
router.delete("/point/:pointId", checkAuth, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const pointID = validateId(request.params.pointId, "pont ID");

        await assertUserOwnsPoint(userId, pointID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let pointInfo = await database.getPointInfo(pointID);
        if (!pointInfo) {
            const error = new Error("A pont nem létezik");
            error.statusCode = 404;
            throw error;
        }

        let oldImageInfo = await database.getPointImage(pointID);

        if (oldImageInfo && oldImageInfo.image_id) {
            let successImageDeletion = await database.deleteImageById(dbConnection, oldImageInfo.image_id);
            if (!successImageDeletion) {
                const error = new Error("A kép törlése nem sikerült");
                error.statusCode = 500;
                throw error;
            }
        }

        let successPointDeletion = await database.deletePointById(dbConnection, pointID);
        if (!successPointDeletion) {
            const error = new Error("A pont törlése nem sikerült");
            error.statusCode = 500;
            throw error;
        }

        await dbConnection.commit();

        let gameMapID = pointInfo.game_maps_id;
        let mapID = pointInfo.map_id;
        // userId/gameMapId/mapId/point_images/pointId/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            mapID.toString(),
            "point_images",
            pointID.toString()
        );

        // private/userId/gameMapId/mapId/point_images/pointId/
        let targetPath = path.join(
            UPLOAD_ROOT,
            relativeDestDir
        );

        try {
            await fs.rm(targetPath, { recursive: true, force: true });
        } catch (err) {
            console.error(`Error deleting directory ${targetPath}: ${err.message}`);
        }

        response.status(200).json({
            success: true
        });
    } catch (error) {
        await handleUploadError(response, error, null, dbConnection, null);
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
        const userId = request.session.userid;

        const gameMapID = validateId(request.body.gameMapID, "pálya ID");

        await assertUserOwnsGameMap(userId, gameMapID);

        const title = request.body.title;
        // ^\w{1,20}$ atleast one character long and only characters numbers or underscores
        if (!title || typeof title != "string") {
            const error = new Error("Helytelen térképnév!");
            error.statusCode = 400;
            throw error;
        }

        const trimmedTitle = title.trim();
        if (!trimmedTitle.match(/^\w{1,20}$/)) {
            const error = new Error("Helytelen térképnév!");
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

        let newMapId = await database.insertMap(dbConnection, trimmedTitle, gameMapID, imageId);

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
        // TODOp: create low res version
        let targetFileName = newMapId.toString() + "_" + crypto.randomBytes(4).toString("hex") + imageData.extension;

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

//?PUT /api/map_creator/map/:mapId
router.put("/map/:mapId", checkAuth, upload.none(), async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;
        const mapID = validateId(request.params.mapId, "térkép ID");

        await assertUserOwnsMap(userId, mapID);

        const title = request.body.title;
        // ^\w{1,20}$ atleast one character long and only characters numbers or underscores
        if (!title || typeof title != "string") {
            const error = new Error("Helytelen térképnév!");
            error.statusCode = 400;
            throw error;
        }

        const trimmedTitle = title.trim();
        if (!trimmedTitle.match(/^\w{1,20}$/)) {
            const error = new Error("Helytelen térképnév!");
            error.statusCode = 400;
            throw error;
        }

        // Check if map exists
        let mapInfo = await database.getMapInfo(mapID);
        if (!mapInfo) {
            let error = new Error("A térkép nem létezik");
            error.statusCode = 404;
            throw error;
        }

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let affectedRows = await database.updateMapTitle(dbConnection, mapID, trimmedTitle);

        if (affectedRows != 1) {
            let error = new Error("A térkép átnevezése nem sikerült");
            error.statusCode = 500;
            throw error;
        }

        await dbConnection.commit();

        response.status(200).json({
            success: true,
            mapId: mapID,
            title: trimmedTitle
        });
    } catch (error) {
        await handleUploadError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?DELETE /api/map_creator/map/:mapId
router.delete("/map/:mapId", checkAuth, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const mapID = validateId(request.params.mapId, "térkép ID");

        await assertUserOwnsMap(userId, mapID);

        let mapInfo = await database.getMapInfo(mapID);
        if (!mapInfo) {
            const error = new Error("A térkép nem létezik");
            error.statusCode = 404;
            throw error;
        }

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let imageIdsToDelete = await database.getAllImageIdsForMap(dbConnection, mapID);

        let successMapDeletion = await database.deleteMapById(dbConnection, mapID);
        if (!successMapDeletion) {
            const error = new Error("A térkép törlése nem sikerült");
            error.statusCode = 500;
            throw error;
        }

        for (const imageId of imageIdsToDelete) {
            let deletedRows = await database.deleteImageById(dbConnection, imageId);
            if (deletedRows > 1) {
                console.error("Multiple rows affected at ID delete");
                let error = {
                    statusCode: 500
                };
                throw error;
            }
        }

        await dbConnection.commit();

        let gameMapID = mapInfo.game_maps_id;
        // userId/gameMapId/mapId/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            mapID.toString()
        );

        // private/userId/gameMapId/mapId/
        let targetPath = path.join(
            UPLOAD_ROOT,
            relativeDestDir
        );

        try {
            await fs.rm(targetPath, { recursive: true, force: true });
        } catch (err) {
            console.error(`Error deleting directory ${targetPath}: ${err.message}`);
        }

        response.status(200).json({
            success: true
        });
    } catch (error) {
        await handleUploadError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?POST /api/map_creator/saveConnection
router.post("/saveConnection", checkAuth, upload.none(), async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const startPointId = validateId(request.body.startPointId, "kezdőpont ID");
        const endPointId = validateId(request.body.endPointId, "végpont ID");
        const gameMapID = validateId(request.body.gameMapID, "pálya ID");

        await assertUserOwnsGameMap(userId, gameMapID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        if (!await database.arePointsInSameGameMap(dbConnection, startPointId, endPointId)) {
            const err = new Error("A megadott pontok nem ugyanahhoz a pályához tartoznak!");
            err.statusCode = 400;
            throw err;
        }

        if (await database.doesConnectionAlreadyExist(dbConnection, startPointId, endPointId)) {
            const err = new Error("A megadott pontok már össze vannak kapcsolva!");
            err.statusCode = 400;
            throw err;
        }

        let connectionId = await database.insertConnection(dbConnection, startPointId, endPointId, gameMapID);

        await dbConnection.commit();

        response.status(200).json({
            success: true,
            connectionId: connectionId,
            message: "Kapcsolat sikeresen mentve!"
        });

    } catch (error) {
        await handleUploadError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?DELETE /api/map_creator/connection/:connectionId
router.delete("/connection/:connectionId", checkAuth, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const connectionId = validateId(request.params.connectionId, "kapcsolat ID");

        await assertUserOwnsConnection(userId, connectionId);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let successConnectionDeletion = await database.deleteConnectionById(dbConnection, connectionId);

        if (!successConnectionDeletion) {
            const err = new Error("A kapcsolat nem található vagy már törölve lett!");
            err.statusCode = 404;
            throw err;
        }

        await dbConnection.commit();

        response.status(200).json({
            success: true
        });

    } catch (error) {
        await handleUploadError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?GET /api/map_creator/:mapid/points
router.get("/:mapid/points", checkAuth, async (request, response) => {
    try {
        const userId = request.session.userid;
        let mapId = validateId(request.params.mapid, "térkép ID");

        await assertUserOwnsMap(userId, mapId);

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
        const userId = request.session.userid;
        const gameMapID = validateId(request.query.gameMapID, "pálya ID");

        await assertUserOwnsGameMap(userId, gameMapID);

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

//?PUT /api/map_creator/point/:pointId
router.put("/point/:pointId", checkAuth, upload.single("equirectangularImage"), async (request, response) => {
    let dbConnection;
    let finalPath;

    try {
        const userId = request.session.userid;

        let pointId = validateId(request.params.pointId, "pont ID");

        await assertUserOwnsPoint(userId, pointId);

        const xCoordinate = Number(request.body.x);
        const yCoordinate = Number(request.body.y);
        if (!Number.isFinite(xCoordinate) || !Number.isFinite(yCoordinate)) {
            const error = new Error("Helytelen koordináták!");
            error.statusCode = 400;
            throw error;
        }

        const northDirection = Number(request.body.northDirection);
        if (!Number.isFinite(northDirection) || northDirection > 359 || northDirection < 0) {
            const error = new Error("Helytelen északirány!");
            error.statusCode = 400;
            throw error;
        }

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let pointInfo = await database.getPointInfo(pointId);
        if (!pointInfo) {
            const error = new Error("A pont nem létezik");
            error.statusCode = 400;
            throw error;
        }

        // only update if anything is different
        if (pointInfo.point_x != xCoordinate || pointInfo.point_y != yCoordinate) {
            let affectedRows = await database.updatePointCoordinates(dbConnection, pointId, xCoordinate, yCoordinate);
            if (affectedRows > 1) {
                console.error("Multiple rows affected at ID update");
                let error = {
                    statusCode: 500
                };
                throw error;
            }
        }
        if (pointInfo.north_direction != northDirection) {
            let affectedRows = await database.updatePointNorthDirection(dbConnection, pointId, northDirection);
            if (affectedRows > 1) {
                console.error("Multiple rows affected at ID update");
                let error = {
                    statusCode: 500
                };
                throw error;
            }
        }

        if (request.file) {
            let oldImageInfo = await database.getPointImage(pointId);

            let imageData = await processImageMetadata(request.file.path);
            let newImageId = await database.insertImage(dbConnection, imageData.width, imageData.height, "pending");
            let gameMapID = pointInfo.game_maps_id;
            let mapID = pointInfo.map_id;

            let relativeDestDir = path.join(
                userId.toString(),
                gameMapID.toString(),
                mapID.toString(),
                "point_images",
                pointId.toString()
            );
            let targetPath = path.join(
                UPLOAD_ROOT,
                relativeDestDir
            );
            let baseName = pointId.toString() + "_" + crypto.randomBytes(4).toString("hex");
            let targetFileName = baseName + ".webp";
            let lowResFileName = baseName + "_low_res.webp";

            await fs.mkdir(targetPath, { recursive: true });

            await imageData.sharpInstance
                .webp({ quality: 80 })
                .toFile(path.join(targetPath, targetFileName));

            finalPath = path.join(targetPath, targetFileName);

            await imageData.sharpInstance
                .webp({ quality: 50 })
                .resize({ width: 600 })
                .toFile(path.join(targetPath, lowResFileName));

            let dbPath = path.join(relativeDestDir, targetFileName);

            await database.updateImagePath(dbConnection, newImageId, dbPath);

            // update point's image to the new id
            let imageUpdateRows = await database.updatePointImage(dbConnection, pointId, newImageId);
            if (imageUpdateRows > 1) {
                console.error("Multiple rows affected at ID update");
                let error = {
                    statusCode: 500
                };
                throw error;
            }

            if (oldImageInfo) {
                // delete old image from db
                let deletedRows = await database.deleteImageById(dbConnection, oldImageInfo.image_id);
                if (deletedRows > 1) {
                    console.error("Multiple rows affected at ID delete");
                    let error = {
                        statusCode: 500
                    };
                    throw error;
                }
            }

            if (oldImageInfo && oldImageInfo.filepath) {
                let absoluteOldPath = path.join(UPLOAD_ROOT, oldImageInfo.filepath);
                // delete old full-res file
                fs.unlink(absoluteOldPath)
                    .catch(function () {
                        console.error("unsuccessful deletion: " + absoluteOldPath);
                    });
                // delete old low-res file
                let imagePath = path.parse(absoluteOldPath);

                let oldLowResPath = path.join(imagePath.dir, imagePath.name + "_low_res" + imagePath.ext);
                fs.unlink(oldLowResPath)
                    .catch(function () {
                        console.error("unsuccessful deletion: " + oldLowResPath);
                    });
            }
        }

        await dbConnection.commit();

        response.status(200).json({
            success: true,
            message: "Pont sikeresen frissítve!"
        });

    } catch (error) {
        await handleUploadError(response, error, request.file, dbConnection, finalPath);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?GET /api/map_creator/:gameMapID/connections
router.get("/:gameMapID/connections", checkAuth, async (request, response) => {
    try {
        const userId = request.session.userid;
        const gameMapID = validateId(request.params.gameMapID, "pálya ID");

        await assertUserOwnsGameMap(userId, gameMapID);

        let connectionList = await database.getConnectionsByGameMapId(gameMapID);

        response.status(200).json({
            success: true,
            connections: connectionList
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

router.use((error, request, response, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return response.status(413).json({
                success: false,
                error: "Túl nagy fájlméret! (Max 10MB)"
            });
        }
        return response.status(400).json({
            success: false,
            error: "Fájlfeltöltési hiba történt!"
        });
    }
    next(error);
});

module.exports = router;

// TODOp!!: api vegpontok atirasa pls /saveNewMap helyett /map POST stb.
// TODOp!!!: webp konvertálás és low res egységesítése
// TODOp!!!: webp konvertálás és low res verzó térképhez is