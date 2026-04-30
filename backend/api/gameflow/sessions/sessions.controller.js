const sessionsService = require("./sessions.service.js");
const AppError = require("#utils/app-error.js");

async function getActiveSession(request, response) {
    try {
        const userId = request.session?.userid;
        const sessionObject = await sessionsService.getActiveSession(userId);

        if (!sessionObject) {
            response.status(200).json({ success: true, hasActiveSession: false });
        } else {
            request.session.game = sessionObject;
            response.status(200).json({ success: true, hasActiveSession: true, gameTitle: sessionObject.gameTitle });
        }
    } catch (error) {
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error checking active session" });
        }
    }
}

async function createGameSession(request, response) {
    try {
        const userId = request.session?.userid;
        const sessionObject = await sessionsService.createGameSession(userId, request.body);

        request.session.game = sessionObject;
        response.status(200).json({ success: true, message: "Game map ID saved in session" });
    } catch (error) {
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            response.status(500).json({ success: false, message: "Error posting game" });
        }
    }
}

module.exports = { getActiveSession, createGameSession };
