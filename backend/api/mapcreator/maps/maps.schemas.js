const joi = require("#utils/joi.js");
const ERRORS = require("#utils/error-messages.js");
const { idSchema, titleSchema } = require("#mapcreator/shared/schemas/mapcreator.schemas.js");

const getMapsSchema = {
    params:
        joi.object({
            gameMapID: idSchema(ERRORS.GAMEMAP.INVALID_ID)
        })
};

const updateMapSchema = {
    params:
        joi.object({
            mapID: idSchema(ERRORS.MAP.INVALID_ID)
        }),
    body:
        joi.object({
            title: titleSchema
        }).requiredBody()
};

const createMapSchema = {
    params:
        joi.object({
            gameMapID: idSchema(ERRORS.GAMEMAP.INVALID_ID)
        }),
    body:
        joi.object({
            title: titleSchema
        }).requiredBody()
};

const deleteMapSchema = {
    params:
        joi.object({
            mapID: idSchema(ERRORS.MAP.INVALID_ID)
        })
};

module.exports = {
    getMapsSchema,
    updateMapSchema,
    createMapSchema,
    deleteMapSchema
};
