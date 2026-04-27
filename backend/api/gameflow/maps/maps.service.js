const database = require("../../../sql/database.js");
const { readImageData } = require("../shared/gameflow.utils.js");

async function getAllMaps(gameMapId) {
    const maps = await database.getAllMaps(gameMapId);
    const mapObjects = [];
    const mapInfo = [];

    for (const map of maps) {
        const { base64, mimeType } = await readImageData(map.filepath);
        mapInfo.push({ mapId: map.map_id, width: map.width, height: map.height });
        mapObjects.push({
            title: map.title,
            image: { id: map.image_id, mimeType, base64, width: map.width, height: map.height }
        });
    }

    return { maps: mapObjects, mapInfo };
}

module.exports = { getAllMaps };
