const sessionsService = require("./sessions.service.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");

async function getActiveSession(request, response, next) {
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
            next(error);
        } else {
            next(new AppError(ERRORS.GAMEFLOW.CHECK_SESSION_FAILED, 500));
        }
    }
}

async function createGameSession(request, response, next) {
    try {
        const userId = request.session?.userid;
        const sessionObject = await sessionsService.createGameSession(userId, request.body);

        request.session.game = sessionObject;
        response.status(200).json({ message: "A játék munkamenet elindítva!" });
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError(ERRORS.GAMEFLOW.CREATE_SESSION_FAILED, 500));
        }
    }
}

module.exports = { getActiveSession, createGameSession };
