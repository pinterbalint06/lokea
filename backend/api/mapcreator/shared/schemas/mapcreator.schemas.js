const joi = require("#utils/joi.js");
const { idSchema } = require("#utils/schemas.js");
const ERRORS = require("#utils/errorMessages.js");

const titleSchema = joi
    .string()
    .trim()
    .max(20)
    .pattern(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]+$/) // only hungarian letters, numbers, spaces, underscores and -
    .required()
    .messages({
        "string.base": ERRORS.MAP.TITLE_EMPTY,
        "any.required": ERRORS.MAP.TITLE_EMPTY,
        "string.empty": ERRORS.MAP.TITLE_EMPTY,

        "string.max": ERRORS.MAP.TITLE_TOO_LONG,

        "string.pattern.base": ERRORS.MAP.TITLE_INVALID_CHARS
    });

const degreeSchema = joi
    .number()
    .min(0)
    .less(360);

const uvCoordinateSchema = joi
    .number()
    .min(0)
    .less(1)
    .required()
    .messages({
        "number.base": ERRORS.POINT.UV_INVALID_TYPE,
        "number.min": ERRORS.POINT.UV_MIN_ERROR,
        "number.less": ERRORS.POINT.UV_MAX_ERROR,
        "any.required": ERRORS.POINT.UV_REQUIRED
    });

module.exports = {
    idSchema,
    degreeSchema,
    uvCoordinateSchema,
    titleSchema
};