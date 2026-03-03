import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";
import { CONSTANTS, ICONS } from "./constants.js";
import { appState, editorState, uiState } from "./state.js";
import { saveUnsavedConnections as saveUnsavedConnectionsApi } from "./api.js";
import { createSpinnerIcon, showToast, getGameMapIdFromUrl } from "./utils.js";
import { UI, getUIElements, updateConnectionListUI } from "./ui.js";
import { eventBus, EVENTS } from './events/EventBus.js';
import { MarkerManager } from "./managers/MarkerManager.js";
import { MapManager } from "./managers/MapManager.js";
import { UIManager } from "./managers/UIManager.js";
import { EquirectangularManager } from "./managers/EquirectangularManager.js";
import { ConnectionManager } from "./managers/ConnectionManager.js";

// |-------------|
// | API & STATE |
// |-------------|

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
        // UI.newConnectionBtn.disabled = false;
        appState.mapViewer.canvasInput.setDefaultCursor("default");
    }
}

// |----|
// | UI |
// |----|

// if (result.savedConnections > 0 && result.failedConnections == 0) {
//     this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${result.savedConnections} kapcsolat sikeresen mentve!`, type: "success", iconObject: ICONS.SAVE_FLOPPY, duration: 5000 });
// } else {
//     if (result.savedConnections > 0 && result.failedConnections > 0) {
//         this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${result.savedConnections} kapcsolat sikeresen mentve, ${result.failedConnections} kapcsolat mentésekor hiba történt!`, type: "danger", iconObject: ICONS.SAVE_FLOPPY, duration: 5000 });
//     } else {
//         if (result.failedConnections > 0) {
//             this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${result.failedConnections} kapcsolat mentése sikertelen!`, type: "danger", iconObject: ICONS.SAVE_FLOPPY, duration: 5000 });
//         }
//     }
// }
// |--------------------------|
// |  SETUP & INITIALIZATION  |
// |--------------------------|

function addUIEventListeners() {
    // UI.savePointButton.addEventListener("click", savePointClick);

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
    new ConnectionManager(eventBus, appState.mapViewer, appState);

    eventBus.emit(EVENTS.APP_INIT);

    // temporary solutions until managers are complete
    eventBus.on(EVENTS.POINTS_LOADED, (points) => {
        // UI.newConnectionBtn.disabled = points.length < 2;

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
// TODO: markerek fixálása pixel koordinátákra? mindig egy adott pixelen legyenek?
// TODO: maradék az átdolgozásból
// 1. MarkerManagerben pont mentésének elkészítése
// 2. ConnectionManager elkészítése, kapcsolatok betöltése, megjelenítése a térképen, kapcsolatok mentése