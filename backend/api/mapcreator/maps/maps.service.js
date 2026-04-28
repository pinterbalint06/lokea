const database = require("#mapcreator/maps/maps.queries.js");
const { getConnection } = require("#sql/database.js");
const imageQueries = require("#imagequeries");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { UPLOAD_ROOT_MAP_DATA, isInsideRoot } = require("#config/mapdatas-upload-config.js");
const { processImageMetadata, createWebpAndLowRes } = require("#utils/image-processor.js");
const { deleteFile } = require("#utils/file-utils.js");
const { assertUserOwnsGameMap, assertUserOwnsMap, cleanupAfterError } = require("#mapcreator/shared/utils/mapcreator.utils.js");

async function fetchMaps(userId, gameMapID) {
    await assertUserOwnsGameMap(userId, gameMapID);
    return await database.getMapsByGameMapId(gameMapID);
}

async function updateMap(userId, mapID, newTitle) {
    let dbConnection;
    try {
        await assertUserOwnsMap(userId, mapID);

        // Check if map exists
        let mapInfo = await database.getMapInfo(mapID);
        if (!mapInfo) {
            throw new AppError(ERRORS.MAP.NOT_FOUND, 404);
        }

        dbConnection = await getConnection();
        await dbConnection.beginTransaction();

        const updateSuccess = await database.updateMapTitle(dbConnection, mapID, newTitle);
        if (!updateSuccess) {
            throw new AppError(ERRORS.MAP.RENAME_FAILED, 500);
        }

        await dbConnection.commit();

        return newTitle;
    } catch (error) {
        await cleanupAfterError(dbConnection);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

async function createMap(userId, gameMapID, title, file) {
    let dbConnection;
    let processedImagePaths;
    try {
        if (!file) {
            throw new AppError(ERRORS.COMMON.MISSING_IMAGE, 400);
        }

        await assertUserOwnsGameMap(userId, gameMapID);

        let imageData;
        try {
            imageData = await processImageMetadata(file.path);
        } catch (err) {
            throw new AppError(ERRORS.COMMON.IMAGE_PROCESSING_ERROR, 422);
        }

        dbConnection = await getConnection();
        await dbConnection.beginTransaction();

        const imageId = await imageQueries.insertImage(dbConnection, imageData.width, imageData.height, "pending");

        const newMapId = await database.insertMap(dbConnection, title, gameMapID, imageId);

        // backend/uploads/mapdatas/:userId/:gameMapId/:mapId/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            newMapId.toString()
        );
        let targetPath = path.join(
            UPLOAD_ROOT_MAP_DATA,
            relativeDestDir
        );
        let baseName = newMapId.toString() + "_" + crypto.randomBytes(4).toString("hex");
        processedImagePaths = await createWebpAndLowRes({
            inputFilePath: file.path,
            outputDirPath: targetPath,
            baseName: baseName
        });

        let dbPath = path.join(relativeDestDir, processedImagePaths.targetFileName);
        const updateSuccess = await imageQueries.updateImagePath(dbConnection, imageId, dbPath);
        if (!updateSuccess) {
            throw new AppError(ERRORS.MAP.SAVE_FAILED, 500);
        }

        await dbConnection.commit();

        if (file && file.path) {
            try {
                await deleteFile(file.path);
            } catch (error) {
                console.error(`Failed to delete temporary file ${file.path}: `, error);
            }
        }

        return newMapId;
    } catch (error) {
        await cleanupAfterError(dbConnection, file, processedImagePaths);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

async function deleteMap(userId, mapID) {
    let dbConnection;
    try {
        await assertUserOwnsMap(userId, mapID);

        let mapInfo = await database.getMapInfo(mapID);
        if (!mapInfo) {
            throw new AppError(ERRORS.MAP.NOT_FOUND, 404);
        }

        dbConnection = await getConnection();
        await dbConnection.beginTransaction();

        let imageIdsToDelete = await database.getAllImageIdsForMap(dbConnection, mapID);

        let successMapDeletion = await database.deleteMapById(dbConnection, mapID);
        if (!successMapDeletion) {
            throw new AppError(ERRORS.MAP.DELETE_FAILED, 500);
        }

        for (const imageId of imageIdsToDelete) {
            let successImageDeletion = await imageQueries.deleteImageById(dbConnection, imageId);
            if (!successImageDeletion) {
                throw new AppError(ERRORS.MAP.IMAGE_DELETIONS_FAILED, 500);
            }
        }

        await dbConnection.commit();

        let gameMapID = mapInfo.game_maps_id;
        // :userId/:gameMapId/:mapId/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            mapID.toString()
        );

        // backend/uploads/mapdatas/:userId/:gameMapId/:mapId/
        let targetPath = path.join(
            UPLOAD_ROOT_MAP_DATA,
            relativeDestDir
        );

        try {
            if (isInsideRoot(targetPath)) {
                await fs.rm(targetPath, { recursive: true, force: true });
            }
        } catch (err) {
            console.error(`Error deleting directory ${targetPath}: ${err.message}`);
        }
    } catch (error) {
        await cleanupAfterError(dbConnection);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

module.exports = {
    fetchMaps,
    updateMap,
    createMap,
    deleteMap
};
