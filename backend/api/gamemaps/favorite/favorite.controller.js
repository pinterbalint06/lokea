const favoriteService = require("#gamemaps/favorite/favorite.service.js");

async function getFavoriteStatus(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;

        const status = await favoriteService.getFavoriteStatus(userId, gameMapID);

        response.status(200).json(status);
    } catch (error) {
        next(error);
    }
}

async function addFavorite(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;

        await favoriteService.addFavorite(userId, gameMapID);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function removeFavorite(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;

        await favoriteService.removeFavorite(userId, gameMapID);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getFavoriteStatus,
    addFavorite,
    removeFavorite
};
