const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");

const VALID_SORTS = ["created", "rating", "plays", "favorites"];

async function validateGameLobbyQuery(request, response, next) {
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

        request.query.sort = sort;
        request.query.offset = offset;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = { validateGameLobbyQuery };
