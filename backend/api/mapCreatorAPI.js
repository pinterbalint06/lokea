const express = require("express");
const router = express.Router();
const database = require("../sql/database.js");
const fs = require("fs/promises");
const { checkAuth } = require("../auth.js");
const crypto = require("crypto");
const { processImageMetadata, createWebpAndLowRes, deleteImageAndLowResByMainPath } = require("../utils/imageProcessor.js");
const { deleteFile } = require("../utils/fileUtils.js");

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
    if (id == undefined || id == null) {
        const err = new Error("Helytelen " + idName);
        err.statusCode = 400;
        throw err;
    }
    const str = String(id);
    const num = Number(id);
    if (!str.match(/^[0-9]+$/) || isNaN(num) || num <= 0 || !Number.isInteger(num) || num > 2147483647) {
        const err = new Error("Helytelen " + idName);
        err.statusCode = 400;
        throw err;
    }
    return num;
}

async function handleError(response, error, file, dbConnection, processedImagePaths) {
    if (dbConnection) {
        try {
            await dbConnection.rollback();
        } catch (rollbackError) {
            console.error("Database rollback failed:", rollbackError);
        }
    }

    if (processedImagePaths) {
        let pathsToDelete = [];
        if (processedImagePaths.mainPath) {
            pathsToDelete.push(processedImagePaths.mainPath)
        };
        if (processedImagePaths.lowResPath) {
            pathsToDelete.push(processedImagePaths.lowResPath)
        };
        try {
            await Promise.all(pathsToDelete.map(path => deleteFile(path)));
        } catch (deleteErr) {
            console.error("Error deleting processed image paths:", deleteErr);
        }
    }


    if (file && file.path) {
        try {
            await deleteFile(file.path);
        } catch (deleteErr) {
            console.error("Error deleting temporary uploaded file:", deleteErr);
        }
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

const requireBody = async (request, response, next) => {
    if (request.body) {
        next();
    }
    else {
        if (request.file && request.file.path) {
            await deleteFile(request.file.path);
        }
        response.status(400).json({
            success: false,
            error: "Hiányzó adatok!"
        });
    }

};

//!Endpoints:
//?POST /api/map-creator/maps/:mapID/points
router.post("/maps/:mapID/points", checkAuth, upload.single("equirectangularImage"), requireBody, async (request, response) => {
    let dbConnection;
    let processedImagePaths = null;
    try {
        const userId = request.session.userid;

        const mapID = validateId(request.params.mapID, "térkép ID");

        const uCoordinate = Number(request.body.u);
        const vCoordinate = Number(request.body.v);
        if (!Number.isFinite(uCoordinate) || !Number.isFinite(vCoordinate) || uCoordinate < 0 || uCoordinate >= 1 || vCoordinate < 0 || vCoordinate >= 1) {
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

        await assertUserOwnsMap(userId, mapID);

        const gameMapID = await database.getGameMapIdByMapId(mapID);
        if (!gameMapID) {
            const error = new Error("Váratlan hiba történt!");
            error.statusCode = 500;
            throw error;
        }

        let imageData;
        try {
            imageData = await processImageMetadata(request.file.path);
        } catch (err) {
            console.error(err);
            const error = new Error("Hiba a kép feldolgozásakor!");
            error.statusCode = 500;
            throw error;
        }

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let existingPoints = await database.getPointOnMapByCoordinates(dbConnection, mapID, uCoordinate, vCoordinate);
        if (existingPoints.length > 0) {
            const error = new Error("Ezen a térképen már létezik pont ezeken a koordinátákon!");
            error.statusCode = 409;
            throw error;
        }

        let imageId = await database.insertImage(dbConnection, imageData.width, imageData.height, "pending");

        let newPointId = await database.insertPoint(dbConnection, mapID, uCoordinate, vCoordinate, northDirection, imageId);

        // private/userId/gameMapId/mapId/point_images/pointID/
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

        processedImagePaths = await createWebpAndLowRes({
            inputFilePath: request.file.path,
            outputDirPath: targetPath,
            baseName: baseName
        });

        let dbPath = path.join(relativeDestDir, processedImagePaths.targetFileName);

        await database.updateImagePath(dbConnection, imageId, dbPath);

        await dbConnection.commit();

        if (request.file && request.file.path) {
            try {
                await deleteFile(request.file.path);
            } catch (error) {
                console.error(`Failed to delete temporary file ${request.file.path}: `, error);
            }
        }

        response.status(201).json({
            success: true,
            pointId: newPointId
        });
    } catch (error) {
        await handleError(response, error, request.file, dbConnection, processedImagePaths);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?DELETE /api/map-creator/points/:pointID
router.delete("/points/:pointID", checkAuth, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const pointID = validateId(request.params.pointID, "pont ID");

        await assertUserOwnsPoint(userId, pointID);

        let pointInfo = await database.getPointInfo(pointID);
        if (!pointInfo) {
            const error = new Error("A pont nem létezik");
            error.statusCode = 404;
            throw error;
        }

        let oldImageInfo = await database.getPointImage(pointID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

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
        // userId/gameMapId/mapId/point_images/pointID/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            mapID.toString(),
            "point_images",
            pointID.toString()
        );

        // private/userId/gameMapId/mapId/point_images/pointID/
        let targetPath = path.join(
            UPLOAD_ROOT,
            relativeDestDir
        );

        try {
            await fs.rm(targetPath, { recursive: true, force: true });
        } catch (err) {
            console.error(`Error deleting directory ${targetPath}: ${err.message}`);
        }

        response.status(204).send();
    } catch (error) {
        await handleError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?POST /api/map-creator/game-maps/:gameMapID/maps
router.post("/game-maps/:gameMapID/maps", checkAuth, upload.single("mapImage"), requireBody, async (request, response) => {
    let dbConnection;
    let processedImagePaths = null;
    try {
        const userId = request.session.userid;

        const gameMapID = validateId(request.params.gameMapID, "pálya ID");

        const title = request.body.title;
        if (!title || typeof title != "string") {
            const error = new Error("Helytelen térképnév!");
            error.statusCode = 400;
            throw error;
        }

        const trimmedTitle = title.trim();
        // /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]{1,20}$/ atleast one character long, max 20. only hungarian letters, numbers, spaces, underscores and -
        if (!trimmedTitle.match(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]{1,20}$/)) {
            const error = new Error("Helytelen térképnév!");
            error.statusCode = 400;
            throw error;
        }

        if (!request.file) {
            const error = new Error("Nem adott meg képet!");
            error.statusCode = 400;
            throw error;
        }

        await assertUserOwnsGameMap(userId, gameMapID);

        let imageData;
        try {
            imageData = await processImageMetadata(request.file.path);
        } catch (err) {
            const error = new Error("Hiba a kép feldolgozásakor!");
            error.statusCode = 500;
            throw error;
        }

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
        let baseName = newMapId.toString() + "_" + crypto.randomBytes(4).toString("hex");
        processedImagePaths = await createWebpAndLowRes({
            inputFilePath: request.file.path,
            outputDirPath: targetPath,
            baseName: baseName
        });

        let dbPath = path.join(relativeDestDir, processedImagePaths.targetFileName);
        await database.updateImagePath(dbConnection, imageId, dbPath);

        await dbConnection.commit();

        if (request.file && request.file.path) {
            try {
                await deleteFile(request.file.path);
            } catch (error) {
                console.error(`Failed to delete temporary file ${request.file.path}: `, error);
            }
        }

        response.status(201).json({
            success: true,
            mapId: newMapId,
            message: "Térkép sikeresen mentve!"
        });

    } catch (error) {
        await handleError(response, error, request.file, dbConnection, processedImagePaths);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?PUT /api/map-creator/maps/:mapID
router.put("/maps/:mapID", checkAuth, upload.none(), requireBody, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;
        const mapID = validateId(request.params.mapID, "térkép ID");

        const title = request.body.title;
        if (!title || typeof title != "string") {
            const error = new Error("Helytelen térképnév!");
            error.statusCode = 400;
            throw error;
        }

        const trimmedTitle = title.trim();
        // /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]{1,20}$/ atleast one character long, max 20. only hungarian letters, numbers, spaces, underscores and -
        if (!trimmedTitle.match(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]{1,20}$/)) {
            const error = new Error("Helytelen térképnév!");
            error.statusCode = 400;
            throw error;
        }

        await assertUserOwnsMap(userId, mapID);

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
        await handleError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?DELETE /api/map-creator/maps/:mapID
router.delete("/maps/:mapID", checkAuth, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const mapID = validateId(request.params.mapID, "térkép ID");

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
            let successImageDeletion = await database.deleteImageById(dbConnection, imageId);
            if (!successImageDeletion) {
                const error = new Error("A térkép képeinek törlése nem sikerült");
                error.statusCode = 500;
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

        response.status(204).send();
    } catch (error) {
        await handleError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?POST /api/map-creator/game-maps/:gameMapID/connections
router.post("/game-maps/:gameMapID/connections", checkAuth, upload.none(), requireBody, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const startPointId = validateId(request.body.startPointId, "kezdőpont ID");
        const endPointId = validateId(request.body.endPointId, "végpont ID");
        if (startPointId == endPointId) {
            const err = new Error("A kezdőpont és a végpont nem lehet ugyanaz!");
            err.statusCode = 400;
            throw err;
        }
        const gameMapID = validateId(request.params.gameMapID, "pálya ID");

        await assertUserOwnsGameMap(userId, gameMapID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        if (!await database.arePointsInSameGameMap(dbConnection, startPointId, endPointId, gameMapID)) {
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

        response.status(201).json({
            success: true,
            connectionId: connectionId,
            message: "Kapcsolat sikeresen mentve!"
        });

    } catch (error) {
        await handleError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?DELETE /api/map-creator/connections/:connectionID
router.delete("/connections/:connectionID", checkAuth, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const connectionID = validateId(request.params.connectionID, "kapcsolat ID");

        await assertUserOwnsConnection(userId, connectionID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let successConnectionDeletion = await database.deleteConnectionById(dbConnection, connectionID);

        if (!successConnectionDeletion) {
            const err = new Error("A kapcsolat nem létezik vagy már törölve lett!");
            err.statusCode = 404;
            throw err;
        }

        await dbConnection.commit();

        response.status(204).send();
    } catch (error) {
        await handleError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?GET /api/map-creator/maps/:mapID/points
router.get("/maps/:mapID/points", checkAuth, async (request, response) => {
    try {
        const userId = request.session.userid;
        const mapID = validateId(request.params.mapID, "térkép ID");

        await assertUserOwnsMap(userId, mapID);

        let point_data = await database.getPointsOnMap(mapID);

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

//?GET /api/map-creator/game-maps/:gameMapID/maps
router.get("/game-maps/:gameMapID/maps", checkAuth, async (request, response) => {
    try {
        const userId = request.session.userid;
        const gameMapID = validateId(request.params.gameMapID, "pálya ID");

        await assertUserOwnsGameMap(userId, gameMapID);

        let mapList = await database.getMapsByGameMapId(gameMapID);

        response.status(200).json({
            success: true,
            maps: mapList
        });
    } catch (error) {
        let statusCode = error.statusCode ? error.statusCode : 500;
        let message = error.statusCode ? error.message : "Váratlan hiba történt!";

        if (statusCode === 500) console.error(error);

        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
});

//?PUT /api/map-creator/points/:pointID
router.put("/points/:pointID", checkAuth, upload.single("equirectangularImage"), requireBody, async (request, response) => {
    let dbConnection;
    let processedImagePaths = null;

    try {
        const userId = request.session.userid;

        const pointID = validateId(request.params.pointID, "pont ID");

        const uCoordinate = Number(request.body.u);
        const vCoordinate = Number(request.body.v);
        if (!Number.isFinite(uCoordinate) || !Number.isFinite(vCoordinate) || uCoordinate < 0 || uCoordinate >= 1 || vCoordinate < 0 || vCoordinate >= 1) {
            const error = new Error("Helytelen koordináták!");
            error.statusCode = 400;
            throw error;
        }

        const northDirection = Number(request.body.northDirection);
        if (!Number.isFinite(northDirection) || northDirection >= 360 || northDirection < 0) {
            const error = new Error("Helytelen északirány!");
            error.statusCode = 400;
            throw error;
        }

        await assertUserOwnsPoint(userId, pointID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let pointInfo = await database.getPointInfo(pointID);
        if (!pointInfo) {
            const error = new Error("A pont nem létezik");
            error.statusCode = 404;
            throw error;
        }

        // only update if anything is different
        if (pointInfo.point_u != uCoordinate || pointInfo.point_v != vCoordinate) {
            let existingPoints = await database.getPointOnMapByCoordinates(dbConnection, pointInfo.map_id, uCoordinate, vCoordinate);
            if (existingPoints.length > 0) {
                const error = new Error("Ezen a térképen már létezik pont ezeken a koordinátákon!");
                error.statusCode = 409;
                throw error;
            }

            let updateSuccess = await database.updatePointCoordinates(dbConnection, pointID, uCoordinate, vCoordinate);
            if (!updateSuccess) {
                let error = new Error("A pont koordinátáinak frissítése nem sikerült");
                error.statusCode = 500;
                throw error;
            }
        }

        // only update if anything is different
        if (pointInfo.north_direction != northDirection) {
            let updateSuccess = await database.updatePointNorthDirection(dbConnection, pointID, northDirection);
            if (!updateSuccess) {
                let error = new Error("A pont északirányának frissítése nem sikerült");
                error.statusCode = 500;
                throw error;
            }
        }

        if (request.file) {
            let oldImageInfo = await database.getPointImage(pointID);

            let imageData;
            try {
                imageData = await processImageMetadata(request.file.path);
            } catch (err) {
                console.error(err);
                const error = new Error("Hiba a kép feldolgozásakor!");
                error.statusCode = 500;
                throw error;
            }
            let newImageId = await database.insertImage(dbConnection, imageData.width, imageData.height, "pending");
            let gameMapID = pointInfo.game_maps_id;
            let mapID = pointInfo.map_id;

            let relativeDestDir = path.join(
                userId.toString(),
                gameMapID.toString(),
                mapID.toString(),
                "point_images",
                pointID.toString()
            );
            let targetPath = path.join(
                UPLOAD_ROOT,
                relativeDestDir
            );
            let baseName = pointID.toString() + "_" + crypto.randomBytes(4).toString("hex");
            processedImagePaths = await createWebpAndLowRes({
                inputFilePath: request.file.path,
                outputDirPath: targetPath,
                baseName: baseName
            });

            let dbPath = path.join(relativeDestDir, processedImagePaths.targetFileName);

            await database.updateImagePath(dbConnection, newImageId, dbPath);

            // update point's image to the new id
            let updateImageSuccess = await database.updatePointImage(dbConnection, pointID, newImageId);
            if (!updateImageSuccess) {
                let error = new Error("A kép útvonalának frissítése nem sikerült");
                error.statusCode = 500;
                throw error;
            }

            if (oldImageInfo) {
                // delete old image from db
                let deleteSuccess = await database.deleteImageById(dbConnection, oldImageInfo.image_id);
                if (!deleteSuccess) {
                    let error = new Error("A régi kép törlése nem sikerült");
                    error.statusCode = 500;
                    throw error;
                }
            }

            await dbConnection.commit();

            if (oldImageInfo && oldImageInfo.filepath) {
                let absoluteOldPath = path.join(UPLOAD_ROOT, oldImageInfo.filepath);
                deleteImageAndLowResByMainPath(absoluteOldPath)
                    .catch(function () {
                        console.error("unsuccessful deletion: " + absoluteOldPath);
                    });
            }

            if (request.file.path) {
                try {
                    await deleteFile(request.file.path);
                } catch (error) {
                    console.error(`Failed to delete temporary file ${request.file.path}: `, error);
                }
            }
        } else {
            await dbConnection.commit();
        }


        response.status(200).json({
            success: true,
            message: "Pont sikeresen frissítve!"
        });

    } catch (error) {
        await handleError(response, error, request.file, dbConnection, processedImagePaths);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?GET /api/map-creator/game-maps/:gameMapID/connections
router.get("/game-maps/:gameMapID/connections", checkAuth, async (request, response) => {
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
        let message = error.statusCode ? error.message : "Váratlan hiba történt!";

        if (statusCode === 500) {
            console.error(error);
        }

        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
});

router.use(async (error, request, response, next) => {
    if (error instanceof multer.MulterError) {
        if (request.file && request.file.path) {
            try {
                await deleteFile(file.path);
            } catch (deleteErr) {
                console.error("Error deleting temporary uploaded file:", deleteErr);
            }
        }
        if (error.code == "LIMIT_FILE_SIZE") {
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
