const connectionsService = require("#gamemaps/connections/connections.service.js");

async function getPointConnections(request, response, next) {
    try {
        const { pointID } = request.params;

        const connections = await connectionsService.getPointConnections(pointID);

        response.status(200).json({ connections });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPointConnections
};
