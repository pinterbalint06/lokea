const joi = require("#utils/joi.js");
const { idSchema } = require("#utils/schemas.js");
const ERRORS = require("#utils/errorMessages.js");

const resolution = joi.string()
    .trim()
    .lowercase()
    .valid("low", "high")
    .default("high")
    .messages({
        "string.base": ERRORS.COMMON.INVALID_RESOLUTION,
        "any.only": ERRORS.COMMON.INVALID_RESOLUTION
    });

const getPointImageSchema = {
    params:
        joi.object({
            pointID: idSchema(ERRORS.POINT.INVALID_ID)
        }),
    query:
        joi.object({
            resolution
        })
};

const getMapImageSchema = {
    params:
        joi.object({
            mapID: idSchema(ERRORS.MAP.INVALID_ID)
        }),
    query:
        joi.object({
            resolution
        })
};


const getPointConnectionsSchema = {
    params:
        joi.object({
            pointID: idSchema(ERRORS.POINT.INVALID_ID)
        })
};

module.exports = {
    getPointImageSchema,
    getMapImageSchema,
    getPointConnectionsSchema
};
