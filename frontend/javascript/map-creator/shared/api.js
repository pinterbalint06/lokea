import { fetchAndValidate, handleResponseError, validateJsonResponse } from "../../libs/network/fetch.js";

export async function saveNewMap(mapFile, gameMapID, mapTitle) {
    let formData = new FormData();
    formData.append("mapImage", mapFile);
    formData.append("gameMapID", gameMapID);
    formData.append("title", mapTitle);

    let response = await fetch("/api/map_creator/saveNewMap", {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        await handleResponseError(response);
    }

    let data = await response.json();
    validateJsonResponse(data);

    return {
        mapId: data.mapId
    };
}

export async function savePoint({
    pointId,
    position,
    northDirection,
    equirectangularFile,
    gameMapID,
    mapID,
    isNew
}) {
    let fields = {
        x: position.x,
        y: position.y,
        northDirection: northDirection
    };

    let url = "";
    let method = "";

    let formData = new FormData();
    formData.append("x", fields.x);
    formData.append("y", fields.y);
    formData.append("northDirection", fields.northDirection);

    if (isNew) {
        if (!equirectangularFile) {
            throw new Error("Nincs kép megadva!");
        }
        formData.append("equirectangularImage", equirectangularFile);
        formData.append("gameMapID", gameMapID);
        formData.append("mapID", mapID);
        url = "/api/map_creator/savePoint";
        method = "POST";
    } else {
        if (equirectangularFile) {
            formData.append("equirectangularImage", equirectangularFile);
        }
        url = `/api/map_creator/point/${pointId}`;
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
    validateJsonResponse(data, "Sikertelen mentés!");

    return data;
}

export async function deletePoint(pointId) {
    let response = await fetch(`/api/map_creator/point/${pointId}`, {
        method: "DELETE"
    });
    let data = await response.json();

    if (!response.ok) {
        await handleResponseError(response);
    }

    validateJsonResponse(data, "Sikertelen pont törlés!");
}

export async function deleteMap(mapId) {
    let response = await fetch(`/api/map_creator/map/${mapId}`, {
        method: "DELETE"
    });
    let data = await response.json();

    if (!response.ok) {
        await handleResponseError(response);
    }
    validateJsonResponse(data, "Sikertelen térkép törlés!");
}

export async function renameMap(mapId, title) {
    let formData = new FormData();
    formData.append("title", title);

    let response = await fetch(`/api/map_creator/map/${mapId}`, {
        method: "PUT",
        body: formData
    });

    if (!response.ok) {
        await handleResponseError(response);
    }

    let data = await response.json();
    validateJsonResponse(data, "Sikertelen átnevezés!");

    return {
        mapId: data.mapId,
        title: data.title
    };
}

export async function saveConnection(gameMapID, connection) {
    let formData = new FormData();
    formData.append("startPointId", connection.start_point_id);
    formData.append("endPointId", connection.end_point_id);
    formData.append("gameMapID", gameMapID);

    let response = await fetch("/api/map_creator/saveConnection", {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        await handleResponseError(response);
    }

    let data = await response.json();
    validateJsonResponse(data, "Sikertelen mentés!");

    return {
        connection_id: data.connectionId,
        start_point_id: connection.start_point_id,
        end_point_id: connection.end_point_id,
        game_maps_id: connection.game_maps_id
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

export async function fetchPoints(mapID) {
    return fetchAndValidate(`/api/map_creator/${mapID}/points`, "points");
}

export async function fetchMapList(gameMapID) {
    return fetchAndValidate(`/api/map_creator/maps?gameMapID=${gameMapID}`, "maps");
}

export async function fetchConnections(gameMapID) {
    return fetchAndValidate(`/api/map_creator/${gameMapID}/connections`, "connections");
}

export async function deleteConnection(connectionId) {
    let response = await fetch(`/api/map_creator/connection/${connectionId}`, {
        method: "DELETE"
    });
    let data = await response.json();

    if (!response.ok) {
        await handleResponseError(response);
    }

    validateJsonResponse(data, "Sikertelen kapcsolat törlés!");
}
