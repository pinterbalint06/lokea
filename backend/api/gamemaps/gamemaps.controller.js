const gamemapsService = require("#gamemaps/gamemaps.service.js");
const { UPLOAD_ROOT_MAP_DATA } = require("#config/mapStorage.js");
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

        const { imagePath, width, height } = await gamemapsService.getMapImageDetails(mapID, resolution);

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

async function getPointConnections(request, response, next) {
    try {
        const { pointID } = request.params;

        const connections = await gamemapsService.getPointConnections(pointID);

        response.status(200).json({ connections });
    } catch (error) {
        next(error);
    }
}

async function getGameMapDetails(request, response, next) {
    try {
        const { gameMapID } = request.params;
        const userId = request.session.userid;

        const game_map_details = await gamemapsService.getGameMapDetails(gameMapID, userId);

        response.status(200).json({ game_map_details });
    } catch (error) {
        next(error);
    }
}

async function getGameMapCoverImage(request, response, next) {
    try {
        const { gameMapID } = request.params;
        const { resolution } = request.query;

        const { imagePath, width, height } = await gamemapsService.getGameMapCoverImagePath(gameMapID, resolution);

        response.set("Access-Control-Expose-Headers", "imageWidth, imageHeight");
        response.set("imageWidth", width);
        response.set("imageHeight", height);
        response.sendFile(imagePath, { root: UPLOAD_ROOT_MAP_DATA }, function (err) {
            if (err && !response.headersSent) {
                response.status(404).json({ error: ERRORS.COMMON.FILE_NOT_FOUND });
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

        await gamemapsService.updateGameMapCoverImage(userId, gameMapID, file);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
};

async function deleteGameMapCoverImage(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;

        await gamemapsService.deleteGameMapCoverImage(userId, gameMapID);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function updateGameMap(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;
        const { title, description } = request.body;

        await gamemapsService.updateGameMapDetails(userId, gameMapID, title, description);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function getGameMapComments(request, response, next) {
    try {
        const { gameMapID } = request.params;
        const { page } = request.query;

        const commentsData = await gamemapsService.getGameMapComments(gameMapID, page);

        response.status(200).json(commentsData);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPointImage,
    getMapImage,
    getPointConnections,
    getGameMapDetails,
    getGameMapCoverImage,
    updateGameMapCoverImage,
    deleteGameMapCoverImage,
    updateGameMap,
    getGameMapComments
};
