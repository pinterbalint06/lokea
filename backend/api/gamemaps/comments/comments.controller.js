const commentsService = require("#gamemaps/comments/comments.service.js");

async function getGameMapComments(request, response, next) {
    try {
        const { gameMapID } = request.params;
        const { page } = request.query;

        const commentsData = await commentsService.getGameMapComments(gameMapID, page);

        response.status(200).json(commentsData);
    } catch (error) {
        next(error);
    }
}

async function postGameMapComments(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;
        const { comment, rating } = request.body;

        await commentsService.postGameMapComment(userId, gameMapID, comment, rating);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function getUserComment(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;

        const comment = await commentsService.getUserComment(userId, gameMapID);

        response.status(200).json(comment);
    } catch (error) {
        next(error);
    }
}

async function updateUserComment(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;
        const { comment, rating } = request.body;

        await commentsService.updateUserComment(userId, gameMapID, comment, rating);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function deleteUserComment(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;

        await commentsService.deleteUserComment(userId, gameMapID);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getGameMapComments,
    postGameMapComments,
    getUserComment,
    updateUserComment,
    deleteUserComment
};
