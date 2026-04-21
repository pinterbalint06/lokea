const joi = require("#utils/joi.js");
const { idSchema } = require("#utils/schemas.js");
const ERRORS = require("#utils/errorMessages.js");

const HUNGARIAN_TEXT_PATTERN = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]+$/;

function createParamsSchema(paramName, errorMessage) {
    return joi.object({
        [paramName]: idSchema(errorMessage)
    });
}

const resolution = joi.string()
    .trim()
    .lowercase()
    .valid("low", "high")
    .default("high")
    .messages({
        "string.base": ERRORS.COMMON.INVALID_RESOLUTION,
        "any.only": ERRORS.COMMON.INVALID_RESOLUTION
    });

const resolutionQuerySchema = joi.object({
    resolution
});

const pointIDParamsSchema = createParamsSchema("pointID", ERRORS.POINT.INVALID_ID);
const mapIDParamsSchema = createParamsSchema("mapID", ERRORS.MAP.INVALID_ID);
const gameMapIDParamsSchema = createParamsSchema("gameMapID", ERRORS.GAMEMAP.INVALID_ID);

const commentSchema = joi
    .string()
    .trim()
    .min(1)
    .max(255)
    .pattern(HUNGARIAN_TEXT_PATTERN) // only hungarian letters, numbers, spaces, underscores and -
    .messages({
        "string.base": ERRORS.COMMENT.INVALID_CONTENT,
        "string.empty": ERRORS.COMMENT.EMPTY_CONTENT,
        "string.min": ERRORS.COMMENT.EMPTY_CONTENT,
        "string.max": ERRORS.COMMENT.TOO_LONG,
        "string.pattern.base": ERRORS.COMMENT.INVALID_CHARACTERS
    });

const ratingSchema = joi
    .number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
        "number.base": ERRORS.COMMENT.INVALID_RATING,
        "number.integer": ERRORS.COMMENT.INVALID_RATING,
        "number.min": ERRORS.COMMENT.TOO_LOW_RATING,
        "number.max": ERRORS.COMMENT.TOO_HIGH_RATING,
        "number.unsafe": ERRORS.COMMENT.INVALID_RATING,
        "any.required": ERRORS.COMMENT.RATING_REQUIRED
    });

const commentBodySchema = joi.object({
    comment: commentSchema,
    rating: ratingSchema
});

const getPointImageSchema = {
    params: pointIDParamsSchema,
    query: resolutionQuerySchema
};

const getMapImageSchema = {
    params: mapIDParamsSchema,
    query: resolutionQuerySchema
};


const getPointConnectionsSchema = {
    params: pointIDParamsSchema
};

const getGameMapDetailsSchema = {
    params: gameMapIDParamsSchema
};

const getGameMapCoverImageSchema = {
    params: gameMapIDParamsSchema,
    query: resolutionQuerySchema
};

const putGameMapCoverImageSchema = {
    params: gameMapIDParamsSchema
};

const deleteGameMapSchema = {
    params: gameMapIDParamsSchema
};

const deleteGameMapCoverImageSchema = {
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
                .pattern(HUNGARIAN_TEXT_PATTERN) // only hungarian letters, numbers, spaces, underscores and -
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
                .pattern(HUNGARIAN_TEXT_PATTERN) // only hungarian letters, numbers, spaces, underscores and -
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
    params: gameMapIDParamsSchema,
    query:
        joi.object({
            page: joi
                .number()
                .integer()
                .min(1)
                .default(1)
                .messages({
                    "number.base": ERRORS.COMMON.INVALID_PAGE,
                    "number.integer": ERRORS.COMMON.INVALID_PAGE,
                    "number.min": ERRORS.COMMON.INVALID_PAGE
                })
        })
};

const postGameMapCommentsSchema = {
    params: gameMapIDParamsSchema,
    body: commentBodySchema
};

const getUserCommentSchema = {
    params: gameMapIDParamsSchema
};

const putUserCommentSchema = {
    params: gameMapIDParamsSchema,
    body: commentBodySchema
};

const deleteUserCommentSchema = {
    params: gameMapIDParamsSchema
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
    getGameMapCommentsSchema,
    postGameMapCommentsSchema,
    getUserCommentSchema,
    putUserCommentSchema,
    deleteUserCommentSchema,
    deleteGameMapSchema
};
