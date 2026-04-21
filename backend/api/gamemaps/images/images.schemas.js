const { resolutionQuerySchema, pointIDParamsSchema, mapIDParamsSchema } = require("#gamemaps/shared/schemas/gamemaps.schemas.js");

const getPointImageSchema = {
    params: pointIDParamsSchema,
    query: resolutionQuerySchema
};

const getMapImageSchema = {
    params: mapIDParamsSchema,
    query: resolutionQuerySchema
};

module.exports = {
    getPointImageSchema,
    getMapImageSchema
};
