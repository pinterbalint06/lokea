const sessionsService = require("./sessions.service.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");

async function getActiveSession(request, response) {
    try {
        const userId = request.session?.userid;
        const sessionObject = await sessionsService.getActiveSession(userId);

        if (!sessionObject) {
            response.status(200).json({ hasActiveSession: false });
        } else {
            request.session.game = sessionObject;
            response.status(200).json({ hasActiveSession: true, gameTitle: sessionObject.gameTitle });
        }
    } catch (error) {
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ message: error.message });
        } else {
            response.status(500).json({ message: ERRORS.GAMEFLOW.CHECK_SESSION_FAILED });
        }
    }
}

async function createGameSession(request, response) {
    try {
        const userId = request.session?.userid;
        const sessionObject = await sessionsService.createGameSession(userId, request.body);

        request.session.game = sessionObject;
        response.status(200).json({ message: "A játék munkamenet elindítva!" });
    } catch (error) {
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ message: error.message });
        } else {
            response.status(500).json({ message: ERRORS.GAMEFLOW.CREATE_SESSION_FAILED });
        }
    }
}

module.exports = { getActiveSession, createGameSession };
