const imagesService = require("#gamemaps/images/images.service.js");
const { UPLOAD_ROOT_MAP_DATA } = require("#config/mapdatas-upload-config.js");
const ERRORS = require("#utils/error-messages.js");

async function getPointImage(request, response, next) {
    try {
        const { pointID } = request.params;
        const { resolution } = request.query;

        const { imagePath, width, height, northDirection } = await imagesService.getPointImageDetails(pointID, resolution);

        response.set("Access-Control-Expose-Headers", "imageWidth, imageHeight, northDirection");
        response.set("imageWidth", width);
        response.set("imageHeight", height);
        response.set("northDirection", northDirection);

        response.sendFile(imagePath, { root: UPLOAD_ROOT_MAP_DATA }, function (err) {
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

        const { imagePath, width, height } = await imagesService.getMapImageDetails(mapID, resolution);

        response.set("Access-Control-Expose-Headers", "imageWidth, imageHeight");
        response.set("imageWidth", width);
        response.set("imageHeight", height);

        response.sendFile(imagePath, { root: UPLOAD_ROOT_MAP_DATA }, function (err) {
            if (err && !response.headersSent) {
                return response.status(404).json({ error: ERRORS.COMMON.FILE_NOT_FOUND });
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPointImage,
    getMapImage
};
