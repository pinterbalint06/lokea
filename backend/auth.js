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
            return response.status(403).send();
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