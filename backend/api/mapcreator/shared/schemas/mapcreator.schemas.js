const joi = require('../../../../utils/joi.js');

const errorMessages = {
    'any.required': 'Helytelen {#label}!',
    'any.empty': 'Helytelen {#label}!',
    'number.base': 'Helytelen {#label}!',
    'number.empty': 'Helytelen {#label}!',
    'number.integer': 'Helytelen {#label}!',
    'number.positive': 'Helytelen {#label}!',
    'number.max': 'Helytelen {#label}!',
    'number.min': 'Helytelen {#label}!',
    'number.less': 'Helytelen {#label}!',
    'number.unsafe': 'Helytelen {#label}!',
    'string.empty': 'Helytelen {#label}!',
    'string.pattern.base': 'Helytelen {#label}!',
    'any.required': 'Helytelen {#label}!',
    'string.base': 'Helytelen {#label}!'
};

const titleSchema = joi
    .string()
    .trim()
    .regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]{1,20}$/) // atleast one character long, max 20. only hungarian letters, numbers, spaces, underscores and -
    .required()
    .messages(errorMessages)
    .prefs({ errors: { wrap: { label: false } } });

const idSchema = joi
    .number()
    .integer()
    .positive()
    .max(2147483647)
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