const path = require("path");
const crypto = require("crypto");
const AppError = require("#utils/app-error.js");
const database = require("#gamemaps/cover-image/cover-image.queries.js");
const { getConnection, insertImage, getGameMapDetails, updateImagePath, deleteImageById } = require("#sql/database.js");
const ERRORS = require("#utils/error-messages.js");
const { UPLOAD_ROOT_MAP_DATA, isInsideRoot } = require("#config/mapdatas-upload-config.js");
const { processImageMetadata, createWebpAndLowRes, deleteImageAndLowResByMainPath } = require("#utils/image-processor.js");
const { deleteFile } = require("#utils/file-utils.js");
const { assertUserOwnsGameMap, cleanupAfterError } = require("#mapcreator/shared/utils/mapcreator.utils.js");
const { resolveImagePath } = require("#gamemaps/shared/utils/image-utils.js");

function getDefaultCoverImage() {
    return {
        filepath: path.join("assets", "not_found.webp"),
        width: 750,
        height: 545
    };
}

async function getGameMapCoverImagePath(gameMapID, resolution) {
    let imageData = await database.getGameMapCoverImage(gameMapID);
    if (!imageData) {
        imageData = getDefaultCoverImage();
    }

    const imagePath = resolveImagePath(imageData.filepath, resolution);

    return {
        imagePath,
        width: imageData.width,
        height: imageData.height
    };
}

async function updateGameMapCoverImage(userId, gameMapID, file) {
    let dbConnection;
    let processedImagePaths;
    let oldCoverImage = null;
    try {
        if (!file) {
            throw new AppError(ERRORS.COMMON.MISSING_IMAGE, 400);
        }

        const gameMapDetails = await getGameMapDetails(gameMapID);
        if (!gameMapDetails) {
            throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
        }

        await assertUserOwnsGameMap(userId, gameMapID);

        let imageData;
        try {
            imageData = await processImageMetadata(file.path);
        } catch (error) {
            throw new AppError(ERRORS.COMMON.IMAGE_PROCESSING_ERROR, 422);
        }

        oldCoverImage = await database.getGameMapCoverImage(gameMapID);

        dbConnection = await getConnection();
        await dbConnection.beginTransaction();

        const imageId = await insertImage(dbConnection, imageData.width, imageData.height, "pending");

        // backend/uploads/mapdatas/:userId/:gameMapId/image.jpg example
        const relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString()
        );
        const targetPath = path.join(
            UPLOAD_ROOT_MAP_DATA,
            relativeDestDir
        );
        const baseName = gameMapID.toString() + "_" + crypto.randomBytes(4).toString("hex");

        processedImagePaths = await createWebpAndLowRes({
            inputFilePath: file.path,
            outputDirPath: targetPath,
            baseName
        });

        const dbPath = path.join(relativeDestDir, processedImagePaths.targetFileName);

        const pathUpdateSuccess = await updateImagePath(dbConnection, imageId, dbPath);
        if (!pathUpdateSuccess) {
            throw new AppError(ERRORS.GAMEMAP.COVER_IMAGE_UPDATE_FAILED, 500);
        }

        const coverUpdateSuccess = await database.updateGameMapCoverImage(dbConnection, gameMapID, imageId);
        if (!coverUpdateSuccess) {
            throw new AppError(ERRORS.GAMEMAP.COVER_IMAGE_UPDATE_FAILED, 500);
        }

        if (oldCoverImage) {
            const oldDeleteSuccess = await deleteImageById(dbConnection, oldCoverImage.image_id);
            if (!oldDeleteSuccess) {
                throw new AppError(ERRORS.GAMEMAP.COVER_IMAGE_UPDATE_FAILED, 500);
            }
        }

        await dbConnection.commit();

        if (oldCoverImage && oldCoverImage.filepath) {
            let absoluteOldPath = path.join(UPLOAD_ROOT_MAP_DATA, oldCoverImage.filepath);
            if (isInsideRoot(absoluteOldPath)) {
                try {
                    await deleteImageAndLowResByMainPath(absoluteOldPath)
                } catch (error) {
                    console.error("unsuccessful deletion: " + absoluteOldPath, "Error: " + error.message);
                }
            }
        }

        if (file && file.path) {
            try {
                await deleteFile(file.path);
            } catch (error) {
                console.error(`Failed to delete temporary file ${file.path}: `, error);
            }
        }
    } catch (error) {
        await cleanupAfterError(dbConnection, file, processedImagePaths);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

async function deleteGameMapCoverImage(userId, gameMapID) {
    let dbConnection;
    try {
        await assertUserOwnsGameMap(userId, gameMapID);

        const coverImage = await database.getGameMapCoverImage(gameMapID);
        if (!coverImage) {
            throw new AppError(ERRORS.GAMEMAP.COVER_IMAGE_NOT_FOUND, 404);
        }

        dbConnection = await getConnection();
        await dbConnection.beginTransaction();

        const coverDeleteSuccess = await deleteImageById(dbConnection, coverImage.image_id);
        if (!coverDeleteSuccess) {
            throw new AppError(ERRORS.GAMEMAP.COVER_IMAGE_DELETE_FAILED, 500);
        }

        await dbConnection.commit();

        if (coverImage.filepath && coverImage.filepath != "pending") {
            let absolutePath = path.join(UPLOAD_ROOT_MAP_DATA, coverImage.filepath);
            if (isInsideRoot(absolutePath)) {
                try {
                    await deleteImageAndLowResByMainPath(absolutePath)
                } catch (error) {
                    console.error("unsuccessful deletion: " + absolutePath, "Error: " + error.message);
                }
            }
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
    getGameMapCoverImagePath,
    updateGameMapCoverImage,
    deleteGameMapCoverImage
};
