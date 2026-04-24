const path = require('path');

const checkAuth = (request, response, next) => {
    if (!request.session.userid) {
        return response.status(401).json({ message: "Bejelentkezés szükséges!" });
    }
    next();
};

const checkRole = (...roles) => {
    return (request, response, next) => {
        if (!request.session.userid) {
            return response.status(401).json({ message: "Bejelentkezés szükséges!" });
        }
        if (!roles.includes(request.session.role)) {
            return response.status(404).sendFile(path.join(__dirname, '../frontend/html/notfound.html'));
        }
        next();
    };
};

const checkGameSession = (request, response, next) => {
    // if (!request.session.userid) {
        // const error = new Error("Bejelentkezés szükséges!");
        // error.statusCode = 401;
        // throw error;
    // }
    if (!request.session.game?.activeSessionId) {
        const error = new Error("Nincs aktív játék munkamenet!");
        error.statusCode = 403;
        throw error;
    }
    next();

};

module.exports = {
    checkAuth,
    checkRole,
    checkGameSession,
};
