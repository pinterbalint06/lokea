const mapsService = require("./maps.service.js");
const AppError = require("#utils/app-error.js");

async function getAllMaps(request, response) {
    try {
        const { maps, mapInfo } = await mapsService.getAllMaps(request.session.game.gameMapId);
        request.session.game.mapInfo = mapInfo;
        response.status(200).json({ maps });
    } catch (error) {
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ message: error.message });
        } else {
            response.status(500).json({ message: "Error fetching maps" });
        }
    }
}

module.exports = { getAllMaps };
