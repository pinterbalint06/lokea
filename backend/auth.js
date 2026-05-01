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
        if (!roles.includes(request.session?.role)) {
            next(new AppError("A keresett oldal nem található.", 404));
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
