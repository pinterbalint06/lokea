const database = require("#sql/database.js");

async function getPointConnections(pointID) {
    return await database.getConnectionsByPointId(pointID);
}

module.exports = {
    getPointConnections
};
