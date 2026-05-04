const express = require("express");
const router = express.Router();
const { finishGameSession } = require("#gameflow/sessions/sessions.queries.js");
const { totalScore } = require("#gameflow/guess/guess.queries.js");
const { checkGameSession } = require("#middlewares/auth.js");
const ERRORS = require("#utils/error-messages.js");
const mapsRoutes = require("./maps/maps.routes.js");
const randomPointRoutes = require("./random-point/random-point.routes.js");
const guessRoutes = require("./guess/guess.routes.js");
const AppError = require("#utils/app-error.js");

router.use(checkGameSession);

router.get("/session", async (request, response, next) => {
    try {
        const game = request.session.game;
        response.status(200).json({
            game: {
                title: game.gameTitle,
                gameMapId: game.gameMapId,
                rounds: game.rounds,
                currentRound: game.currentRound,
                roundTime: game.roundTime
            }
        });
    } catch (error) {
        next(new AppError(ERRORS.GAMEFLOW.FETCH_SESSION_FAILED, 500));
    }
});

router.use("/", mapsRoutes);
router.use("/", randomPointRoutes);
router.use("/", guessRoutes);

router.delete("/session", async (request, response, next) => {
    try {
        const sessionId = request.session.game.activeSessionId;
        const total = await totalScore(sessionId);
        await finishGameSession(sessionId);
        delete request.session.game;
        response.status(200).json({ message: "A játékmenet sikeresen befejezve!", totalScore: total });
    } catch (error) {
        next(new AppError(ERRORS.GAMEFLOW.FINISH_SESSION_FAILED, 500));
    }
});

module.exports = router;
