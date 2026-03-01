const path = require('path');

const checkAuth = (request, response, next) => {
    if (!request.session.userid) {
        response.status(401).json({ message: "Bejelentkezés szükséges!" });
    }
    else {
        next();
    }

};

const checkRole = (...roles) => {
    return (request, response, next) => {
        if (!roles.includes(request.session.role)) {
            response.status(404).sendFile(path.join(__dirname, '../frontend/html/notfound.html'));
        }
        else {
            next();
        }
    };
};

module.exports = {
    checkAuth,
    checkRole
};