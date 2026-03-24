import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";
import { CONSTANTS } from "./shared/constants.js";
import { appState } from "./shared/state.js";
import { getGameMapIdFromUrl } from "./shared/utils.js";
import { eventBus, EVENTS } from './events/EventBus.js';
import { MarkerManager } from "./managers/MarkerManager.js";
import { MapManager } from "./managers/MapManager.js";
import { MapSelectorManager } from "./managers/ui/MapSelectorManager.js";
import { ModalManager } from "./managers/ui/ModalManager.js";
import { ConnectionListManager } from "./managers/ui/ConnectionListManager.js";
import { LoadingOverlayManager } from "./managers/ui/LoadingOverlayManager.js";
import { MarkerEditorManager } from "./managers/ui/MarkerEditorManager.js";
import { ToolbarManager } from "./managers/ui/ToolbarManager.js";
import { ToastManager } from "./managers/ui/ToastManager.js";
import { SettingsManager } from "./managers/ui/SettingsManager.js";
import { EquirectangularManager } from "./managers/EquirectangularManager.js";
import { ConnectionManager } from "./managers/ConnectionManager.js";

async function init() {
    const mapViewer = new MapViewer(CONSTANTS.MAP_CANVAS_ID);
    const equirectangularViewer = new EquirectangularViewer(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID);

    let markersCached = mapViewer.cacheMarkers();
    await mapViewer.ready();
    await equirectangularViewer.ready();

    new LoadingOverlayManager(eventBus);
    new MarkerEditorManager(eventBus);
    new ToolbarManager(eventBus);
    new ToastManager(eventBus);
    new SettingsManager(eventBus);
    new ModalManager(eventBus);
    new MapSelectorManager(eventBus);
    new ConnectionListManager(eventBus);

    new MarkerManager(eventBus, mapViewer, appState);
    new MapManager(eventBus, mapViewer, appState);
    new EquirectangularManager(eventBus, equirectangularViewer, mapViewer, appState);
    new ConnectionManager(eventBus, mapViewer, appState);

    appState.gameMapID = getGameMapIdFromUrl();

    await markersCached;
    eventBus.emit(EVENTS.APP_INIT);
}

document.addEventListener("DOMContentLoaded", init);

// TODOp!: látótérhez svg renderelés