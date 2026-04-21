const joi = require("#utils/joi.js");
const ERRORS = require("#utils/error-messages.js");

const HUNGARIAN_TEXT_PATTERN = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9 _-]+$/;

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

const getGameMapCommentsSchema = {
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
    body: commentBodySchema
};

const getUserCommentSchema = {};

const putUserCommentSchema = {
    body: commentBodySchema
};

const deleteUserCommentSchema = {};

module.exports = {
    getGameMapCommentsSchema,
    postGameMapCommentsSchema,
    getUserCommentSchema,
    putUserCommentSchema,
    deleteUserCommentSchema
};
