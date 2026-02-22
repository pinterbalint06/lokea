import { MapViewer } from "./libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "./libs/viewer/EquirectangularViewer.js";
import { degreeToRadian } from "./libs/math/mathUtils.js";

// |------------------|
// | GLOBAL VARIABLES |
// |------------------|
const ICONS = {
    POINTING_HAND: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84.91 122.88" style="height: 2em;" fill="white">
            <path d="M26.6,80.57c-0.11-0.06-0.25-0.14-0.37-0.23c-1.49-1.18-3.13-2.51-4.54-3.66c-2.06-1.69-4.43-3.64-6.09-5.02 c-1.13-0.93-2.42-1.58-3.63-1.83c-0.79-0.14-1.49-0.14-2.06,0.08c-0.45,0.2-0.85,0.56-1.1,1.13c-0.34,0.76-0.51,1.83-0.42,3.3 c0.08,1.3,0.54,2.71,1.13,4.09c0.87,2,2.09,3.86,2.99,5.04c0.06,0.08,0.11,0.14,0.14,0.23l17.84,25.48 c0.23,0.34,0.37,0.71,0.39,1.07c0.37,2.93,0.99,5.16,1.89,6.54c0.68,1.01,1.52,1.52,2.62,1.49h28.07c1.75-0.03,3.33-0.53,4.79-1.55 c1.61-1.1,3.04-2.82,4.37-5.13c0.03-0.03,0.06-0.08,0.08-0.11c0.51-0.87,1.18-2,1.83-3.07c2.85-4.68,5.33-8.77,5.61-14.57l-0.17-8 c-0.03-0.11-0.03-0.23-0.03-0.34s0-0.87,0.03-1.89c0.06-5.3,0.14-11.84-4.71-12.65h-3.13c-0.03,1.49-0.11,3.02-0.2,4.48 c-0.08,1.32-0.17,2.56-0.17,3.78c0,1.3-1.04,2.34-2.34,2.34c-1.3,0-2.34-1.04-2.34-2.34c0-1.21,0.08-2.62,0.17-4.09 c0.31-4.99,0.68-10.71-3.3-11.41h-3.1c-0.17,0-0.34-0.03-0.51-0.06c0.03,1.8-0.08,3.66-0.2,5.47C60.08,70.46,60,71.7,60,72.91 c0,1.3-1.04,2.34-2.34,2.34c-1.3,0-2.34-1.04-2.34-2.34c0-1.21,0.08-2.62,0.17-4.09c0.31-4.99,0.68-10.71-3.3-11.41h-3.1 c-0.23,0-0.42-0.03-0.62-0.08v9.1c0,1.3-1.04,2.34-2.34,2.34c-1.3,0-2.34-1.04-2.34-2.34V41.99c0-4.09-1.66-6.68-3.8-7.75 c-0.79-0.4-1.63-0.59-2.45-0.59c-0.82,0-1.66,0.2-2.45,0.59c-2.11,1.07-3.75,3.66-3.75,7.86v42.81c0,1.3-1.04,2.34-2.34,2.34 c-1.3,0-2.34-1.04-2.34-2.34v-4.34H26.6L26.6,80.57z M39.29,13.99c0,1.55-1.26,2.78-2.78,2.78c-1.55,0-2.78-1.26-2.78-2.78V2.78 c0-1.55,1.26-2.78,2.78-2.78c1.55,0,2.78,1.26,2.78,2.78V13.99L39.29,13.99L39.29,13.99z M13.99,36.95c1.55,0,2.78,1.26,2.78,2.78 c0,1.55-1.26,2.78-2.78,2.78H2.78C1.23,42.5,0,41.24,0,39.73c0-1.55,1.26-2.78,2.78-2.78H13.99L13.99,36.95z M21.92,20.33 c1.08,1.08,1.08,2.85,0,3.93c-1.08,1.08-2.85,1.08-3.93,0l-7.9-7.93c-1.08-1.08-1.08-2.85,0-3.93c1.08-1.08,2.85-1.08,3.93,0 L21.92,20.33L21.92,20.33z M58.47,42.5c-1.55,0-2.78-1.26-2.78-2.78c0-1.55,1.26-2.78,2.78-2.78h11.21c1.55,0,2.78,1.26,2.78,2.78 c0,1.55-1.26,2.78-2.78,2.78H58.47L58.47,42.5z M54.47,23.65c-1.08,1.08-2.85,1.08-3.93,0c-1.08-1.08-1.08-2.85,0-3.93l7.9-7.93 c1.08-1.08,2.85-1.08,3.93,0c1.08,1.08,1.08,2.85,0,3.93L54.47,23.65L54.47,23.65z M48.47,52.79c0.2-0.06,0.39-0.08,0.62-0.08h3.24 c0.17,0,0.37,0.03,0.53,0.06c4.31,0.68,6.26,3.19,7.05,6.45c0.31-0.14,0.65-0.23,0.99-0.23h3.24c0.17,0,0.37,0.03,0.53,0.06 c4.65,0.73,6.51,3.58,7.19,7.19c0.11-0.03,0.23-0.03,0.37-0.03h3.24c0.17,0,0.37,0.03,0.54,0.06c8.91,1.38,8.79,10.23,8.71,17.36 v1.86l0.2,8.23v0.25c-0.34,7.02-3.1,11.56-6.28,16.8c-0.54,0.87-1.07,1.77-1.8,3.02c-0.03,0.03-0.03,0.06-0.06,0.08 c-1.66,2.9-3.58,5.13-5.78,6.65c-2.23,1.55-4.71,2.34-7.41,2.37H35.53c-2.79,0.06-4.96-1.16-6.57-3.55c-1.3-1.92-2.14-4.62-2.59-8 L8.9,86.35l-0.09-0.08c-1.04-1.38-2.45-3.55-3.52-5.95c-0.79-1.8-1.38-3.75-1.52-5.67c-0.14-2.28,0.17-4.09,0.82-5.52 c0.79-1.78,2.09-2.93,3.64-3.55c1.44-0.59,3.07-0.68,4.71-0.34c1.97,0.4,4,1.38,5.72,2.82c1.41,1.18,3.78,3.1,6.09,4.99l1.92,1.58 V42.13c0-6.23,2.76-10.23,6.34-12.04c1.44-0.73,2.99-1.1,4.57-1.1c1.58,0,3.13,0.37,4.56,1.1c3.58,1.8,6.4,5.83,6.4,11.95v10.76 L48.47,52.79L48.47,52.79z" />
          </svg>`,
    UPLOAD_TO_CLOUD: `<svg xmlns="http://www.w3.org/2000/svg" style="height: 1em;" fill="white" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 511.52"><path fill-rule="nonzero" d="M36.75 0h438.5C495.55 0 512 16.82 512 37.03v437.46c0 20.19-16.47 37.03-36.75 37.03H98.28c-2.89 0-5.5-1.17-7.39-3.06L3.06 420.62A10.387 10.387 0 0 1 0 413.24V37.03C0 16.81 16.45 0 36.75 0zM174.5 447.79c-13.75 0-13.75-20.9 0-20.9h153.97c13.74 0 13.74 20.9 0 20.9H174.5zm0-64.38c-13.75 0-13.75-20.9 0-20.9h153.97c13.74 0 13.74 20.9 0 20.9H174.5zm209.51 106.91V350.25c0-16.78-13.87-30.64-30.65-30.64H149.6c-16.78 0-30.64 13.86-30.64 30.64v140.07h265.05zm20.89-140.07v140.37h70.35c8.85 0 15.85-7.37 15.85-16.13V37.03c0-8.78-6.99-16.13-15.85-16.13H404.9v170.17c0 28.31-23.23 51.55-51.54 51.55H149.6c-28.34 0-51.54-23.21-51.54-51.55V20.9H36.75c-8.87 0-15.85 7.34-15.85 16.13v371.88l77.16 77.16V350.25c0-28.32 23.22-51.54 51.54-51.54h203.76c28.22 0 51.54 23.32 51.54 51.54zm-20.89-159.18V20.9H118.96v170.17c0 16.8 13.85 30.65 30.64 30.65h203.76c16.77 0 30.65-13.88 30.65-30.65z"/></svg>`,
    SPINNER: `<div class="spinner-border spinner-border-sm"></div>`
};

// constants
const CONSTANTS = {
    MAP_CANVAS_ID: "mapCanvas",
    EQUIRECTANGULAR_CANVAS_ID: "equirectangularPreview",
    TEMP_ID: -2,
    FOV_MARKER_ID: -999,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MARKER_SIZE: {
        width: 24.0,
        height: 32.0
    },
    CONE_SIZE: {
        width: 100,
        height: 100
    }
};

// app state
/**
 * @type {MapViewer}
 */
let mapViewer;
/**
 * @type {EquirectangularViewer}
 */
let equirectangularViewer;
let UI = {};
let maps = {};
let pointsCache = {};
let connectionsList = [];
let unsavedConnections = [];
let connectionsLoadPromise;
let activeMapId = -1;
let gameMapID = null;
let temporaryConnectionID = -1;
// editor State
let editorState = {
    activePointId: null,
    isPlacingMarker: false,
    pendingEquirectangularFile: null,
    pendingMapFile: null,
    clickOnMapToast: null,
    fovSyncAnimationID: null,
    equiAbortController: null,
    isConnectingMarkers: false,
    connectionToast: null
};

// |-----------|
// |  UTILITY  |
// |-----------|
function showToast(message, type = "", isClosable, options = {}, iconHtml = "", onClosed = () => { }) {
    // Create element
    let toastElement = document.createElement("div");
    let typeClass;
    switch (type) {
        case "success":
            typeClass = "successColor";
            break;
        case "danger":
            typeClass = "dangerColor";
            break;
        default:
            typeClass = "uveg";
            break;
    }
    toastElement.classList.add("toast", "align-items-center", "border-0", typeClass);
    toastElement.setAttribute("role", "alert");
    toastElement.setAttribute("aria-live", "assertive");
    toastElement.setAttribute("aria-atomic", "true");

    let toastDiv = document.createElement("div");
    toastDiv.classList.add("d-flex");

    let toastBody = document.createElement("div");
    toastBody.classList.add("toast-body", "d-flex", "align-items-center");

    toastBody.insertAdjacentHTML("beforeend", iconHtml);

    let messageP = document.createElement("p");
    messageP.classList.add("my-0", "ms-2", "p-0");
    messageP.innerText = message;
    toastBody.appendChild(messageP);

    toastDiv.appendChild(toastBody);

    toastElement.appendChild(toastDiv);

    if (isClosable) {
        let closeButton = document.createElement("button");
        closeButton.setAttribute("type", "button");
        closeButton.setAttribute("data-bs-dismiss", "toast");
        closeButton.setAttribute("aria-label", "Close");
        closeButton.classList.add("btn-close", "btn-close-white", "me-2", "m-auto");
        toastDiv.appendChild(closeButton);
    }

    toastElement.appendChild(toastDiv);

    UI.toastPlace.appendChild(toastElement);

    let toast = new bootstrap.Toast(toastElement, options);
    toast.show();

    toastElement.addEventListener("hidden.bs.toast", () => {
        onClosed();
        toast = null;
        toastElement.remove();
    });
    return toast;
}

async function readImageFile(file) {
    let url = URL.createObjectURL(file);
    let imageBitmap;
    try {
        imageBitmap = await createImageBitmap(file);
        let returnObject = {
            url: url,
            width: imageBitmap.width,
            height: imageBitmap.height
        }
        imageBitmap.close();
        return returnObject;
    } catch (error) {
        URL.revokeObjectURL(url);
        if (imageBitmap) {
            imageBitmap.close();
        }
        throw error;
    }
}

async function processUploadedImageFile(file) {
    if (file.size > CONSTANTS.MAX_FILE_SIZE) {
        throw new Error("Túl nagy fájlméret! (Max 10MB)");
    }
    if (!file.type.startsWith("image/")) {
        throw new Error("Csak kép elfogadott!");
    }
    return await readImageFile(file);
}

function savePreviousValue(event) {
    event.target.dataset.previousValue = event.target.valueAsNumber;
}

function getGameMapIdFromUrl() {
    let pathParts = window.location.pathname.split("/");
    let id = parseInt(pathParts[2]);
    return id;
}

// |-------------|
// | API & STATE |
// |-------------|
async function loadImage(url, loadImageFunction, successCheckId, abortSignal = null) {
    let kepBetolteseToast = showToast("Kép betöltése", "", false, { autohide: false }, ICONS.SPINNER);
    let imageURL;
    try {
        let response = await fetch(
            url,
            {
                "method": "GET",
                "signal": abortSignal
            }
        );
        if (!response.ok) {
            let error = await response.json();
            throw new Error(error.error ? error.error : "Szerver hiba: " + response.status);
        }

        let width = parseInt(response.headers.get("imageWidth"));
        let height = parseInt(response.headers.get("imageHeight"));
        let data = await response.blob();

        imageURL = URL.createObjectURL(data);

        // passed success check
        if (successCheckId()) {
            await loadImageFunction(imageURL, width, height);
            showToast("Kép sikeresen betöltve!", "success", true, { delay: 3000 });
        }
    } catch (error) {
        // if it was aborted do not show error
        if (error.name != "AbortError") {
            console.error(error);
            showToast("Hiba a kép betöltésekor!", "danger", true, { delay: 3000 });
        }
    } finally {
        kepBetolteseToast.hide();
        if (imageURL) {
            URL.revokeObjectURL(imageURL);
        }
    }
}

async function loadPoints(mapID, successCheckId) {
    let pontokBetolteseToast = showToast("Pontok betöltése", "", false, { autohide: false }, ICONS.SPINNER);
    try {
        let response = await fetch(
            "/api/map_creator/" + mapID + "/points",
            {
                "method": "GET"
            }
        );
        if (!response.ok) {
            let error = await response.json();
            throw new Error(error.error ? error.error : "Szerver hiba: " + response.status);
        }

        let data = await response.json();
        // check if the active id is still the same
        if (successCheckId()) {
            if (!data.success) {
                throw new Error(data.error);
            }
            let points = data.points;
            pointsCache = {};
            for (let i = 0; i < points.length; i++) {
                pointsCache[points[i].point_id] = points[i];
                mapViewer.placeMarkerByImageCoordinates(points[i].point_id, points[i].point_x, points[i].point_y, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, "ready");
            }
            UI.newConnectionBtn.disabled = points.length < 2;

            updateConnectionListUI();
            showToast("Pontok sikeresen betöltve!", "success", true, { delay: 3000 });
        }
    } catch (error) {
        console.error(error);
        showToast("Hiba a pontok betöltésekor!", "danger", true, { delay: 3000 });
    } finally {
        pontokBetolteseToast.hide();
    }
}

async function switchMap(mapId) {
    closeCollapse();
    cancelConnection();

    if (maps[mapId]) {
        activeMapId = mapId;
        let mapData = maps[mapId];

        UI.mapSelect.value = mapId;

        let valtasToast = showToast("Váltás: " + mapData.name, "", false, { autohide: false });

        UI.newConnectionBtn.disabled = true;
        if (mapId == CONSTANTS.TEMP_ID) {
            // temporary maps cannot have points
            mapViewer.clearMarkersAndLines();
            await mapViewer.loadMap(maps[mapId].temporaryURL, maps[mapId].imgWidth, maps[mapId].imgHeight);
            UI.saveButton.disabled = false;
        } else {
            UI.saveButton.disabled = true;
            // TODO #2: rework this await, maybe start loading points and map at the same time and when the image also loaded into the viewer draw points
            await loadImage(
                "/api/game_maps/getMapImageById?mapId=" + mapId,
                (url, width, height) => {
                    mapViewer.clearMarkersAndLines();
                    mapViewer.loadMap(url, width, height)
                },
                () => activeMapId == mapId
            );
            await loadPoints(
                mapId,
                () => activeMapId == mapId
            );
            await connectionsLoadPromise;
            renderConnectionsForActiveMap();
        }

        // show change toast for 1 sec after the map was loaded
        setTimeout(() => valtasToast.hide(), 1000);
    }
}

async function saveMap() {
    let terkepMentes = showToast("Térkép mentése", "", false, { autohide: false }, ICONS.SPINNER);
    try {
        let currentMap = maps[activeMapId];

        if (!editorState.pendingMapFile) {
            throw new Error("A térkép kép még nincs kiválasztva!");
        }

        UI.saveButton.disabled = true;

        let formData = new FormData();
        formData.append("mapImage", editorState.pendingMapFile);
        formData.append("gameMapID", gameMapID);
        formData.append("title", currentMap.name);

        let response = await fetch("/api/map_creator/saveNewMap", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            let error = await response.json();
            throw new Error(error.error ? error.error : "Szerver hiba: " + response.status);
        }
        let data = await response.json();
        if (data.success) {
            let oldId = activeMapId;
            let newId = data.mapId;

            currentMap.id = newId;
            maps[newId] = currentMap;

            if (currentMap.temporaryURL) {
                URL.revokeObjectURL(currentMap.temporaryURL);
                delete currentMap.temporaryURL;
            }

            delete maps[oldId];
            updateMapSelectorUI();

            activeMapId = newId;
            UI.mapSelect.value = newId;

            editorState.pendingMapFile = null;

            UI.saveButton.disabled = true;
            terkepMentes.hide();
            showToast("Térkép sikeresen mentve!", "success", true, { delay: 3000 }, ICONS.UPLOAD_TO_CLOUD);
        } else {
            throw new Error("Sikertelen mentés!");
        }
    } catch (error) {
        terkepMentes.hide();
        showToast(error.message, "danger", true, { delay: 3000 });
        UI.saveButton.disabled = false;
    }
}

async function savePoint() {
    editorState.isPlacingMarker = false;
    let pontMentesToast = showToast("Pont mentése", "", false, { autohide: false }, ICONS.SPINNER);
    try {
        let formData = new FormData();
        let position = mapViewer.getMarkerPosition(editorState.activePointId);

        formData.append("x", position.x);
        formData.append("y", position.y);
        formData.append("northDirection", UI.northDirection.valueAsNumber);

        let url = "";
        let method = "";

        if (editorState.activePointId == CONSTANTS.TEMP_ID) {
            if (!editorState.pendingEquirectangularFile) {
                throw new Error("Nincs kép kiválasztva!");
            }
            formData.append("equirectangularImage", editorState.pendingEquirectangularFile);
            formData.append("gameMapID", gameMapID);
            if (activeMapId == CONSTANTS.TEMP_ID) {
                throw new Error("Először mentsd el a térképet!");
            }
            formData.append("mapID", activeMapId);
            url = "/api/map_creator/savePoint";
            method = "POST";
        } else {
            if (editorState.pendingEquirectangularFile) {
                formData.append("equirectangularImage", editorState.pendingEquirectangularFile);
            }
            url = "/api/map_creator/point/" + editorState.activePointId;
            method = "PUT";
        }

        let response = await fetch(
            url,
            {
                "method": method,
                "body": formData
            }
        );
        pontMentesToast.hide();
        if (!response.ok) {
            let error = await response.json();
            throw new Error(error.error ? error.error : "Szerver hiba: " + response.status);
        }
        let data = await response.json();
        if (data.success) {
            showToast("Pont sikeresen mentve!", "success", true, { delay: 3000 }, ICONS.UPLOAD_TO_CLOUD);
            if (editorState.activePointId == CONSTANTS.TEMP_ID) {
                mapViewer.changeMarkerId(editorState.activePointId, data.pointId);
                editorState.activePointId = data.pointId;
                mapViewer.changeMarkerType(editorState.activePointId, "EDIT");
            }
            if (!pointsCache[editorState.activePointId]) {
                pointsCache[editorState.activePointId] = {
                    point_id: editorState.activePointId
                };
            }
            UI.newConnectionBtn.disabled = Object.keys(pointsCache).length < 2;
            pointsCache[editorState.activePointId].point_x = position.x;
            pointsCache[editorState.activePointId].point_y = position.y;
            pointsCache[editorState.activePointId].north_direction = UI.northDirection.valueAsNumber;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        pontMentesToast.hide();
        console.error(error.message);
        console.error(error);
        showToast(error.message, "danger", true, { delay: 3000 });
    } finally {
        editorState.isPlacingMarker = true;
    }
}

async function saveConnection(connection) {
    let savedReturn = {};
    let formData = new FormData();
    formData.append("startPointId", connection.start_point_id);
    formData.append("endPointId", connection.end_point_id);
    formData.append("gameMapID", gameMapID);

    try {
        let response = await fetch("/api/map_creator/saveConnection", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            let error = await response.json();
            throw new Error(error && error.error ? error.error : "Szerver hiba: " + response.status);
        }

        let data = await response.json();
        if (!data.success) {
            throw new Error(data.error ? data.error : "Sikertelen mentés!");
        }

        savedReturn = {
            connection_id: data.connectionId,
            start_point_id: connection.start_point_id,
            end_point_id: connection.end_point_id,
            game_maps_id: connection.game_maps_id
        };

        connectionsList.push(savedReturn);

        // Remove the successfully saved connection from unsavedConnections
        let i = 0;
        while (
            i < unsavedConnections.length &&
            !(unsavedConnections[i].start_point_id == connection.start_point_id &&
                unsavedConnections[i].end_point_id == connection.end_point_id)
        ) {
            i++;
        }
        if (i < unsavedConnections.length) {
            unsavedConnections.splice(i, 1);
        }
    } catch (error) {
        throw {
            connection: connection,
            error: error.message
        };
    }
    return savedReturn;
}

async function saveUnsavedConnections() {
    let saved = [];
    let failed = [];
    if (unsavedConnections.length != 0) {
        let kapcsolatMentesToast = showToast("Kapcsolatok mentése", "", false, { autohide: false }, ICONS.SPINNER);

        let currentUnsaved = JSON.parse(JSON.stringify(unsavedConnections));
        try {
            let savePromises = currentUnsaved.map(connection => saveConnection(connection));

            let results = await Promise.allSettled(savePromises);

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (result.status == "fulfilled") {
                    saved.push(result.value);
                } else {
                    if (result.status == "rejected") {
                        failed.push(result.reason);
                    }
                }
            }

            renderConnectionsForActiveMap();
            await updateConnectionListUI();
        } finally {
            kapcsolatMentesToast.hide();
        }
    }
    return {
        saved: saved,
        failed: failed
    };
}

async function loadMapList() {
    let maps = [];
    try {
        let response = await fetch(
            "/api/map_creator/maps?gameMapID=" + gameMapID,
            {
                "method": "GET"
            }
        );
        if (response.ok) {
            let data = await response.json();
            if (data.success) {
                maps = data.maps;
            }
        }
    } catch (error) {
        console.error(error);
        showToast("Nem sikerült betölteni a térképeket.", "danger", true);
    }
    return maps;
}

function setEditorState(hasMaps) {
    if (hasMaps) {
        UI.uploadOverlay.classList.add("d-none");
        UI.mapSelector.classList.remove("d-none");
        UI.saveButton.disabled = true;
        UI.newConnectionBtn.disabled = true;
    } else {
        UI.uploadOverlay.classList.remove("d-none");
        UI.mapSelector.classList.add("d-none");
    }
}

function cancelConnection() {
    if (editorState.isConnectingMarkers) {
        editorState.isConnectingMarkers = false;
        if (editorState.connectionToast) {
            editorState.connectionToast.hide();
            editorState.connectionToast = null;
        }
        UI.newConnectionBtn.disabled = false;
        mapViewer.canvasInput.setDefaultCursor("default");
    }
}

async function loadConnections() {
    let kapcsolatokBetolteseToast = showToast("Kapcsolatok betöltése", "", false, { autohide: false }, ICONS.SPINNER);
    try {
        let response = await fetch(
            "/api/map_creator/" + gameMapID + "/connections",
            {
                "method": "GET"
            }
        );
        if (!response.ok) {
            let error = await response.json();
            throw new Error(error.error ? error.error : "Szerver hiba: " + response.status);
        }

        let data = await response.json();
        if (!data.success) {
            throw new Error(data.error);
        }
        connectionsList = data.connections;
        updateConnectionListUI();
        showToast("Kapcsolatok sikeresen betöltve!", "success", true, { delay: 3000 });
    } catch (error) {
        console.error(error);
        showToast("Hiba a kapcsolatok betöltésekor!", "danger", true, { delay: 3000 });
    } finally {
        kapcsolatokBetolteseToast.hide();
    }
}

// |-----------------|
// | FILE PROCESSING |
// |-----------------|

async function handleEquirectangularLoad(file) {
    equirectangularViewer.clearImage();
    UI.savePointButton.disabled = false;
    editorState.pendingEquirectangularFile = file;

    let imgData;
    try {
        imgData = await processUploadedImageFile(file);

        await equirectangularViewer.loadImage(imgData.url, imgData.width, imgData.height);
        startFOVSync();

        mapViewer.changeMarkerType(editorState.activePointId, "UPLOADING");

        UI.equiFullscreenBtn.disabled = false;
    } catch (error) {
        console.error(error);
        editorState.pendingEquirectangularFile = null;
        showToast(error.message, "danger", false, { delay: 3000 });
    } finally {
        if (imgData) {
            if (imgData.url) {
                URL.revokeObjectURL(imgData.url);
            }
        }
    }
}

async function handleMapLoad(file) {
    let imgData;
    editorState.pendingMapFile = file;
    try {
        imgData = await processUploadedImageFile(file);

        if (maps[CONSTANTS.TEMP_ID] && maps[CONSTANTS.TEMP_ID].temporaryURL) {
            URL.revokeObjectURL(maps[CONSTANTS.TEMP_ID].temporaryURL);
        }

        let newMap = {
            id: CONSTANTS.TEMP_ID,
            name: file.name.split(".")[0],
            temporaryURL: imgData.url,
            imgWidth: imgData.width,
            imgHeight: imgData.height
        };

        maps[CONSTANTS.TEMP_ID] = newMap;

        updateMapSelectorUI();

        switchMap(CONSTANTS.TEMP_ID);

        UI.mapSelector.classList.remove("d-none");
        UI.uploadOverlay.classList.add("d-none");
        UI.saveButton.disabled = false;
    } catch (error) {
        console.error(error);
        editorState.pendingMapFile = null;
        showToast(error.message, "danger", false, { delay: 3000 });
    }
}

// |-----------------|
// | MAP INTERACTION |
// |-----------------|

function placeOrMoveMarker(cursorX, cursorY) {
    if (mapViewer.doesMarkerExist(editorState.activePointId)) {
        mapViewer.moveMarker(editorState.activePointId, cursorX, cursorY);
        if (mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
            mapViewer.moveMarker(CONSTANTS.FOV_MARKER_ID, cursorX, cursorY);
        }
    } else {
        UI.savePointButton.disabled = true;
        mapViewer.placeMarker(editorState.activePointId, cursorX, cursorY, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, "EMPTY");
        if (editorState.clickOnMapToast) {
            editorState.clickOnMapToast.hide();
        }
        UI.collapseBootstrapElement.show();
    }
    updateCoordinatesInput();
}

function clickOnCanvas(cursorX, cursorY) {
    if (editorState.isConnectingMarkers) {
        let clickedMarkerIndex = mapViewer.getMarkerAtClick(cursorX, cursorY);

        if (clickedMarkerIndex != -1 && clickedMarkerIndex != CONSTANTS.TEMP_ID) {
            if (editorState.activePointId == clickedMarkerIndex) {
                showToast("Ugyanarra a pontra kattintottál. Válassz másik pontot!", "danger", true, { delay: 3000 });
            } else {
                if (mapViewer.isAlreadyConnected(editorState.activePointId, clickedMarkerIndex)) {
                    showToast("Ezek a jelölők már össze vannak kapcsolva!", "danger", true, { delay: 3000 });
                } else {
                    mapViewer.connectMarkers(editorState.activePointId, clickedMarkerIndex, temporaryConnectionID, "unsaved");
                    unsavedConnections.push({
                        connection_id: temporaryConnectionID,
                        start_point_id: editorState.activePointId,
                        end_point_id: clickedMarkerIndex,
                        game_maps_id: activeMapId
                    });
                    temporaryConnectionID--;
                    UI.newConnectionBtn.disabled = false;
                    updateConnectionListUI();

                    showToast("Új kapcsolat létrehozva!", "success", true, { delay: 3000 });

                    cancelConnection();
                }
            }
        } else {
            showToast("Kattints egy térképjelölőre!", "", true, { delay: 2000 });
        }
    } else {
        if (editorState.isPlacingMarker) {
            placeOrMoveMarker(cursorX, cursorY);
        } else {
            let clickedMarkerIndex = mapViewer.getMarkerAtClick(cursorX, cursorY);
            if (clickedMarkerIndex != -1) {
                editorState.activePointId = clickedMarkerIndex;
                mapViewer.changeMarkerType(editorState.activePointId, "EDIT");

                if (editorState.equiAbortController) {
                    editorState.equiAbortController.abort();
                }
                editorState.equiAbortController = new AbortController();
                let signal = editorState.equiAbortController.signal;
                loadImage(
                    "/api/game_maps/getImageByPointId?pointId=" + editorState.activePointId,
                    (url, width, height) => {
                        equirectangularViewer.setYaw(degreeToRadian(pointsCache[editorState.activePointId].north_direction));
                        equirectangularViewer.loadImage(url, width, height)
                        startFOVSync();
                        UI.equiFullscreenBtn.disabled = false;
                    },
                    () => editorState.activePointId == clickedMarkerIndex, // check if the active id is still the same
                    signal
                );

                updateConnectionListUI();
                renderConnectionsForActiveMap();
                updateCoordinatesInput();
                UI.northDirectionRange.value = pointsCache[editorState.activePointId].north_direction;
                UI.northDirection.value = pointsCache[editorState.activePointId].north_direction;
                editorState.isPlacingMarker = true;
                UI.savePointButton.disabled = false;
                let position = mapViewer.getMarkerPosition(editorState.activePointId);
                mapViewer.moveTo(position.x, position.y, 100);
                UI.collapseBootstrapElement.show();
            }
        }
    }
}

function handleCoordinateChange(event) {
    let xCoordinate = UI.coordinateXInput.valueAsNumber;
    let yCoordinate = UI.coordinateYInput.valueAsNumber;
    let isValid = mapViewer.checkCoordinateValid(xCoordinate, yCoordinate);
    if (isValid.correct) {
        event.target.dataset.previousValue = event.target.valueAsNumber;
        mapViewer.moveMarkerToImageCoordinates(editorState.activePointId, xCoordinate, yCoordinate);
        if (mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
            mapViewer.moveMarkerToImageCoordinates(CONSTANTS.FOV_MARKER_ID, xCoordinate, yCoordinate);
        }
    } else {
        event.target.value = event.target.dataset.previousValue;
        showToast(isValid.error, "danger", false, { delay: 3000 });
    }
}

// |----|
// | UI |
// |----|

function renderConnectionsForActiveMap() {
    mapViewer.clearLines();
    let connectionsForActiveMap = connectionsList.filter(connection => pointsCache[connection.start_point_id] && pointsCache[connection.end_point_id]);
    for (let i = 0; i < connectionsForActiveMap.length; i++) {
        let type = "default";
        if (editorState.activePointId == connectionsForActiveMap[i].start_point_id || editorState.activePointId == connectionsForActiveMap[i].end_point_id) {
            type = "editing";
        }
        mapViewer.connectMarkers(connectionsForActiveMap[i].start_point_id, connectionsForActiveMap[i].end_point_id, connectionsForActiveMap[i].connection_id, type);
    }
    for (let i = 0; i < unsavedConnections.length; i++) {
        mapViewer.connectMarkers(unsavedConnections[i].start_point_id, unsavedConnections[i].end_point_id, unsavedConnections[i].connection_id, "unsaved");
    }
}

async function savePointClick() {
    let position = mapViewer.getMarkerPosition(editorState.activePointId);
    let northDirection = UI.northDirection.valueAsNumber;
    let hasUnsavedConnections = unsavedConnections.length > 0;
    let didPointChange = !pointsCache[editorState.activePointId] ||
        position.x != pointsCache[editorState.activePointId].point_x ||
        position.y != pointsCache[editorState.activePointId].point_y ||
        northDirection != pointsCache[editorState.activePointId].north_direction ||
        editorState.pendingEquirectangularFile;

    UI.savePointButton.disabled = true;
    if (didPointChange) {
        await savePoint();
    }
    if (hasUnsavedConnections) {
        let result = await saveUnsavedConnections();
        let saved = result.saved;
        let failed = result.failed;

        if (saved.length > 0 && failed.length == 0) {
            showToast(saved.length + " kapcsolat sikeresen mentve!", "success", true, { delay: 3000 }, ICONS.UPLOAD_TO_CLOUD);
        } else {
            if (saved.length > 0 && failed.length > 0) {
                showToast(saved.length + " kapcsolat sikeresen mentve, " + failed.length + " kapcsolat mentésekor hiba történt!", "warning", true, { delay: 4000 });
            } else {
                if (failed.length > 0) {
                    showToast(failed.length + " kapcsolat mentése sikertelen!", "danger", true, { delay: 4000 });
                }
            }
        }
    }
    if (!didPointChange && !hasUnsavedConnections) {
        showToast("A pont nem változott!", "", true, { delay: 2000 });
    }
    UI.savePointButton.disabled = false;
}

function updateMapSelectorUI() {
    UI.mapSelect.innerHTML = "";

    for (const mapObject in maps) {
        let option = document.createElement("option");
        option.value = maps[mapObject].id;
        option.text = maps[mapObject].name;
        UI.mapSelect.appendChild(option);
    }
}

function updateCoordinatesInput() {
    let coordinates = mapViewer.getMarkerPosition(editorState.activePointId);
    UI.coordinateXInput.value = coordinates.x;
    UI.coordinateYInput.value = coordinates.y;
}

function fullscreenEquirectangular() {
    equirectangularViewer.toggleFullscreen();
}

function closeCollapse() {
    UI.collapseBootstrapElement.hide();
}

function updateCollapseDirection() {
    if (window.innerWidth < 992) {
        UI.collapseElement.classList.remove("collapse-horizontal");
    } else {
        UI.collapseElement.classList.add("collapse-horizontal");
    }
}

async function updateConnectionListUI() {
    await connectionsLoadPromise;

    UI.connectionsList.innerHTML = "";

    let connections = connectionsList.filter(connection => connection.start_point_id == editorState.activePointId || connection.end_point_id == editorState.activePointId);

    for (let i = 0; i < unsavedConnections.length; i++) {
        connections.push(unsavedConnections[i]);
    }

    if (connections.length == 0) {
        UI.emptyConnections.classList.remove("d-none");
        UI.connectionsList.classList.add("d-none");
    } else {
        UI.emptyConnections.classList.add("d-none");
        UI.connectionsList.classList.remove("d-none");

        // TODO: pontoknak nev adas is itt aszerint megjelnites
        let template = document.getElementById("connection-card-template");
        let fragment = document.createDocumentFragment();
        for (let i = 0; i < connections.length; i++) {
            // deep clone true
            let clone = template.content.cloneNode(true);
            clone.querySelector(".start-id").textContent = connections[i].start_point_id;
            clone.querySelector(".end-id").textContent = connections[i].end_point_id;
            clone.querySelector(".kapcsolat-kartya").addEventListener("mouseenter", () => {
                let pos1 = mapViewer.getMarkerPosition(connections[i].start_point_id);
                let pos2 = mapViewer.getMarkerPosition(connections[i].end_point_id);
                let centerX = (pos1.x + pos2.x) / 2;
                let centerY = (pos1.y + pos2.y) / 2;
                mapViewer.changeLineType(connections[i].connection_id, "focused");
                mapViewer.moveTo(centerX, centerY);
            });
            clone.querySelector(".kapcsolat-kartya").addEventListener("mouseleave", () => {
                // temporary ids are negative, saved connections are positive
                if (connections[i].connection_id < 0) {
                    mapViewer.changeLineType(connections[i].connection_id, "unsaved");
                } else {
                    mapViewer.changeLineType(connections[i].connection_id, "editing");
                }
            });
            fragment.appendChild(clone);
        }
        UI.connectionsList.appendChild(fragment);
    }
}

// |--------------------------|
// |  SETUP & INITIALIZATION  |
// |--------------------------|

function setupCoordinateInput() {
    UI.coordinateXInput.addEventListener("focus", savePreviousValue);
    UI.coordinateYInput.addEventListener("focus", savePreviousValue);
    UI.coordinateXInput.addEventListener("change", handleCoordinateChange);
    UI.coordinateYInput.addEventListener("change", handleCoordinateChange);
}

function setupEquirectangularViewer() {
    equirectangularViewer = new EquirectangularViewer(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID);
}

function setupMapViewer() {
    mapViewer = new MapViewer(CONSTANTS.MAP_CANVAS_ID);
    mapViewer.onClickHandler = clickOnCanvas;
}

function setupFileUploadInput(buttonElement, inputElement, onFileLoaded) {
    buttonElement.addEventListener("click", () => inputElement.click());

    inputElement.addEventListener("change", (event) => {
        if (event.target.files.length > 0) {
            onFileLoaded(event.target.files[0]);
        }
        event.target.value = "";
    });
}

function setupUploadHandler(dropZoneElement, buttonElement, inputElement, onFileLoaded) {
    setupFileUploadInput(buttonElement, inputElement, onFileLoaded);

    dropZoneElement.addEventListener("dragover", (event) => {
        event.preventDefault();
        let draggedFiles = [];
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
            if (event.dataTransfer.items[i].kind == "file") {
                draggedFiles.push(event.dataTransfer.items[i]);
            }
        }

        if (draggedFiles.length > 0) {
            event.dataTransfer.dropEffect = "copy";
            dropZoneElement.classList.add("dropfocus");
        } else {
            event.dataTransfer.dropEffect = "none";
        }
    });

    dropZoneElement.addEventListener("dragleave", (event) => {
        event.preventDefault();
        dropZoneElement.classList.remove("dropfocus");
    });

    dropZoneElement.addEventListener("drop", (event) => {
        event.preventDefault();
        dropZoneElement.classList.remove("dropfocus");

        let files = event.dataTransfer.files;
        if (files.length > 0) {
            onFileLoaded(files[0]);
        }
    });
}

function getUIElements() {
    // buttons
    UI.saveButton = document.getElementById("saveButton");
    UI.uploadButtonMap = document.getElementById("uploadBtn");
    UI.plusMarkerBtn = document.getElementById("plusBtn");
    UI.uploadButtonEquirectangular = document.getElementById("uploadEquirectangularBtn");
    UI.savePointButton = document.getElementById("savePointButton");
    UI.equiFullscreenBtn = document.getElementById("equirectangularFullscreen");
    UI.closeCollapse = document.getElementById("closeCollapse");
    UI.addNewMapBtn = document.getElementById("addNewMapBtn");
    UI.newConnectionBtn = document.getElementById("kapcsolatLetrehozasaBtn");

    // inputs
    UI.fileInputMap = document.getElementById("fileInput");
    UI.fileInputEquirectangular = document.getElementById("fileInputEquirectangular");
    UI.coordinateXInput = document.getElementById("coordinateX");
    UI.coordinateYInput = document.getElementById("coordinateY");
    UI.mapSelect = document.getElementById("mapSelect");
    UI.northDirectionRange = document.getElementById("northDirectionRange");
    UI.northDirection = document.getElementById("northDirection");

    // canvas
    UI.mapCanvas = document.getElementById(CONSTANTS.MAP_CANVAS_ID);
    UI.equirectangularPreview = document.getElementById(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID);

    // drop zone
    UI.dropZoneMap = document.getElementById("drop-zone");
    UI.dropZoneEquirectangular = document.getElementById("drop-zone-equirectangular");

    // other
    UI.loadingOverlay = document.getElementById("loading");
    UI.uploadOverlay = document.getElementById("upload-overlay");
    UI.toastPlace = document.getElementById("toastPlace");
    UI.collapseElement = document.getElementById("ujPontCollapse");
    UI.mapSelector = document.getElementById("mapSelector");
    UI.floatingButtonDiv = document.getElementById("floatingButtonDiv");
    UI.connectionsList = document.getElementById("kapcsolatokLista");
    UI.emptyConnections = document.getElementById("nincsenekKapcsolatok");
    UI.collapseBootstrapElement = new bootstrap.Collapse(
        UI.collapseElement,
        {
            toggle: false
        }
    );
}

function addUIEventListeners() {
    UI.mapSelect.addEventListener("change", (event) => {
        switchMap(parseInt(event.target.value));
    });

    UI.addNewMapBtn.addEventListener("click", () => {
        UI.fileInputMap.value = "";
        UI.fileInputMap.click();
    });

    UI.collapseElement.addEventListener("show.bs.collapse", (event) => {
        if (event.target == UI.collapseElement) {
            UI.floatingButtonDiv.classList.add("d-none");
            if (editorState.activePointId == CONSTANTS.TEMP_ID) {
                UI.northDirectionRange.value = 0;
                UI.northDirection.value = 0;
            }
        }
    });

    UI.collapseElement.addEventListener("hide.bs.collapse", (event) => {
        if (event.target == UI.collapseElement) {
            stopFOVSync();

            if (editorState.equiAbortController) {
                editorState.equiAbortController.abort();
                editorState.equiAbortController = null;
            }

            if (editorState.activePointId != null) {
                if (editorState.activePointId == CONSTANTS.TEMP_ID) {
                    // it was temporary marker remove it
                    mapViewer.removeMarker(CONSTANTS.TEMP_ID);
                } else {
                    if (pointsCache[editorState.activePointId]) {
                        // it was discarded revert to old data
                        let originalPoint = pointsCache[editorState.activePointId];
                        mapViewer.moveMarkerToImageCoordinates(
                            editorState.activePointId,
                            originalPoint.point_x,
                            originalPoint.point_y
                        );
                        mapViewer.changeMarkerType(editorState.activePointId, "READY");
                    }
                }
            }

            // remove temporary connections
            for (let i = 0; i < unsavedConnections.length; i++) {
                if (mapViewer.doesLineExist(unsavedConnections[i].connection_id)) {
                    mapViewer.removeLine(unsavedConnections[i].connection_id);
                }
            }
            temporaryConnectionID = -1;
            unsavedConnections = [];
            UI.savePointButton.disabled = true;
            cancelConnection();
            mapViewer.canvasInput.setDefaultCursor("default");
            editorState.activePointId = null;
            renderConnectionsForActiveMap();
        }
    });

    UI.collapseElement.addEventListener("hidden.bs.collapse", (event) => {
        if (event.target == UI.collapseElement) {
            if (equirectangularViewer) {
                equirectangularViewer.setYaw(0);
                equirectangularViewer.setZoom(0.05);
                equirectangularViewer.clearImage();
            }

            // reset UI
            UI.floatingButtonDiv.classList.remove("d-none");

            // reset state
            editorState.activePointId = null;
            editorState.isPlacingMarker = false;
            editorState.pendingEquirectangularFile = null;
        }
    });

    UI.plusMarkerBtn.addEventListener("click", () => {
        if (activeMapId != CONSTANTS.TEMP_ID) {
            UI.floatingButtonDiv.classList.add("d-none");
            mapViewer.canvasInput.setDefaultCursor("crosshair");

            editorState.activePointId = CONSTANTS.TEMP_ID;

            editorState.clickOnMapToast = showToast(
                "Kattints a térképre a jelölő elhelyezéséhez!",
                "",
                true,
                { autohide: false },
                ICONS.POINTING_HAND,
                () => {
                    // if temporary marker was not placed then it was cancelled => reset state
                    if (!mapViewer.doesMarkerExist(CONSTANTS.TEMP_ID)) {
                        editorState.activePointId = null;
                        editorState.isPlacingMarker = false;
                        mapViewer.canvasInput.setDefaultCursor("default");
                        UI.floatingButtonDiv.classList.remove("d-none");
                    }
                }
            );
            editorState.isPlacingMarker = true;
        } else {
            showToast("Először mentsd el a térképet!", "danger", true, { delay: 3000 });
        }
    });

    UI.northDirectionRange.addEventListener("input", (e) => {
        UI.northDirection.value = e.target.value;
        updateFOVSync();
    });

    UI.northDirection.addEventListener("focus", savePreviousValue);
    UI.northDirection.addEventListener("change", (event) => {
        let degree = event.target.valueAsNumber;
        if (0 <= degree && degree <= 359) {
            event.target.dataset.previousValue = event.target.valueAsNumber;
            UI.northDirectionRange.value = degree;
            updateFOVSync();
        } else {
            event.target.value = event.target.dataset.previousValue;
            showToast("A szögnek 0 és 359 között kell lennie!", "danger", false, { delay: 3000 });
        }
    });

    UI.equiFullscreenBtn.addEventListener("click", fullscreenEquirectangular);
    UI.saveButton.addEventListener("click", saveMap);
    UI.savePointButton.addEventListener("click", savePointClick);
    UI.closeCollapse.addEventListener("click", closeCollapse);
    window.addEventListener("resize", updateCollapseDirection);

    UI.newConnectionBtn.addEventListener("click", () => {
        if (editorState.activePointId != CONSTANTS.TEMP_ID) {
            if (!editorState.isConnectingMarkers) {
                editorState.isConnectingMarkers = true;
                mapViewer.canvasInput.setDefaultCursor("crosshair");
                editorState.connectionToast = showToast(
                    "Kattints a végpontra!",
                    "",
                    true,
                    { autohide: false },
                    "",
                    () => {
                        cancelConnection();
                    });
            }
            UI.newConnectionBtn.disabled = true;
        } else {
            showToast("Először mentsd el a pontot!", "danger", true, { delay: 3000 });
        }
    });

    window.addEventListener("keyup", (event) => {
        if (event.key == "Escape") {
            if (UI.collapseBootstrapElement) {
                UI.collapseBootstrapElement.hide();
            }
        }
    });
}

function setupUIElements() {
    getUIElements();
    updateCollapseDirection();
    addUIEventListeners();
}

function processMapList(mapList) {
    maps = {};

    for (let i = 0; i < mapList.length; i++) {
        const element = mapList[i];
        maps[element.map_id] = {
            id: element.map_id,
            name: element.title,
        };
    }

    updateMapSelectorUI();
}

function startFOVSync() {
    stopFOVSync();

    let pos = mapViewer.getMarkerPosition(editorState.activePointId);

    mapViewer.placeMarkerByImageCoordinates(CONSTANTS.FOV_MARKER_ID, pos.x, pos.y, CONSTANTS.CONE_SIZE.width, CONSTANTS.CONE_SIZE.height, "fov_cone");
    mapViewer.setMarkerSelectable(CONSTANTS.FOV_MARKER_ID, false);

    editorState.fovSyncAnimationID = requestAnimationFrame(updateFOVSyncLoop);
}

function updateFOVSync() {
    if (editorState.activePointId && equirectangularViewer) {
        let viewYaw = -equirectangularViewer.getYaw();

        let northDirection = 0.0;
        if (UI.northDirection && UI.northDirection.valueAsNumber) {
            northDirection = UI.northDirection.valueAsNumber;
        }
        let northDirectionRadian = degreeToRadian(northDirection);

        let finalYaw = viewYaw + northDirectionRadian;

        mapViewer.rotateMarker(CONSTANTS.FOV_MARKER_ID, finalYaw);
    };
}

function updateFOVSyncLoop() {
    updateFOVSync();
    editorState.fovSyncAnimationID = requestAnimationFrame(updateFOVSyncLoop);
}

function stopFOVSync() {
    if (editorState.fovSyncAnimationID) {
        cancelAnimationFrame(editorState.fovSyncAnimationID);
    }
    if (mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
        mapViewer.removeMarker(CONSTANTS.FOV_MARKER_ID);
    }
}

async function init() {
    gameMapID = getGameMapIdFromUrl();
    setupUIElements();

    // setup
    setupMapViewer();
    setupEquirectangularViewer();
    setupCoordinateInput();

    setupUploadHandler(UI.dropZoneMap, UI.uploadButtonMap, UI.fileInputMap, handleMapLoad);
    setupUploadHandler(UI.dropZoneEquirectangular, UI.uploadButtonEquirectangular, UI.fileInputEquirectangular, handleEquirectangularLoad);

    connectionsLoadPromise = loadConnections();

    let mapList = await loadMapList();
    let hasMaps = mapList.length > 0;
    setEditorState(hasMaps);
    if (hasMaps) {
        await mapViewer.ready();
        processMapList(mapList);

        let firstMapId = mapList[0].map_id;
        switchMap(firstMapId);
    }
    UI.loadingOverlay.classList.add("d-none");
}

document.addEventListener("DOMContentLoaded", init);

// TODO: látótér állandó méretű (állítható méretű?)
// TODO: új markernél elsőre nincs helyesen rajta a markeren a fov cone
// TODO: race condition miközben menti a pontot rányomni egy másik gombra? talán akkor editorState.isPlacingMarker hamis addig és megnyit egy másik létező gombot?
// TODO: térképek, pontok és kapcsolatok törlése
// TODO: biztos hogy elakarod vetni a változtatásokat ha a user bezárja a collapset vagy elakarod menteni a változtatásokat egy modalban?
/* TODO: ha a collapse bezáródása közben nyomunk rá a markerre akkor
MapViewer.js:358 Uncaught WebassemblyError: Invalid marker ID
    at MapViewer.doesMarkerExist (MapViewer.js:358:19)
    at placeOrMoveMarker (map-creator.js:664:19)
    at MapViewer.clickOnCanvas [as onClickHandler] (map-creator.js:712:13)
    at CanvasInput.onClick (MapViewer.js:758:22)
    at #pointerUp (CanvasInput.js:287:30)
    at #pointerUpListener (CanvasInput.js:220:57) */