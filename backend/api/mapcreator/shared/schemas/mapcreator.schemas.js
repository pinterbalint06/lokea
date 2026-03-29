const joi = require('../../../../utils/joi.js');
const { errorMessages, idSchema } = require('../../../../utils/schemas.js');

// TODOp: hibaüzenetek specifikusabban
const titleSchema = joi
    .string()
    .trim()
    .regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]{1,20}$/) // atleast one character long, max 20. only hungarian letters, numbers, spaces, underscores and -
    .required()
    .messages(errorMessages)
    .prefs({ errors: { wrap: { label: false } } });

const degreeSchema = joi
    .number()
    .min(0)
    .less(360)
    .messages(errorMessages)
    .prefs({ errors: { wrap: { label: false } } });

const uvCoordinateSchema = joi
    .number()
    .min(0)
    .less(1)
    .required()
    .messages(errorMessages)
    .prefs({ errors: { wrap: { label: false } } });

module.exports = {
    idSchema,
    degreeSchema,
    uvCoordinateSchema,
    titleSchema
};