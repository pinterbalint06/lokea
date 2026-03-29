const pointsService = require("./points.service.js");

async function getPoints(request, response, next) {
    try {
        const userId = request.session.userid;
        const { mapID } = request.params;

        const points = await pointsService.fetchPoints(userId, mapID);

        response.status(200).json({
            success: true,
            points
        });
    } catch (error) {
        next(error);
    }
};

async function updatePoint(request, response, next) {
    try {
        const userId = request.session.userid;
        const { pointID } = request.params;
        const pointData = request.body;
        const file = request.file;

        await pointsService.updatePoint(userId, pointID, pointData, file);

        response.status(200).json({
            success: true,
            message: "Pont sikeresen frissítve!"
        });
    } catch (error) {
        next(error);
    }
};

async function createPoint(request, response, next) {
    try {
        const userId = request.session.userid;
        const { mapID } = request.params;
        const pointData = request.body;
        const file = request.file;

        const newPointId = await pointsService.createPoint(userId, mapID, pointData, file);

        response.status(201).json({
            success: true,
            pointId: newPointId
        });
    } catch (error) {
        next(error);
    }
};

async function deletePoint(request, response, next) {
    try {
        const userId = request.session.userid;
        const { pointID } = request.params;

        await pointsService.deletePoint(userId, pointID);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPoints,
    updatePoint,
    createPoint,
    deletePoint
};