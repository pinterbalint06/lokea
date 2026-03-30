const joi = require("#utils/joi.js");
const ERRORS = require("#utils/errorMessages.js");
const { idSchema, degreeSchema } = require("../shared/schemas/mapcreator.schemas.js");

const startToEndMessages = {
    "number.base": ERRORS.CONNECTION.START_TO_END_TYPE,
    "number.unsafe": ERRORS.CONNECTION.START_TO_END_TYPE,
    "number.min": ERRORS.CONNECTION.START_TO_END_MIN,
    "number.less": ERRORS.CONNECTION.START_TO_END_MAX
};

const endToStartMessages = {
    "number.base": ERRORS.CONNECTION.END_TO_START_TYPE,
    "number.unsafe": ERRORS.CONNECTION.END_TO_START_TYPE,
    "number.min": ERRORS.CONNECTION.END_TO_START_MIN,
    "number.less": ERRORS.CONNECTION.END_TO_START_MAX
};

const getConnectionsSchema = {
    params:
        joi.object({
            gameMapID: idSchema(ERRORS.GAMEMAP.INVALID_ID)
        })
};

const updateConnectionSchema = {
    params:
        joi.object({
            connectionID: idSchema(ERRORS.CONNECTION.INVALID_ID)
        }),
    body:
        joi.object({
            directionStartToEnd: degreeSchema
                .messages(startToEndMessages),
            directionEndToStart: degreeSchema
                .messages(endToStartMessages)
        })
            .requiredBody()
            .or("directionStartToEnd", "directionEndToStart")
            .messages({
                "object.missing": ERRORS.CONNECTION.ATLEAST_ONE_DIRECTION
            })
};

const createConnectionSchema = {
    params: joi.object({
        gameMapID: idSchema(ERRORS.GAMEMAP.INVALID_ID)
    }),
    body: joi.object({
        startPointId: idSchema(ERRORS.CONNECTION.INVALID_START_ID)
            .required(),
        endPointId: idSchema(ERRORS.CONNECTION.INVALID_END_ID)
            .required()
            .invalid(joi.ref("startPointId"))
            .greater(joi.ref("startPointId"))
            .messages({
                "any.invalid": ERRORS.CONNECTION.SAME_START_END,
                "number.greater": ERRORS.CONNECTION.END_MUST_BE_GREATER
            }),
        directionStartToEnd: degreeSchema
            .messages(startToEndMessages),
        directionEndToStart: degreeSchema
            .messages(endToStartMessages)
    }).requiredBody()
};

const deleteConnectionSchema = {
    params: joi.object({
        connectionID: idSchema(ERRORS.CONNECTION.INVALID_ID)
    })
};

module.exports = {
    getConnectionsSchema,
    updateConnectionSchema,
    createConnectionSchema,
    deleteConnectionSchema
};
