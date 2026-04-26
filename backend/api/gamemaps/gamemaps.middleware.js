const ERRORS = require("#utils/errorMessages.js");
const AppError = require("#utils/AppError.js")

async function isAllowedToGetMapImage(request, response, next) {
    try {
        // TODO: does user have permission. currently editing the map or is in a game with the map. but not both at the same time.
        const isAllowed = true;

        if (!isAllowed) {
            throw new AppError(ERRORS.MAP.NO_ACCESS, 403);
        }

        next();
    } catch (error) {
        next(error);
    }
}

async function isAllowedToAccessPoint(request, response, next) {
    try {
        // TODO: does user have permission. currently editing the map or is in a game with currently on this point. but not both at the same time.
        const isAllowed = true;

        if (!isAllowed) {
            throw new AppError(ERRORS.POINT.NO_ACCESS, 403);
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    isAllowedToGetMapImage,
    isAllowedToAccessPoint
};
