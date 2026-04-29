const AppError = require("#utils/app-error.js");
const database = require("#sql/database.js");
const ERRORS = require("#utils/error-messages.js");
const { resolveImagePath } = require("#gamemaps/shared/utils/image-utils.js");

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

module.exports = {
    getPointImageDetails,
    getMapImageDetails
};
