const joi = require("joi");
const ERRORS = require("#utils/error-messages.js");

const extendedJoi = joi.extend((joi) => ({
    type: "object",
    base: joi.object().required().messages({
        "any.required": ERRORS.COMMON.MISSING_DATA,
        "object.base": ERRORS.COMMON.MISSING_DATA
    }),
    messages: {
        "object.requiredBody": ERRORS.COMMON.MISSING_DATA,
    },
    rules: {
        requiredBody: {
            method() {
                return this.$_addRule("requiredBody");
            },
            validate(body, helpers) {
                const isBodyEmpty = !body || Object.keys(body).length == 0;

                return isBodyEmpty
                    ? helpers.error("object.requiredBody")
                    : body;
            }
        }
    }
}));

module.exports = extendedJoi;