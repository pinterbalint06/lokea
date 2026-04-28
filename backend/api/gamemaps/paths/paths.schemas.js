const { pointIDParamsSchema } = require("#gamemaps/shared/schemas/gamemaps.schemas.js");

const getPointPathsSchema = {
    params: pointIDParamsSchema
};

module.exports = {
    getPointPathsSchema
};
