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

const checkAuthPage = (request, response, next) => {
    if (!request.session.userid) {
        return response.redirect('/main');
    }
    next();
};

const checkGameSessionPage = (request, response, next) => {
    if (!request.session.userid) {
        return response.redirect('/login_page');
    }
    if (!request.session.game?.activeSessionId) {
        return response.redirect('/game-maps');
    }
    next();
};

const checkGameSession = (request, response, next) => {
    if (!request.session.userid) {
        return response.status(401).json({ success: false, message: "Bejelentkezés szükséges!" });
    }
    if (!request.session.game?.activeSessionId) {
        return response.status(403).json({ success: false, message: "Nincs aktív játék munkamenet!" });
    }
    next();
};

module.exports = {
    checkAuth,
    checkAuthPage,
    checkRole,
    checkGameSession,
    checkGameSessionPage,
};
