const { resolutionQuerySchema, gameMapIDParamsSchema } = require("#gamemaps/shared/schemas/gamemaps.schemas.js");

const getGameMapCoverImageSchema = {
    params: gameMapIDParamsSchema,
    query: resolutionQuerySchema
};

const gameMapIDParamSchema = {
    params: gameMapIDParamsSchema
};

module.exports = {
    getGameMapCoverImageSchema,
    gameMapIDParamSchema
};
