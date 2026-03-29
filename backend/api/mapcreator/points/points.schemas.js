const joi = require('../../../utils/joi.js');
const { idSchema, degreeSchema, uvCoordinateSchema } = require('../shared/schemas/mapcreator.schemas.js');

const getPointsSchema = {
    params:
        joi.object({
            mapID: idSchema
                .label("térkép ID")
        })
};

const updatePointSchema = {
    params:
        joi.object({
            pointID: idSchema
                .label("pont ID")
        }),
    body:
        joi.object({
            u: uvCoordinateSchema
                .label("koordináták"),
            v: uvCoordinateSchema
                .label("koordináták"),
            northDirection: degreeSchema
                .required()
                .label("északirány"),
        }).requiredBody()
};

const createPointSchema = {
    params:
        joi.object({
            mapID: idSchema
                .label("térkép ID")
        }),
    body:
        joi.object({
            u: uvCoordinateSchema
                .label("koordináták"),
            v: uvCoordinateSchema
                .label("koordináták"),
            northDirection: degreeSchema
                .required()
                .label("északirány"),
        }).requiredBody()
};

const deletePointSchema = {
    params:
        joi.object({
            pointID: idSchema
                .label("pont ID")
        })
};

module.exports = {
    getPointsSchema,
    updatePointSchema,
    createPointSchema,
    deletePointSchema
};