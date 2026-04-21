const joi = require("#utils/joi.js");
const { idSchema } = require("#utils/schemas.js");
const ERRORS = require("#utils/error-messages.js");

function createParamsSchema(paramName, errorMessage) {
    return joi.object({
        [paramName]: idSchema(errorMessage)
    });
}

const resolution = joi.string()
    .trim()
    .lowercase()
    .valid("low", "high")
    .default("high")
    .messages({
        "string.base": ERRORS.COMMON.INVALID_RESOLUTION,
        "any.only": ERRORS.COMMON.INVALID_RESOLUTION
    });

const resolutionQuerySchema = joi.object({
    resolution
});

const pointIDParamsSchema = createParamsSchema("pointID", ERRORS.POINT.INVALID_ID);
const mapIDParamsSchema = createParamsSchema("mapID", ERRORS.MAP.INVALID_ID);
const gameMapIDParamsSchema = createParamsSchema("gameMapID", ERRORS.GAMEMAP.INVALID_ID);

const pointIDParamsOnlySchema = {
    params: pointIDParamsSchema
};

const mapIDParamsOnlySchema = {
    params: mapIDParamsSchema
};

const gameMapIDParamsOnlySchema = {
    params: gameMapIDParamsSchema
};

module.exports = {
    resolutionQuerySchema,
    pointIDParamsSchema,
    mapIDParamsSchema,
    gameMapIDParamsSchema,
    pointIDParamsOnlySchema,
    mapIDParamsOnlySchema,
    gameMapIDParamsOnlySchema
};