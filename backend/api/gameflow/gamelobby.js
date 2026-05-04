const express = require("express");
const router = express.Router();
const { getGameMaps } = require("#gameflow/gamelobby.queries.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");
const { validateGameLobbyQuery } = require("./gamelobby.middleware.js");
const sessionsRoutes = require("./sessions/sessions.routes.js");

router.get("/", validateGameLobbyQuery, async (request, response, next) => {
    try {
        const { sort, offset, filter } = request.lobbyQuery;
        const userId = request.session?.userid;
        const palyak = await getGameMaps(sort, userId, offset, filter);
        response.status(200).json({ results: palyak });
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(ERRORS.GAMEFLOW.FETCH_GAME_MAPS_FAILED, 500));
        }
    }
});

router.use("/", sessionsRoutes);

module.exports = router;
