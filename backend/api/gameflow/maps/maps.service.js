const database = require("#sql/game.database.js");

async function getAllMaps(gameMapId) {
    const maps = await database.getAllMaps(gameMapId);
    const mapObjects = [];
    const mapInfo = [];

    for (const map of maps) {
        mapInfo.push({ mapId: map.map_id, width: map.width, height: map.height });
        mapObjects.push({
            title: map.title,
            mapId: map.map_id
        });
    }
    return { maps: mapObjects, mapInfo };
}

module.exports = { getAllMaps };
