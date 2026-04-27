const randomPointService = require("./random-point.service.js");

async function getRandomPoint(request, response) {
    try {
        const sessionId = request.session.game.activeSessionId;
        const game = request.session.game;

        if (!game.roundStartedAt) {
            game.roundStartedAt = Date.now();
        }

        const { sessionPoint, responsePoint, cycleIncremented } = await randomPointService.getRandomPoint(sessionId, game);

        game.point = sessionPoint;
        if (cycleIncremented) {
            game.currentCycle += 1;
        }

        response.status(200).json({ success: true, point: responsePoint });
    } catch (error) {
        if (error.statusCode) {
            response.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error fetching random point" });
        }
    }
}

module.exports = { getRandomPoint };
