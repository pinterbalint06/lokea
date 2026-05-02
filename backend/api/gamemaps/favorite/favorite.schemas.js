const { gameMapIDParamsSchema } = require("#gamemaps/shared/schemas/gamemaps.schemas.js");

const favoriteSchema = {
    params: gameMapIDParamsSchema
};

module.exports = { favoriteSchema };
