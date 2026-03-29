const joi = require('joi');

const extendedJoi = joi.extend((joi) => ({
    type: 'object',
    base: joi.object().required().messages({
        'any.required': 'Hiányzó adatok!',
        'object.base': 'Hiányzó adatok!'
    }),
    messages: {
        'object.requiredBody': 'Hiányzó adatok!',
    },
    rules: {
        requiredBody: {
            method() {
                return this.$_addRule('requiredBody');
            },
            validate(body, helpers) {
                const isBodyEmpty = !body || Object.keys(body).length == 0;

                return isBodyEmpty
                    ? helpers.error('object.requiredBody')
                    : body;
            }
        }
    }
}));

module.exports = extendedJoi;