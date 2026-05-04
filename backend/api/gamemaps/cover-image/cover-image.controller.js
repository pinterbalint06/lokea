const coverImageService = require("#gamemaps/cover-image/cover-image.service.js");
const { UPLOAD_ROOT_MAP_DATA } = require("#config/mapdatas-upload-config.js");
const ERRORS = require("#utils/error-messages.js");

async function getGameMapCoverImage(request, response, next) {
    try {
        const { gameMapID } = request.params;
        const { resolution } = request.query;

        const { imagePath, width, height } = await coverImageService.getGameMapCoverImagePath(gameMapID, resolution);

        response.set("Access-Control-Expose-Headers", "imageWidth, imageHeight");
        response.set("imageWidth", width);
        response.set("imageHeight", height);
        response.sendFile(imagePath, { root: UPLOAD_ROOT_MAP_DATA }, function (err) {
            if (err && !response.headersSent) {
                response.status(404).json({ error: request.t(ERRORS.COMMON.FILE_NOT_FOUND) });
            }
        });
    } catch (error) {
        next(error);
    }
}

async function updateGameMapCoverImage(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;
        const file = request.file;

        await coverImageService.updateGameMapCoverImage(userId, gameMapID, file);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function deleteGameMapCoverImage(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;

        await coverImageService.deleteGameMapCoverImage(userId, gameMapID);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getGameMapCoverImage,
    updateGameMapCoverImage,
    deleteGameMapCoverImage
};
