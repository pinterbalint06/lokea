const mapsService = require("./maps.service.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");

async function getAllMaps(request, response, next) {
    try {
        const maps = await mapsService.getAllMaps(request.session.game.gameMapId);
        response.status(200).json({ maps });
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(ERRORS.GAMEFLOW.FETCH_MAPS_FAILED, 500));
        }
    }
}

module.exports = { getAllMaps };
