import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";
import { CONSTANTS, ICONS } from "./constants.js";
import { appState, editorState, uiState } from "./state.js";
import { fetchConnections, savePoint as savePointApi, saveUnsavedConnections as saveUnsavedConnectionsApi } from "./api.js";
import { createSvgIcon, createSpinnerIcon, showToast, getGameMapIdFromUrl } from "./utils.js";
import { UI, getUIElements, updateConnectionListUI } from "./ui.js";
import { eventBus, EVENTS } from './events/EventBus.js';
import { MarkerManager } from "./managers/MarkerManager.js";
import { MapManager } from "./managers/MapManager.js";
import { UIManager } from "./managers/UIManager.js";
import { EquirectangularManager } from "./managers/EquirectangularManager.js";

// |-------------|
// | API & STATE |
// |-------------|

async function savePoint() {
    editorState.isSaving.point = true;
    let pointToSaveId = editorState.activePointId;
    let loadingIcon = createSpinnerIcon();
    let pontMentesToast = showToast(UI.toastPlace, "Pont mentése", "", false, { autohide: false }, loadingIcon);
    try {
        let position = appState.mapViewer.getMarkerPosition(pointToSaveId);
        let isNewPoint = pointToSaveId == CONSTANTS.TEMP_ID;

        if (isNewPoint) {
            if (!editorState.pendingFiles.equirectangular) {
                throw new Error("Nincs kép kiválasztva!");
            }
            if (appState.activeMapId == CONSTANTS.TEMP_ID) {
                throw new Error("Először mentsd el a térképet!");
            }
        }

        let data = await savePointApi({
            pointId: pointToSaveId,
            position: position,
            northDirection: UI.northDirection.valueAsNumber,
            equirectangularFile: editorState.pendingFiles.equirectangular,
            gameMapID: appState.gameMapID,
            mapID: appState.activeMapId,
            isNew: isNewPoint
        });

        pontMentesToast.hide();
        if (data.success) {
            let saveIcon = createSvgIcon(ICONS.SAVE_FLOPPY, "1em");
            showToast(UI.toastPlace, "Pont sikeresen mentve!", "success", true, { delay: 3000 }, saveIcon);
            if (isNewPoint) {
                appState.mapViewer.changeMarkerId(editorState.activePointId, data.pointId);
                editorState.activePointId = data.pointId;
                appState.mapViewer.changeMarkerType(editorState.activePointId, "EDIT");
                pointToSaveId = data.pointId;
            }
            if (!appState.pointsCache[pointToSaveId]) {
                appState.pointsCache[pointToSaveId] = {
                    point_id: pointToSaveId
                };
            }
            UI.newConnectionBtn.disabled = Object.keys(appState.pointsCache).length < 2;
            appState.pointsCache[pointToSaveId].point_x = position.x;
            appState.pointsCache[pointToSaveId].point_y = position.y;
            appState.pointsCache[pointToSaveId].north_direction = UI.northDirection.valueAsNumber;
        }
    } catch (error) {
        pontMentesToast.hide();
        console.error(error.message);
        console.error(error);
        showToast(UI.toastPlace, error.message, "danger", true, { delay: 3000 });
    } finally {
        editorState.isSaving.point = false;
    }
}

async function saveUnsavedConnections() {
    editorState.isSaving.connections = true;
    let saved = [];
    let failed = [];
    if (editorState.unsavedConnections.length != 0) {
        let loadingIcon = createSpinnerIcon();
        let kapcsolatMentesToast = showToast(UI.toastPlace, "Kapcsolatok mentése", "", false, { autohide: false }, loadingIcon);

        try {
            let result = await saveUnsavedConnectionsApi(appState.gameMapID, editorState.unsavedConnections);

            saved = result.saved;
            failed = result.failed;

            for (let i = 0; i < saved.length; i++) {
                appState.connectionsList.push(saved[i]);

                // remove the successfully saved connection from unsavedConnections
                let index = 0;
                while (
                    index < editorState.unsavedConnections.length &&
                    !(editorState.unsavedConnections[index].start_point_id == saved[i].start_point_id &&
                        editorState.unsavedConnections[index].end_point_id == saved[i].end_point_id)
                ) {
                    index++;
                }
                if (index < editorState.unsavedConnections.length) {
                    editorState.unsavedConnections.splice(index, 1);
                }
            }

            renderConnectionsForActiveMap();
            await updateConnectionListUI();
        } finally {
            kapcsolatMentesToast.hide();
        }
    }
    editorState.isSaving.connections = false;
    return {
        saved: saved,
        failed: failed
    };
}

function cancelConnection() {
    if (editorState.isConnectingMarkers) {
        editorState.isConnectingMarkers = false;
        if (uiState.toasts.connection) {
            uiState.toasts.connection.hide();
            uiState.toasts.connection = null;
        }
        UI.newConnectionBtn.disabled = false;
        appState.mapViewer.canvasInput.setDefaultCursor("default");
    }
}

async function loadConnections() {
    let loadingIcon = createSpinnerIcon();
    let kapcsolatokBetolteseToast = showToast(UI.toastPlace, "Kapcsolatok betöltése", "", false, { autohide: false }, loadingIcon);
    try {
        let connections = await fetchConnections(appState.gameMapID);
        appState.connectionsList = connections;
        updateConnectionListUI();
        showToast(UI.toastPlace, "Kapcsolatok sikeresen betöltve!", "success", true, { delay: 3000 });
    } catch (error) {
        console.error(error);
        showToast(UI.toastPlace, "Hiba a kapcsolatok betöltésekor!", "danger", true, { delay: 3000 });
    } finally {
        kapcsolatokBetolteseToast.hide();
    }
}


// |----|
// | UI |
// |----|

function renderConnectionsForActiveMap() {
    appState.mapViewer.clearLines();
    let connectionsForActiveMap = appState.connectionsList.filter(connection => appState.pointsCache[connection.start_point_id] && appState.pointsCache[connection.end_point_id]);
    for (let i = 0; i < connectionsForActiveMap.length; i++) {
        let type = "default";
        if (editorState.activePointId == connectionsForActiveMap[i].start_point_id || editorState.activePointId == connectionsForActiveMap[i].end_point_id) {
            type = "editing";
        }
        appState.mapViewer.connectMarkers(connectionsForActiveMap[i].start_point_id, connectionsForActiveMap[i].end_point_id, connectionsForActiveMap[i].connection_id, type);
    }
    for (let i = 0; i < editorState.unsavedConnections.length; i++) {
        appState.mapViewer.connectMarkers(editorState.unsavedConnections[i].start_point_id, editorState.unsavedConnections[i].end_point_id, editorState.unsavedConnections[i].connection_id, "unsaved");
    }
}

async function savePointClick() {
    let position = appState.mapViewer.getMarkerPosition(editorState.activePointId);
    let northDirection = UI.northDirection.valueAsNumber;
    let hasUnsavedConnections = editorState.unsavedConnections.length > 0;
    let didPointChange = !appState.pointsCache[editorState.activePointId] ||
        position.x != appState.pointsCache[editorState.activePointId].point_x ||
        position.y != appState.pointsCache[editorState.activePointId].point_y ||
        northDirection != appState.pointsCache[editorState.activePointId].north_direction ||
        editorState.pendingFiles.equirectangular;

    UI.savePointButton.disabled = true;
    if (didPointChange) {
        await savePoint();
    }
    // connections can only be made on saved points
    if (hasUnsavedConnections && editorState.activePointId != CONSTANTS.TEMP_ID) {
        let result = await saveUnsavedConnections();
        let saved = result.saved;
        let failed = result.failed;

        if (saved.length > 0 && failed.length == 0) {
            let saveIcon = createSvgIcon(ICONS.SAVE_FLOPPY, "1em");
            showToast(UI.toastPlace, saved.length + " kapcsolat sikeresen mentve!", "success", true, { delay: 3000 }, saveIcon);
        } else {
            if (saved.length > 0 && failed.length > 0) {
                showToast(UI.toastPlace, saved.length + " kapcsolat sikeresen mentve, " + failed.length + " kapcsolat mentésekor hiba történt!", "warning", true, { delay: 4000 });
            } else {
                if (failed.length > 0) {
                    showToast(UI.toastPlace, failed.length + " kapcsolat mentése sikertelen!", "danger", true, { delay: 4000 });
                }
            }
        }
    }
    if (!didPointChange && !hasUnsavedConnections) {
        showToast(UI.toastPlace, "A pont nem változott!", "", true, { delay: 2000 });
    }
    UI.savePointButton.disabled = false;
}
// |--------------------------|
// |  SETUP & INITIALIZATION  |
// |--------------------------|

function addUIEventListeners() {
    UI.savePointButton.addEventListener("click", savePointClick);

    UI.newConnectionBtn.addEventListener("click", () => {
        if (editorState.activePointId != CONSTANTS.TEMP_ID) {
            if (!editorState.isConnectingMarkers) {
                editorState.isConnectingMarkers = true;
                appState.mapViewer.canvasInput.setDefaultCursor("crosshair");
                uiState.toasts.connection = showToast(UI.toastPlace,
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
            showToast(UI.toastPlace, "Először mentsd el a pontot!", "danger", true, { delay: 3000 });
        }
    });
}

function setupUIElements() {
    getUIElements();
    addUIEventListeners();
}


async function init() {
    appState.gameMapID = getGameMapIdFromUrl();
    setupUIElements();

    // setup
    appState.mapViewer = new MapViewer(CONSTANTS.MAP_CANVAS_ID);
    appState.equirectangularViewer = new EquirectangularViewer(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID);

    new UIManager(eventBus);
    new MarkerManager(eventBus, appState.mapViewer, appState);
    new MapManager(eventBus, appState.mapViewer, appState);
    new EquirectangularManager(eventBus, appState.equirectangularViewer, appState.mapViewer, appState);

    eventBus.emit(EVENTS.APP_INIT);

    appState.connectionsLoadPromise = loadConnections();

    // temporary solutions until managers are complete
    eventBus.on(EVENTS.POINTS_LOADED, (points) => {
        UI.newConnectionBtn.disabled = points.length < 2;

        updateConnectionListUI();
    })
}

document.addEventListener("DOMContentLoaded", init);

// TODO: látótér állandó méretű (állítható méretű?)
// TODO: új markernél elsőre nincs helyesen rajta a markeren a fov cone
// TODO: pontok, kapcsolatok, térképek törlése
// TODO: térkép, pontok átnevezése
// TODO: térkép képének cseréje mentés után
// TODO: biztos hogy elakarod vetni a változtatásokat ha a user bezárja a collapset vagy elakarod menteni a változtatásokat egy modalban?
// TODO: fájl további szétbontása pointManager, mapManager, connectionManager
// TODO: mapok közti kapcsolatok
// TODO: "hidden.bs.collapse" és "hide.bs.collapse" események kezelése majd a ConnectionManagerben és EquirectangularManagerben
// TODO: UI_ADD_NEW_MAP_REQUEST, MAP_SWITCH_REQUESTED és "hide.bs.collapse" preventDefault ConnectionManagerben ha a mentés folyamatban van
// TODO: markerek fixálása pixel koordinátákra? mindig egy adott pixelen legyenek?
// TODO: maradék az átdolgozásból
// 1. MarkerManagerben pont mentésének elkészítése
// 2. ConnectionManager elkészítése, kapcsolatok betöltése, megjelenítése a térképen, kapcsolatok mentése