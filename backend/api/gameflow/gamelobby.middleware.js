const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");

const VALID_SORTS = ["created", "rating", "plays", "favorites"];
const VALID_FILTERS = ["mine"];

function validateGameLobbyQuery(request, response, next) {
    try {
        const sort = String(request.query.sort || "created").toLowerCase();
        let offset = 0;

        if (request.query.offset !== undefined) {
            offset = Number(request.query.offset);
            if (!Number.isInteger(offset) || offset < 0) {
                throw new AppError(ERRORS.GAMEFLOW.INVALID_OFFSET, 400);
            }
        }

        if (!VALID_SORTS.includes(sort)) {
            throw new AppError(ERRORS.GAMEFLOW.INVALID_SORT, 400);
        }

        const filter = VALID_FILTERS.includes(request.query.filter) ? request.query.filter : null;

        request.lobbyQuery = { sort, offset, filter };

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = { validateGameLobbyQuery };
