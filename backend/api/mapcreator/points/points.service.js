const database = require("#sql/database.js");
const AppError = require("#utils/app-error.js");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { UPLOAD_ROOT_MAP_DATA, isInsideRoot } = require("#config/mapdatas-upload-config.js");
const { processImageMetadata, createWebpAndLowRes, deleteImageAndLowResByMainPath } = require("#utils/image-processor.js");
const { deleteFile } = require("#utils/file-utils.js");
const { assertUserOwnsMap, assertUserOwnsPoint, cleanupAfterError } = require("#mapcreator/shared/utils/mapcreator.utils.js");
const ERRORS = require("#utils/error-messages.js");

async function fetchPoints(userId, mapID) {
    await assertUserOwnsMap(userId, mapID);
    return await database.getPointsOnMap(mapID);
};

async function updatePoint(userId, pointID, pointData, file) {
    let dbConnection;
    let processedImagePaths = null;

    try {
        const { u: uCoordinate, v: vCoordinate, northDirection } = pointData;

        await assertUserOwnsPoint(userId, pointID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let pointInfo = await database.getPointInfo(pointID);
        if (!pointInfo) {
            throw new AppError(ERRORS.POINT.NOT_FOUND, 404);
        }

        if (pointInfo.point_u != uCoordinate || pointInfo.point_v != vCoordinate) {
            let existingPoints = await database.getPointOnMapByCoordinates(dbConnection, pointInfo.map_id, uCoordinate, vCoordinate);
            if (existingPoints.length > 0) {
                throw new AppError(ERRORS.POINT.ALREADY_EXISTS, 409);
            }

            let updateSuccess = await database.updatePointCoordinates(dbConnection, pointID, uCoordinate, vCoordinate);
            if (!updateSuccess) {
                throw new AppError(ERRORS.POINT.COORDINATES_UPDATE_FAILED, 500);
            }
        }

        if (pointInfo.north_direction != northDirection) {
            let updateSuccess = await database.updatePointNorthDirection(dbConnection, pointID, northDirection);
            if (!updateSuccess) {
                throw new AppError(ERRORS.POINT.NORTH_DIRECTION_UPDATE_FAILED, 500);
            }
        }

        if (file) {
            let oldImageInfo = await database.getPointImage(pointID);

            let imageData;
            try {
                imageData = await processImageMetadata(file.path);
            } catch (err) {
                throw new AppError(ERRORS.COMMON.IMAGE_PROCESSING_ERROR, 422);
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
                UPLOAD_ROOT_MAP_DATA,
                relativeDestDir
            );
            let baseName = pointID.toString() + "_" + crypto.randomBytes(4).toString("hex");
            processedImagePaths = await createWebpAndLowRes({
                inputFilePath: file.path,
                outputDirPath: targetPath,
                baseName: baseName
            });

            let dbPath = path.join(relativeDestDir, processedImagePaths.targetFileName);

            await database.updateImagePath(dbConnection, newImageId, dbPath);

            let updateImageSuccess = await database.updatePointImage(dbConnection, pointID, newImageId);
            if (!updateImageSuccess) {
                throw new AppError(ERRORS.POINT.IMAGE_PATH_UPDATE_FAILED, 500);
            }

            if (oldImageInfo) {
                let deleteSuccess = await database.deleteImageById(dbConnection, oldImageInfo.image_id);
                if (!deleteSuccess) {
                    throw new AppError(ERRORS.POINT.OLD_IMAGE_DELETION_FAILED, 500);
                }
            }

            await dbConnection.commit();

            if (oldImageInfo && oldImageInfo.filepath) {
                let absoluteOldPath = path.join(UPLOAD_ROOT_MAP_DATA, oldImageInfo.filepath);
                deleteImageAndLowResByMainPath(absoluteOldPath)
                    .catch(function () {
                        console.error("unsuccessful deletion: " + absoluteOldPath);
                    });
            }

            if (file.path) {
                try {
                    await deleteFile(file.path);
                } catch (error) {
                    console.error(`Failed to delete temporary file ${file.path}: `, error);
                }
            }
        } else {
            await dbConnection.commit();
        }

    } catch (error) {
        await cleanupAfterError(dbConnection, file, processedImagePaths);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
};

async function createPoint(userId, mapID, pointData, file) {
    let dbConnection;
    let processedImagePaths = null;
    try {
        const { u: uCoordinate, v: vCoordinate, northDirection } = pointData;

        if (!file) {
            throw new AppError(ERRORS.COMMON.MISSING_IMAGE, 400);
        }

        await assertUserOwnsMap(userId, mapID);

        const gameMapID = await database.getGameMapIdByMapId(mapID);
        if (!gameMapID) {
            throw new AppError(ERRORS.COMMON.UNEXPECTED_ERROR, 500);
        }

        let imageData;
        try {
            imageData = await processImageMetadata(file.path);
        } catch (err) {
            throw new AppError(ERRORS.COMMON.IMAGE_PROCESSING_ERROR, 422);
        }

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let existingPoints = await database.getPointOnMapByCoordinates(dbConnection, mapID, uCoordinate, vCoordinate);
        if (existingPoints.length > 0) {
            throw new AppError(ERRORS.POINT.ALREADY_EXISTS, 409);
        }

        let imageId = await database.insertImage(dbConnection, imageData.width, imageData.height, "pending");

        let newPointId = await database.insertPoint(dbConnection, mapID, uCoordinate, vCoordinate, northDirection, imageId);

        // backend/uploads/mapdatas/:userId/:gameMapId/:mapId/point_images/:pointID/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            mapID.toString(),
            "point_images",
            newPointId.toString()
        );
        let targetPath = path.join(
            UPLOAD_ROOT_MAP_DATA,
            relativeDestDir
        );
        let baseName = newPointId.toString() + "_" + crypto.randomBytes(4).toString("hex");

        processedImagePaths = await createWebpAndLowRes({
            inputFilePath: file.path,
            outputDirPath: targetPath,
            baseName: baseName
        });

        let dbPath = path.join(relativeDestDir, processedImagePaths.targetFileName);

        await database.updateImagePath(dbConnection, imageId, dbPath);

        await dbConnection.commit();

        if (file && file.path) {
            try {
                await deleteFile(file.path);
            } catch (error) {
                console.error(`Failed to delete temporary file ${file.path}: `, error);
            }
        }

        return newPointId;
    } catch (error) {
        await cleanupAfterError(dbConnection, file, processedImagePaths);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
};

async function deletePoint(userId, pointID) {
    let dbConnection;
    try {
        await assertUserOwnsPoint(userId, pointID);

        let pointInfo = await database.getPointInfo(pointID);
        if (!pointInfo) {
            throw new AppError(ERRORS.POINT.NOT_FOUND, 404);
        }

        let oldImageInfo = await database.getPointImage(pointID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        if (oldImageInfo && oldImageInfo.image_id) {
            let successImageDeletion = await database.deleteImageById(dbConnection, oldImageInfo.image_id);
            if (!successImageDeletion) {
                throw new AppError(ERRORS.POINT.IMAGE_DELETETION_FAILED, 500);
            }
        }

        let successPointDeletion = await database.deletePointById(dbConnection, pointID);
        if (!successPointDeletion) {
            throw new AppError(ERRORS.POINT.DELETE_FAILED, 500);
        }

        await dbConnection.commit();

        let gameMapID = pointInfo.game_maps_id;
        let mapID = pointInfo.map_id;
        // :userId/:gameMapId/:mapId/point_images/:pointID/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            mapID.toString(),
            "point_images",
            pointID.toString()
        );

        // backend/uploads/mapdatas/:userId/:gameMapId/:mapId/point_images/:pointID/
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
};

module.exports = {
    fetchPoints,
    updatePoint,
    createPoint,
    deletePoint
};