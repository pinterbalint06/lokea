const guessService = require("./guess.service.js");

async function processGuess(request, response) {
    try {
        const sessionId = request.session.game.activeSessionId;
        const game = request.session.game;

        const result = await guessService.processGuess(sessionId, game, request.body);

        game.currentRound += 1;
        delete game.roundStartedAt;

        response.status(200).json(result);
    } catch (error) {
        if (error.statusCode) {
            response.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error processing guess" });
        }
    }
}

module.exports = { processGuess };
