const { UPLOAD_ROOT_MAP_DATA } = require("#config/mapStorage.js");
const database = require("#sql/database.js");
const ERRORS = require("#utils/errorMessages.js");
const { processImageMetadata } = require("#utils/imageProcessor.js");
const path = require("path");

function resolveImagePath(filePath, resolution) {
    let finalFilePath = filePath;
    if (resolution == "low") {
        const imagePath = path.parse(filePath);
        finalFilePath = path.join(imagePath.dir, imagePath.name + "_low_res" + imagePath.ext);
    }
    return finalFilePath;
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

async function getGameMapDetails(gameMapID) {
    let retunData = null;
    const gameMapDetails = await database.getGameMapDetails(gameMapID);

    if (gameMapDetails) {
        const topScores = await database.getTopScoresForGameMap(gameMapID);
        retunData = { ...gameMapDetails, top_scores: topScores };
    }

    return retunData;
}

async function getGameMapCoverImagePath(gameMapID, resolution) {
    const imageData = await database.getGameMapCoverImage(gameMapID);
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

async function updateGameMapCoverImage(gameMapID, file) {
    if (!file) {
        throw new AppError(ERRORS.COMMON.MISSING_IMAGE, 400);
    }

    let imageData;
    try {
        imageData = await processImageMetadata(file.path);
    } catch (err) {
        throw new AppError(ERRORS.COMMON.IMAGE_PROCESSING_ERROR, 422);
    }

    dbConnection = await database.getConnection();
    await dbConnection.beginTransaction();

    let imageId = await database.insertImage(dbConnection, imageData.width, imageData.height, "pending");

    // backend/uploads/mapdatas/:userId/:gameMapId/image.jpg example
    let relativeDestDir = path.join(
        userId.toString(),
        gameMapID.toString()
    );
    let targetPath = path.join(
        UPLOAD_ROOT_MAP_DATA,
        relativeDestDir
    );
    let baseName = gameMapID.toString() + "_" + crypto.randomBytes(4).toString("hex");

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
}

module.exports = {
    getPointImageDetails,
    getMapImageDetails,
    getPointConnections,
    getGameMapDetails,
    getGameMapCoverImagePath
};
