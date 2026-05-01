const database = require("#gamemaps/paths/paths.queries.js");

// TODO: továbbfejlesztés és teszt!
async function getPointPaths(pointID) {
    return await database.getConnectionsByPointId(pointID);
}

module.exports = {
    getPointPaths
};
