const gamemapsService = require("#gamemaps/gamemaps.service.js");
const { UPLOAD_ROOT } = require("#config/mapStorage.js");
const ERRORS = require("#utils/errorMessages.js");

async function getPointImage(request, response, next) {
    try {
        const { pointID } = request.params;
        const { resolution } = request.query;

        const { imagePath, width, height, northDirection } = await gamemapsService.getPointImageDetails(pointID, resolution);

        response.set("Access-Control-Expose-Headers", "imageWidth, imageHeight, northDirection");
        response.set("imageWidth", width);
        response.set("imageHeight", height);
        response.set("northDirection", northDirection);

        response.sendFile(imagePath, { root: UPLOAD_ROOT }, function (err) {
            if (err && !response.headersSent) {
                return response.status(404).json({ error: ERRORS.COMMON.FILE_NOT_FOUND });
            }
        });
    } catch (error) {
        next(error);
    }
}

async function getMapImage(request, response, next) {
    try {
        const { mapID } = request.params;
        const { resolution } = request.query;

        const { imagePath, width, height } = await gamemapsService.getMapImageDetails(mapID, resolution);

        response.set("Access-Control-Expose-Headers", "imageWidth, imageHeight");
        response.set("imageWidth", width);
        response.set("imageHeight", height);

        response.sendFile(imagePath, { root: UPLOAD_ROOT }, function (err) {
            if (err && !response.headersSent) {
                return response.status(404).json({ error: ERRORS.COMMON.FILE_NOT_FOUND });
            }
        });
    } catch (error) {
        next(error);
    }
}

async function getPointConnections(request, response, next) {
    try {
        const { pointID } = request.params;

        const connections = await gamemapsService.getPointConnections(pointID);

        response.status(200).json({ connections });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPointImage,
    getMapImage,
    getPointConnections
};
