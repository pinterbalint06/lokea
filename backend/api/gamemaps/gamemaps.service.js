const path = require("path");
const crypto = require("crypto");
const AppError = require("#utils/AppError.js");
const fs = require("fs/promises");
const database = require("#sql/database.js");
const ERRORS = require("#utils/errorMessages.js");
const { UPLOAD_ROOT_MAP_DATA, isInsideRoot } = require("#config/mapStorage.js");
const { processImageMetadata, createWebpAndLowRes, deleteImageAndLowResByMainPath } = require("#utils/imageProcessor.js");
const { deleteFile } = require("#utils/fileUtils.js");
const { assertUserOwnsGameMap } = require("#mapcreator/shared/utils/mapcreator.utils.js");
const { cleanupAfterError } = require("#mapcreator/shared/utils/mapcreator.utils.js"); // TODO: ennek kiszervezese
const { LOW_RES_SUFFIX } = require("#config/imageConfig.js");

function resolveImagePath(filePath, resolution) {
    let finalFilePath = filePath;
    if (resolution == "low") {
        const imagePath = path.parse(filePath);
        finalFilePath = path.join(imagePath.dir, imagePath.name + LOW_RES_SUFFIX + imagePath.ext);
    }
    return finalFilePath;
}

function getDefaultCoverImage() {
    return {
        filepath: path.join("assets", "not_found.webp"),
        width: 750,
        height: 545
    };
}

async function assertHasCommentedOnGameMap(gameMapID, userId) {
    const hasCommented = await database.hasUserCommentedOnGameMap(gameMapID, userId);
    if (!hasCommented) {
        throw new AppError(ERRORS.COMMENT.NOT_FOUND, 404);
    }
}


async function getPointImageDetails(pointID, resolution) {
    const imageData = await database.getPointImage(pointID);
    if (!imageData) {
        throw new AppError(ERRORS.COMMON.FILE_NOT_FOUND, 404);
    }

    const imagePath = resolveImagePath(imageData.filepath, resolution);

    return {
        imagePath,
        width: imageData.width,
        height: imageData.height,
        northDirection: imageData.north_direction
    };
}

async function getMapImageDetails(mapID, resolution) {
    const imageData = await database.getMapImage(mapID);
    if (!imageData) {
        throw new AppError(ERRORS.COMMON.FILE_NOT_FOUND, 404);
    }

    const imagePath = resolveImagePath(imageData.filepath, resolution);

    return {
        imagePath,
        width: imageData.width,
        height: imageData.height
    };
}

async function getPointConnections(pointID) {
    return await database.getConnectionsByPointId(pointID);
}

async function getGameMapDetails(gameMapID, userId) {
    const gameMapDetails = await database.getGameMapDetails(gameMapID);

    if (!gameMapDetails) {
        throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
    }

    const topScores = await database.getTopScoresForGameMap(gameMapID);
    const isOwner = userId != null && gameMapDetails.creator_id == userId;

    return {
        ...gameMapDetails,
        is_owner: isOwner,
        top_scores: topScores
    };
}

async function deleteGameMap(userId, gameMapID) {
    let dbConnection;

    try {
        const gameMapDetails = await database.getGameMapDetails(gameMapID);
        if (!gameMapDetails) {
            throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
        }

        await assertUserOwnsGameMap(userId, gameMapID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let imageIdsToDelete = await database.getAllImageIdsForGameMap(dbConnection, gameMapID);

        let successMapDeletion = await database.deleteGameMapById(dbConnection, gameMapID);
        if (!successMapDeletion) {
            throw new AppError(ERRORS.GAMEMAP.DELETE_FAILED, 500);
        }

        for (const imageId of imageIdsToDelete) {
            let successImageDeletion = await database.deleteImageById(dbConnection, imageId);
            if (!successImageDeletion) {
                throw new AppError(ERRORS.MAP.IMAGE_DELETIONS_FAILED, 500);
            }
        }

        await dbConnection.commit();

        // :userId/:gameMapId/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
        );

        // backend/uploads/mapdatas/:userId/:gameMapId/
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

        const gameMapDetails = await database.getGameMapDetails(gameMapID);
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

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        const imageId = await database.insertImage(dbConnection, imageData.width, imageData.height, "pending");

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

        const pathUpdateSuccess = await database.updateImagePath(dbConnection, imageId, dbPath);
        if (!pathUpdateSuccess) {
            throw new AppError(ERRORS.GAMEMAP.COVER_IMAGE_UPDATE_FAILED, 500);
        }

        const coverUpdateSuccess = await database.updateGameMapCoverImage(dbConnection, gameMapID, imageId);
        if (!coverUpdateSuccess) {
            throw new AppError(ERRORS.GAMEMAP.COVER_IMAGE_UPDATE_FAILED, 500);
        }

        if (oldCoverImage) {
            const oldDeleteSuccess = await database.deleteImageById(dbConnection, oldCoverImage.image_id);
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

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        const coverDeleteSuccess = await database.deleteImageById(dbConnection, coverImage.image_id);
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

async function updateGameMapDetails(userId, gameMapID, title, description) {
    let dbConnection;
    try {
        await assertUserOwnsGameMap(userId, gameMapID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        const titleDb = title ?? null;
        const descriptionDb = description ?? null;

        const updateSuccess = await database.updateGameMapDetails(dbConnection, gameMapID, titleDb, descriptionDb);
        if (!updateSuccess) {
            throw new AppError(ERRORS.GAMEMAP.UPDATE_FAILED, 404);
        }

        await dbConnection.commit();
    } catch (error) {
        await cleanupAfterError(dbConnection);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

async function getGameMapComments(gameMapID, page) {
    const comments = await database.getGameMapComments(gameMapID, page);
    const totalCount = await database.getGameMapCommentCount(gameMapID);
    const totalPages = Math.ceil(totalCount / 50);

    return {
        comments,
        pagination: {
            totalCount,
            totalPages
        }
    };
}

async function postGameMapComment(userId, gameMapID, comment, rating) {
    let dbConnection;
    try {
        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        const gameMapDetails = await database.getGameMapDetails(gameMapID);
        if (!gameMapDetails) {
            throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
        }

        const hasExistingComment = await database.hasUserCommentedOnGameMap(gameMapID, userId);
        if (hasExistingComment) {
            throw new AppError(ERRORS.COMMENT.ALREADY_COMMENTED, 409);
        }

        const commentDb = comment ?? null;

        await database.insertGameMapComment(dbConnection, gameMapID, userId, commentDb, rating);

        await dbConnection.commit();
    } catch (error) {
        await cleanupAfterError(dbConnection);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

async function getUserComment(userId, gameMapID) {
    await assertHasCommentedOnGameMap(gameMapID, userId);
    return await database.getUserCommentOnGameMap(gameMapID, userId);
}

async function updateUserComment(userId, gameMapID, commentText, rating) {
    let dbConnection;
    try {
        await assertHasCommentedOnGameMap(gameMapID, userId);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        const commentDb = commentText ?? null;
        const success = await database.updateUserCommentOnGameMap(dbConnection, gameMapID, userId, commentDb, rating);

        if (!success) {
            throw new AppError(ERRORS.COMMENT.UPDATE_FAILED, 500);
        }

        await dbConnection.commit();
    } catch (error) {
        await cleanupAfterError(dbConnection);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

async function deleteUserComment(userId, gameMapID) {
    let dbConnection;
    try {
        await assertHasCommentedOnGameMap(gameMapID, userId);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        const success = await database.deleteUserCommentOnGameMap(dbConnection, gameMapID, userId);

        if (!success) {
            throw new AppError(ERRORS.COMMENT.DELETE_FAILED, 500);
        }

        await dbConnection.commit();
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
    getPointImageDetails,
    getMapImageDetails,
    getPointConnections,
    getGameMapDetails,
    getGameMapCoverImagePath,
    updateGameMapCoverImage,
    deleteGameMapCoverImage,
    updateGameMapDetails,
    getGameMapComments,
    postGameMapComment,
    getUserComment,
    updateUserComment,
    deleteUserComment,
    deleteGameMap
};
