const mapsService = require("./maps.service.js");

async function getMaps(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;

        const maps = await mapsService.fetchMaps(userId, gameMapID);

        response.status(200).json({
            success: true,
            maps
        });
    } catch (error) {
        next(error);
    }
};

async function updateMap(request, response, next) {
    try {
        const userId = request.session.userid;
        const { mapID } = request.params;
        const { title } = request.body;

        const newTitle = await mapsService.updateMap(userId, mapID, title);

        response.status(200).json({
            success: true,
            title: newTitle
        });
    } catch (error) {
        next(error);
    }
};

async function createMap(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;
        const { title } = request.body;
        const file = request.file;

        const newMapId = await mapsService.createMap(userId, gameMapID, title, file);

        response.status(201).json({
            success: true,
            mapId: newMapId,
            message: "Térkép sikeresen mentve!"
        });
        // TODOp: itt a message fölösleges frontend döntse el mit ír ki
    } catch (error) {
        next(error);
    }
};

async function deleteMap(request, response, next) {
    try {
        const userId = request.session.userid;
        const { mapID } = request.params;

        await mapsService.deleteMap(userId, mapID);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMaps,
    updateMap,
    createMap,
    deleteMap
};