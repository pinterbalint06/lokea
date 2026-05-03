const express = require("express");
const router = express.Router();
const { getGameMaps } = require("#gameflow/gamelobby.queries.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");
const { validateGameLobbyQuery } = require("./gamelobby.middleware.js");
const sessionsRoutes = require("./sessions/sessions.routes.js");

router.get("/", validateGameLobbyQuery, async (request, response) => {
    try {
        const { sort, offset, filter } = request.lobbyQuery;
        const userId = request.session?.userid;
        const palyak = await getGameMaps(sort, userId, offset, filter);
        response.status(200).json({ results: palyak });
    } catch (error) {
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ message: error.message });
        } else {
            response.status(500).json({ message: ERRORS.GAMEFLOW.FETCH_GAME_MAPS_FAILED });
        }
    }
});

router.use("/", sessionsRoutes);

module.exports = router;
