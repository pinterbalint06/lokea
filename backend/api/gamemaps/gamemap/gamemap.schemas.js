const joi = require("#utils/joi.js");
const ERRORS = require("#utils/error-messages.js");
const { gameMapIDParamsSchema } = require("#gamemaps/shared/schemas/gamemaps.schemas.js");

const HUNGARIAN_TEXT_PATTERN = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]+$/;

const getGameMapDetailsSchema = {
    params: gameMapIDParamsSchema
};

const deleteGameMapSchema = {
    params: gameMapIDParamsSchema
};

const updateGameMapSchema = {
    params: gameMapIDParamsSchema,
    body:
        joi.object({
            title: joi
                .string()
                .trim()
                .min(3)
                .max(50)
                .pattern(HUNGARIAN_TEXT_PATTERN)
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
                .pattern(HUNGARIAN_TEXT_PATTERN)
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

module.exports = {
    getGameMapDetailsSchema,
    deleteGameMapSchema,
    updateGameMapSchema
};
