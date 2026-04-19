const joi = require("#utils/joi.js");
const { idSchema } = require("#utils/schemas.js");
const ERRORS = require("#utils/errorMessages.js");

const resolution = joi.string()
    .trim()
    .lowercase()
    .valid("low", "high")
    .default("high")
    .messages({
        "string.base": ERRORS.COMMON.INVALID_RESOLUTION,
        "any.only": ERRORS.COMMON.INVALID_RESOLUTION
    });

const getPointImageSchema = {
    params:
        joi.object({
            pointID: idSchema(ERRORS.POINT.INVALID_ID)
        }),
    query:
        joi.object({
            resolution
        })
};

const getMapImageSchema = {
    params:
        joi.object({
            mapID: idSchema(ERRORS.MAP.INVALID_ID)
        }),
    query:
        joi.object({
            resolution
        })
};


const getPointConnectionsSchema = {
    params:
        joi.object({
            pointID: idSchema(ERRORS.POINT.INVALID_ID)
        })
};

const getGameMapDetailsSchema = {
    params:
        joi.object({
            gameMapID: idSchema(ERRORS.GAMEMAP.INVALID_ID)
        })
};

const getGameMapCoverImageSchema = {
    params:
        joi.object({
            gameMapID: idSchema(ERRORS.GAMEMAP.INVALID_ID)
        }),
    query:
        joi.object({
            resolution
        })
};

const putGameMapCoverImageSchema = {
    params:
        joi.object({
            gameMapID: idSchema(ERRORS.GAMEMAP.INVALID_ID)
        })
};

const deleteGameMapCoverImageSchema = {
    params:
        joi.object({
            gameMapID: idSchema(ERRORS.GAMEMAP.INVALID_ID)
        })
};

const updateGameMapSchema = {
    params:
        joi.object({
            gameMapID: idSchema(ERRORS.GAMEMAP.INVALID_ID)
        }),
    body:
        joi.object({
            title: joi
                .string()
                .trim()
                .min(3)
                .max(50)
                .pattern(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]+$/) // only hungarian letters, numbers, spaces, underscores and -
                .messages({
                    "string.base": ERRORS.GAMEMAP.TITLE.INVALID_PATTERN,
                    "string.empty": ERRORS.GAMEMAP.TITLE.EMPTY,
                    "string.min": ERRORS.GAMEMAP.TITLE.TOO_SHORT,
                    "string.max": ERRORS.GAMEMAP.TITLE.TOO_LONG,
                    "string.pattern.base": ERRORS.GAMEMAP.TITLE.INVALID_PATTERN
                }),
            description: joi
                .string()
                .trim()
                .min(3)
                .max(255)
                .pattern(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]+$/) // only hungarian letters, numbers, spaces, underscores and -
                .messages({
                    "string.base": ERRORS.GAMEMAP.DESCRIPTION.INVALID_PATTERN,
                    "string.empty": ERRORS.GAMEMAP.DESCRIPTION.EMPTY,
                    "string.min": ERRORS.GAMEMAP.DESCRIPTION.TOO_SHORT,
                    "string.max": ERRORS.GAMEMAP.DESCRIPTION.TOO_LONG,
                    "string.pattern.base": ERRORS.GAMEMAP.DESCRIPTION.INVALID_PATTERN
                })
        }).or("title", "description")
            .messages({
                "object.missing": ERRORS.GAMEMAP.ATLEAST_TITLE_OR_DESCRIPTION
            })
};

const getGameMapCommentsSchema = {
    params:
        joi.object({
            gameMapID: idSchema(ERRORS.GAMEMAP.INVALID_ID)
        }),
    query:
        joi.object({
            page: joi.number().integer().min(1).default(1).messages({
                "number.base": ERRORS.COMMON.INVALID_PAGE,
                "number.integer": ERRORS.COMMON.INVALID_PAGE,
                "number.min": ERRORS.COMMON.INVALID_PAGE
            })
        })
};

module.exports = {
    getPointImageSchema,
    getMapImageSchema,
    getPointConnectionsSchema,
    getGameMapDetailsSchema,
    getGameMapCoverImageSchema,
    putGameMapCoverImageSchema,
    deleteGameMapCoverImageSchema,
    updateGameMapSchema,
    getGameMapCommentsSchema
};
