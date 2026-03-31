const joi = require('#utils/joi.js');
const { idSchema } = require('#utils/schemas.js');

const resolution = joi.string()
    .trim()
    .lowercase()
    .valid('low', 'high')
    .default('high')
    .messages({
        'string.base': 'Helytelen felbontás',
        'any.only': 'Helytelen felbontás'
    });

const getPointImageSchema = {
    params:
        joi.object({
            pointID: idSchema
                .label("pont ID")
        }),
    query:
        joi.object({
            resolution
        })
};

const getMapImageSchema = {
    params:
        joi.object({
            mapID: idSchema
                .label("térkép ID")
        }),
    query:
        joi.object({
            resolution
        })
};


const getPointConnectionsSchema = {
    params:
        joi.object({
            pointID: idSchema
                .label("pont ID")
        })
};

module.exports = {
    getPointImageSchema,
    getMapImageSchema,
    getPointConnectionsSchema
};
