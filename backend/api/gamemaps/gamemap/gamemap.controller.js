const gamemapsService = require("#gamemaps/gamemap/gamemap.service.js");
const ERRORS = require("#utils/error-messages.js");

async function createGameMap(request, response, next) {
    try {
        const userId = request.session.userid;

        const gameMapID = await gamemapsService.createGameMap(userId);

        response.status(201).json({ gameMapID });
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

async function deleteGameMap(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;

        await gamemapsService.deleteGameMap(userId, gameMapID);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createGameMap,
    getGameMapDetails,
    updateGameMap,
    deleteGameMap
};
