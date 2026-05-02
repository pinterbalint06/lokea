const { getAllMaps: getAllMapsDb } = require("#gameflow/maps/maps.queries.js");

async function getAllMaps(gameMapId) {
    const maps = await getAllMapsDb(gameMapId);
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
