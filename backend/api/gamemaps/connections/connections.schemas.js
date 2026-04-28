const { pointIDParamsSchema } = require("#gamemaps/shared/schemas/gamemaps.schemas.js");

const getPointConnectionsSchema = {
    params: pointIDParamsSchema
};

module.exports = {
    getPointConnectionsSchema
};
