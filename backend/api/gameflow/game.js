const express = require("express");
const router = express.Router();
const database = require("#sql/game.database.js");
const { checkGameSession } = require("#utils/auth.js");
const mapsRoutes = require("./maps/maps.routes.js");
const randomPointRoutes = require("./random-point/random-point.routes.js");
const guessRoutes = require("./guess/guess.routes.js");

router.use(checkGameSession);

router.get("/session", async (request, response) => {
    try {
        const game = request.session.game;
        response.status(200).json({
            game: {
                title: game.gameTitle,
                rounds: game.rounds,
                currentRound: game.currentRound,
                roundTime: game.roundTime
            }
        });
    } catch (error) {
        response.status(500).json({ message: "Error fetching game info" });
    }
});

router.use("/", mapsRoutes);
router.use("/", randomPointRoutes);
router.use("/", guessRoutes);

router.delete("/session", async (request, response) => {
    try {
        await database.finishGameSession(request.session.game.activeSessionId);
        delete request.session.game;
        response.status(200).json({ message: "Game session finished" });
    } catch (error) {
        response.status(500).json({ message: "Error finishing game session" });
    }
});

module.exports = router;
