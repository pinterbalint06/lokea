const { resolutionQuerySchema } = require("#gamemaps/shared/schemas/gamemaps.schemas.js");

const getGameMapCoverImageSchema = {
    query: resolutionQuerySchema
};

module.exports = {
    getGameMapCoverImageSchema
};
