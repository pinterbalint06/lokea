const joi = require('../../../utils/joi.js');
const { idSchema, titleSchema } = require('../shared/schemas/mapcreator.schemas.js');

const getMapsSchema = {
    params:
        joi.object({
            gameMapID: idSchema
                .label("pálya ID")
        })
};

const updateMapSchema = {
    params:
        joi.object({
            mapID: idSchema
                .label("térkép ID")
        }),
    body:
        joi.object({
            title: titleSchema
                .label("térképnév")
        }).requiredBody()
};

const createMapSchema = {
    params:
        joi.object({
            gameMapID: idSchema
                .label("pálya ID")
        }),
    body:
        joi.object({
            title: titleSchema
                .label("térképnév")
        }).requiredBody()
};

const deleteMapSchema = {
    params:
        joi.object({
            mapID: idSchema
                .label("térkép ID")
        })
};

module.exports = {
    getMapsSchema,
    updateMapSchema,
    createMapSchema,
    deleteMapSchema
};