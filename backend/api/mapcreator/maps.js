const express = require("express");
const router = express.Router();
const database = require("../../sql/database.js");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { checkAuth } = require("../../auth.js");
const { UPLOAD_ROOT } = require("../../config/mapStorage.js");
const { processImageMetadata, createWebpAndLowRes } = require("../../utils/imageProcessor.js");
const { deleteFile } = require("../../utils/fileUtils.js");
const AppError = require("../../utils/AppError.js");

const { validateId, cleanupAfterError, assertUserOwnsGameMap, assertUserOwnsMap, requireBody } = require("./utils.js");
const upload = require("./uploadConfig.js");

//!Endpoints:
//?GET /api/map-creator/game-maps/:gameMapID/maps
router.get("/game-maps/:gameMapID/maps", checkAuth, async (request, response, next) => {
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
        next(error);
    }
});

//?PUT /api/map-creator/maps/:mapID
router.put("/maps/:mapID", checkAuth, upload.none(), requireBody, async (request, response, next) => {
    let dbConnection;
    try {
        const userId = request.session.userid;
        const mapID = validateId(request.params.mapID, "térkép ID");

        const title = request.body.title;
        if (!title || typeof title != "string") {
            throw new AppError("Helytelen térképnév!", 400);
        }

        const trimmedTitle = title.trim();
        // /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]{1,20}$/ atleast one character long, max 20. only hungarian letters, numbers, spaces, underscores and -
        if (!trimmedTitle.match(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]{1,20}$/)) {
            throw new AppError("Helytelen térképnév!", 400);
        }

        await assertUserOwnsMap(userId, mapID);

        // Check if map exists
        let mapInfo = await database.getMapInfo(mapID);
        if (!mapInfo) {
            throw new AppError("A térkép nem létezik", 404);
        }

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let affectedRows = await database.updateMapTitle(dbConnection, mapID, trimmedTitle);

        if (affectedRows != 1) {
            throw new AppError("A térkép átnevezése nem sikerült", 500);
        }

        await dbConnection.commit();

        response.status(200).json({
            success: true,
            mapId: mapID,
            title: trimmedTitle
        });
    } catch (error) {
        await cleanupAfterError(dbConnection);
        next(error);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?POST /api/map-creator/game-maps/:gameMapID/maps
router.post("/game-maps/:gameMapID/maps", checkAuth, upload.single("mapImage"), requireBody, async (request, response, next) => {
    let dbConnection;
    let processedImagePaths = null;
    try {
        const userId = request.session.userid;

        const gameMapID = validateId(request.params.gameMapID, "pálya ID");

        const title = request.body.title;
        if (!title || typeof title != "string") {
            throw new AppError("Helytelen térképnév!", 400);
        }

        const trimmedTitle = title.trim();
        // /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]{1,20}$/ atleast one character long, max 20. only hungarian letters, numbers, spaces, underscores and -
        if (!trimmedTitle.match(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]{1,20}$/)) {
            throw new AppError("Helytelen térképnév!", 400);
        }

        if (!request.file) {
            throw new AppError("Nem adott meg képet!", 400);
        }

        await assertUserOwnsGameMap(userId, gameMapID);

        let imageData;
        try {
            imageData = await processImageMetadata(request.file.path);
        } catch (err) {
            throw new AppError("Hiba a kép feldolgozásakor!", 500);
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
        await cleanupAfterError(dbConnection, request.file, processedImagePaths);
        next(error);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?DELETE /api/map-creator/maps/:mapID
router.delete("/maps/:mapID", checkAuth, async (request, response, next) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const mapID = validateId(request.params.mapID, "térkép ID");

        await assertUserOwnsMap(userId, mapID);

        let mapInfo = await database.getMapInfo(mapID);
        if (!mapInfo) {
            throw new AppError("A térkép nem létezik", 404);
        }

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let imageIdsToDelete = await database.getAllImageIdsForMap(dbConnection, mapID);

        let successMapDeletion = await database.deleteMapById(dbConnection, mapID);
        if (!successMapDeletion) {
            throw new AppError("A térkép törlése nem sikerült", 500);
        }

        for (const imageId of imageIdsToDelete) {
            let successImageDeletion = await database.deleteImageById(dbConnection, imageId);
            if (!successImageDeletion) {
                throw new AppError("A térkép képeinek törlése nem sikerült", 500);
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
        await cleanupAfterError(dbConnection);
        next(error);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

module.exports = router;
