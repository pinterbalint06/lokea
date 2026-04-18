const database = require("#sql/database.js");
const path = require("path");

function resolveImagePath(filePath, resolution) {
    let finalFilePath = filePath;
    if (resolution == "low") {
        const imagePath = path.parse(filePath);
        finalFilePath = path.join(imagePath.dir, imagePath.name + "_low_res" + imagePath.ext);
    }
    return finalFilePath;
}

async function getPointImageDetails(pointID, resolution) {
    const imageData = await database.getPointImage(pointID);
    const imagePath = resolveImagePath(imageData.filepath, resolution);

    return {
        imagePath,
        width: imageData.width,
        height: imageData.height,
        northDirection: imageData.north_direction
    };
}

async function getMapImageDetails(mapID, resolution) {
    const imageData = await database.getMapImage(mapID);
    const imagePath = resolveImagePath(imageData.filepath, resolution);

    return {
        imagePath,
        width: imageData.width,
        height: imageData.height
    };
}

async function getPointConnections(pointID) {
    return await database.getConnectionsByPointId(pointID);
}

async function getGameMapDetails(gameMapID) {
    let retunData = null;
    const gameMapDetails = await database.getGameMapDetails(gameMapID);

    if (gameMapDetails) {
        const topScores = await database.getTopScoresForGameMap(gameMapID);
        retunData = { ...gameMapDetails, top_scores: topScores };
    }

    return retunData;
}

module.exports = {
    getPointImageDetails,
    getMapImageDetails,
    getPointConnections,
    getGameMapDetails
};
