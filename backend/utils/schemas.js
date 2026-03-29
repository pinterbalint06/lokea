const joi = require('./joi.js');

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

const idSchema = joi
    .number()
    .integer()
    .positive()
    .max(2147483647)
    .required()
    .messages(errorMessages)
    .prefs({ errors: { wrap: { label: false } } });

module.exports = {
    idSchema,
    errorMessages
};
