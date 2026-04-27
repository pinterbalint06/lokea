const express = require("express");
const router = express.Router();
const database = require("../../sql/database.js");
const { checkGameSession } = require("../../auth.js");
const mapsRoutes = require("./maps/maps.routes.js");
const randomPointRoutes = require("./random-point/random-point.routes.js");
const guessRoutes = require("./guess/guess.routes.js");

// router.use(checkGameSession);

router.get("/get_game_info", async (request, response) => {
    try {
        const game = request.session.game;
        response.status(200).json({
            success: true,
            game: {
                title: game.gameTitle,
                rounds: game.rounds,
                currentRound: game.currentRound,
                roundTime: game.roundTime
            }
        });
    } catch (error) {
        response.status(500).json({ success: false, message: "Error fetching game info" });
    }
});

router.use("/", mapsRoutes);
router.use("/", randomPointRoutes);
router.use("/", guessRoutes);

router.post("/finish_game_session", async (request, response) => {
    try {
        await database.finishGameSession(request.session.game.activeSessionId);
        delete request.session.game;
        response.status(200).json({ success: true, message: "Game session finished" });
    } catch (error) {
        response.status(500).json({ success: false, message: "Error finishing game session" });
    }
});

module.exports = router;
