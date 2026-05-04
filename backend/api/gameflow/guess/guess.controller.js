const guessService = require("./guess.service.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");

async function processGuess(request, response, next) {
    try {
        const sessionId = request.session.game.activeSessionId;
        const game = request.session.game;
        const result = await guessService.processGuess(sessionId, game, request.body);

        game.currentRound += 1;
        delete game.roundStartedAt;

        response.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(ERRORS.GAMEFLOW.PROCESS_GUESS_FAILED, 500));
        }
    }
}

module.exports = { processGuess };
