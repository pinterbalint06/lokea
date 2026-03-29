import { fetchAndValidate, handleResponseError } from "../../libs/network/fetch.js";

export async function saveNewMap(mapFile, gameMapID, mapTitle) {
    let formData = new FormData();
    formData.append("mapImage", mapFile);
    formData.append("title", mapTitle);

    let response = await fetch(`/api/map-creator/game-maps/${gameMapID}/maps`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        await handleResponseError(response);
    }

    let data = await response.json();

    return {
        mapId: data.mapId
    };
}

export async function savePoint({
    pointId,
    position,
    northDirection,
    equirectangularFile,
    mapID,
    isNew
}) {
    let url = "";
    let method = "";

    if (!Number.isFinite(position.u) || !Number.isFinite(position.v)) {
        throw new Error("Helytelen UV koordináták!");
    }

    let formData = new FormData();
    formData.append("u", position.u);
    formData.append("v", position.v);
    formData.append("northDirection", northDirection);

    if (isNew) {
        if (!equirectangularFile) {
            throw new Error("Nincs kép megadva!");
        }
        formData.append("equirectangularImage", equirectangularFile);
        url = `/api/map-creator/maps/${mapID}/points`;
        method = "POST";
    } else {
        if (equirectangularFile) {
            formData.append("equirectangularImage", equirectangularFile);
        }
        url = `/api/map-creator/points/${pointId}`;
        method = "PUT";
    }

    let response = await fetch(url, {
        method: method,
        body: formData
    });

    if (!response.ok) {
        await handleResponseError(response);
    }

    let data = await response.json();

    return data;
}

export async function deletePoint(pointId) {
    let response = await fetch(`/api/map-creator/points/${pointId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}

export async function deleteMap(mapId) {
    let response = await fetch(`/api/map-creator/maps/${mapId}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        await handleResponseError(response);
    }
}

export async function renameMap(mapId, title) {
    let formData = new FormData();
    formData.append("title", title);

    let response = await fetch(`/api/map-creator/maps/${mapId}`, {
        method: "PUT",
        body: formData
    });

    if (!response.ok) {
        await handleResponseError(response);
    }

    let data = await response.json();

    return {
        title: data.title
    };
}

export async function saveConnection(gameMapID, connection) {
    let formData = new FormData();
    formData.append("startPointId", connection.start_point_id);
    formData.append("endPointId", connection.end_point_id);
    if (connection.direction_start_to_end != undefined) {
        formData.append("directionStartToEnd", connection.direction_start_to_end);
    }
    if (connection.direction_end_to_start != undefined) {
        formData.append("directionEndToStart", connection.direction_end_to_start);
    }

    let response = await fetch(`/api/map-creator/game-maps/${gameMapID}/connections`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        await handleResponseError(response);
    }

    let data = await response.json();

    return {
        connection_id: data.connectionId,
        start_point_id: connection.start_point_id,
        end_point_id: connection.end_point_id,
        game_maps_id: connection.game_maps_id,
        start_map_id: connection.start_map_id,
        end_map_id: connection.end_map_id,
        direction_start_to_end: connection.direction_start_to_end,
        direction_end_to_start: connection.direction_end_to_start
    };
}

export async function saveUnsavedConnections(gameMapID, unsavedConnections) {
    let saved = [];
    let failed = [];

    if (unsavedConnections.length > 0) {
        let savePromises = unsavedConnections.map(connection => saveConnection(gameMapID, connection));
        let results = await Promise.allSettled(savePromises);

        for (let i = 0; i < results.length; i++) {
            let result = results[i];
            if (result.status == "fulfilled") {
                saved.push(result.value);
            } else {
                if (result.status == "rejected") {
                    failed.push(result.reason);
                }
            }
        }
    }

    return {
        saved: saved,
        failed: failed
    };
}

export async function updateConnectionDirections(connectionId, directions) {
    let formData = new FormData();

    if (directions.direction_start_to_end != undefined) {
        formData.append("directionStartToEnd", directions.direction_start_to_end);
    }
    if (directions.direction_end_to_start != undefined) {
        formData.append("directionEndToStart", directions.direction_end_to_start);
    }

    let response = await fetch(`/api/map-creator/connections/${connectionId}`, {
        method: "PUT",
        body: formData
    });

    if (!response.ok) {
        await handleResponseError(response);
    }

    let data = await response.json();

    return {
        connection_id: connectionId,
        ...directions
    };
}

export async function saveDraftConnectionDirections(draftDirections) {
    let saved = [];
    let failed = [];

    let savePromises = [];
    for (const connectionId in draftDirections) {
        savePromises.push(updateConnectionDirections(parseInt(connectionId), draftDirections[connectionId]));
    }

    let results = await Promise.allSettled(savePromises);

    for (let i = 0; i < results.length; i++) {
        let result = results[i];
        if (result.status == "fulfilled") {
            saved.push(result.value);
        } else {
            failed.push(result.reason);
        }
    }

    return {
        saved: saved,
        failed: failed
    };
}

export async function fetchPoints(mapID) {
    return fetchAndValidate(`/api/map-creator/maps/${mapID}/points`, "points");
}

export async function fetchMapList(gameMapID) {
    return fetchAndValidate(`/api/map-creator/game-maps/${gameMapID}/maps`, "maps");
}

export async function fetchConnections(gameMapID) {
    return fetchAndValidate(`/api/map-creator/game-maps/${gameMapID}/connections`, "connections");
}

export async function deleteConnection(connectionId) {
    let response = await fetch(`/api/map-creator/connections/${connectionId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}
