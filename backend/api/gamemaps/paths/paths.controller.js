const pathsService = require("#gamemaps/paths/paths.service.js");

async function getPointPaths(request, response, next) {
    try {
        const { pointID } = request.params;

        const paths = await pathsService.getPointPaths(pointID);

        response.status(200).json({ connections });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPointPaths
};
