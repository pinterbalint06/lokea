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
        height: imageData.height
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

module.exports = {
    getPointImageDetails,
    getMapImageDetails,
    getPointConnections
};
