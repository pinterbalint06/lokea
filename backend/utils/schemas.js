const joi = require("./joi.js");

const idSchema = (customErrorMessage) => {
    return joi
        .number()
        .integer()
        .positive()
        .max(2147483647)
        .required()
        .messages({
            "number.base": customErrorMessage,
            "number.integer": customErrorMessage,
            "number.positive": customErrorMessage,
            "number.max": customErrorMessage,
            "any.required": customErrorMessage,
            "string.empty": customErrorMessage,
            "string.base": customErrorMessage,
            "number.unsafe": customErrorMessage
        });
};

module.exports = {
    idSchema
};
