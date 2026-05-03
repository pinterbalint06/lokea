const { getAllMaps: getAllMapsDb } = require("#gameflow/maps/maps.queries.js");

async function getAllMaps(gameMapId) {
    const maps = await getAllMapsDb(gameMapId);
    return maps.map(map => ({ title: map.title, mapId: map.map_id }));
}

module.exports = { getAllMaps };
