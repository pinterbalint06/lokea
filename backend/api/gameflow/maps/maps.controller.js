const mapsService = require("./maps.service.js");

async function getAllMaps(request, response) {
    try {
        const { maps, mapInfo } = await mapsService.getAllMaps(request.session.game.gameMapId);
        request.session.game.mapInfo = mapInfo;
        response.status(200).json({ success: true, maps });
    } catch (error) {
        if (error.statusCode) {
            response.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error fetching maps" });
        }
    }
}

module.exports = { getAllMaps };
