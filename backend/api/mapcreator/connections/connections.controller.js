const connectionsService = require("./connections.service.js");

async function getConnections(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;

        const connections = await connectionsService.fetchConnections(userId, gameMapID);

        response.status(200).json({
            success: true,
            connections
        });
    } catch (error) {
        next(error);
    }
}

async function updateConnection(request, response, next) {
    try {
        const userId = request.session.userid;
        const { connectionID } = request.params;
        const { directionStartToEnd, directionEndToStart } = request.body;

        await connectionsService.updateConnection(userId, connectionID, directionStartToEnd, directionEndToStart);

        response.status(200).json({
            success: true,
            message: "Kapcsolat sikeresen frissítve!"
        });
    } catch (error) {
        next(error);
    }
}

async function createConnection(request, response, next) {
    try {
        const userId = request.session.userid;
        const { gameMapID } = request.params;
        const { startPointId, endPointId, directionStartToEnd, directionEndToStart } = request.body;

        const newConnectionId = await connectionsService.createConnection(userId, gameMapID, startPointId, endPointId, directionStartToEnd, directionEndToStart);

        response.status(201).json({
            success: true,
            connectionId: newConnectionId,
            message: "Kapcsolat sikeresen mentve!"
        });
    } catch (error) {
        next(error);
    }
}

async function deleteConnection(request, response, next) {
    try {
        const userId = request.session.userid;
        const { connectionID } = request.params;

        await connectionsService.deleteConnection(userId, connectionID);

        response.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getConnections,
    updateConnection,
    createConnection,
    deleteConnection
};
