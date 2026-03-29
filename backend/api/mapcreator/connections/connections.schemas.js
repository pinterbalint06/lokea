const joi = require('../../../utils/joi.js');
const { idSchema, degreeSchema } = require('../shared/schemas/mapcreator.schemas.js');

const getConnectionsSchema = {
    params:
        joi.object({
            gameMapID: idSchema
                .label("pálya ID")
        })
};

const updateConnectionSchema = {
    params:
        joi.object({
            connectionID: idSchema
                .label("kapcsolat ID")
        }),
    body:
        joi.object({
            directionStartToEnd: degreeSchema
                .label("kezdőpontból végpontba irány"),
            directionEndToStart: degreeSchema
                .label("végpontból kezdőpontba irány")
        })
            .requiredBody()
            .or('directionStartToEnd', 'directionEndToStart')
            .messages({
                'object.missing': 'Nem adott meg módosítandó irányt!'
            })
};

const createConnectionSchema = {
    params: joi.object({
        gameMapID: idSchema.label("pálya ID")
    }),
    body: joi.object({
        startPointId: idSchema
            .label("kezdőpont ID")
            .required(),
        endPointId: idSchema
            .label("végpont ID")
            .required()
            .invalid(joi.ref('startPointId'))
            .greater(joi.ref('startPointId'))
            .messages({
                'any.invalid': 'A kezdőpont és a végpont nem lehet ugyanaz!',
                'number.greater': 'A kisebbik id-val rendelkező pontnak kell a kezdőpontnak lennie!'
            }),
        directionStartToEnd: degreeSchema
            .label("kezdőpontból végpontba irány"),
        directionEndToStart: degreeSchema
            .label("végpontból kezdőpontba irány")
    }).requiredBody()
};

const deleteConnectionSchema = {
    params: joi.object({
        connectionID: idSchema.label("kapcsolat ID")
    })
};

module.exports = {
    getConnectionsSchema,
    updateConnectionSchema,
    createConnectionSchema,
    deleteConnectionSchema
};
