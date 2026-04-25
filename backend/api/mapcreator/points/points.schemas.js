const joi = require("#utils/joi.js");
const ERRORS = require("#utils/error-messages.js");
const { idSchema, degreeSchema, uvCoordinateSchema } = require("#mapcreator/shared/schemas/mapcreator.schemas.js");

const northDirectionMessages = {
    "number.base": ERRORS.POINT.NORTH_DIRECTION_TYPE,
    "number.unsafe": ERRORS.POINT.NORTH_DIRECTION_TYPE,
    "number.min": ERRORS.POINT.NORTH_DIRECTION_MIN,
    "number.less": ERRORS.POINT.NORTH_DIRECTION_MAX,
    "any.required": ERRORS.POINT.NORTH_DIRECTION_REQUIRED
};

const getPointsSchema = {
    params:
        joi.object({
            mapID: idSchema(ERRORS.MAP.INVALID_ID)
        })
};

const updatePointSchema = {
    params:
        joi.object({
            pointID: idSchema(ERRORS.POINT.INVALID_ID)
        }),
    body:
        joi.object({
            u: uvCoordinateSchema,
            v: uvCoordinateSchema,
            northDirection: degreeSchema
                .required()
                .messages(northDirectionMessages),
        }).requiredBody()
};

const createPointSchema = {
    params:
        joi.object({
            mapID: idSchema(ERRORS.MAP.INVALID_ID)
        }),
    body:
        joi.object({
            u: uvCoordinateSchema,
            v: uvCoordinateSchema,
            northDirection: degreeSchema
                .required()
                .messages(northDirectionMessages),
        }).requiredBody()
};

const deletePointSchema = {
    params:
        joi.object({
            pointID: idSchema(ERRORS.POINT.INVALID_ID)
        })
};

module.exports = {
    getPointsSchema,
    updatePointSchema,
    createPointSchema,
    deletePointSchema
};
