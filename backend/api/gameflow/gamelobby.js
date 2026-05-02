const express = require("express");
const router = express.Router();
const { getGameMaps } = require("#gameflow/gamelobby.queries.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");
const sessionsRoutes = require("./sessions/sessions.routes.js");

router.get("/", async (request, response) => {
    try {
        const sort = String(request.query.sort || "created").toLowerCase();
        let offset = 0;
        if (request.query.offset !== undefined) {
            offset = Number(request.query.offset);
            if (!Number.isInteger(offset) || offset < 0) {
                throw new AppError(ERRORS.GAMEFLOW.INVALID_OFFSET, 400);
            }
        }

        const validSorts = ["created", "rating", "plays", "favorites"];
        if (!validSorts.includes(sort)) {
            throw new AppError(ERRORS.GAMEFLOW.INVALID_SORT, 400);
        }

        const filter = request.query.filter === 'mine' ? 'mine' : null;
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
