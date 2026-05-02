const mapsService = require("./maps.service.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");

async function getAllMaps(request, response) {
    try {
        const maps = await mapsService.getAllMaps(request.session.game.gameMapId);
        response.status(200).json({ maps });
    } catch (error) {
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ message: error.message });
        } else {
            response.status(500).json({ message: ERRORS.GAMEFLOW.FETCH_MAPS_FAILED });
        }
    }
}

module.exports = { getAllMaps };
