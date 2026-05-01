const express = require("express");
const router = express.Router();
const { finishGameSession } = require("#gameflow/sessions/sessions.queries.js");
const { checkGameSession } = require("#root/auth.js");
const ERRORS = require("#utils/error-messages.js");
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
        response.status(500).json({ message: ERRORS.GAMEFLOW.FETCH_SESSION_FAILED });
    }
});

router.use("/", mapsRoutes);
router.use("/", randomPointRoutes);
router.use("/", guessRoutes);

router.delete("/session", async (request, response) => {
    try {
        await finishGameSession(request.session.game.activeSessionId);
        delete request.session.game;
        response.status(200).json({ message: "A játékmenet sikeresen befejezve!" });
    } catch (error) {
        response.status(500).json({ message: ERRORS.GAMEFLOW.FINISH_SESSION_FAILED });
    }
});

module.exports = router;
