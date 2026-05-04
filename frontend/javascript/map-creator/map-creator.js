import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";
import { CONSTANTS } from "./shared/constants.js";
import { AppStore } from "./shared/AppStore.js";
import { getGameMapIdFromUrl } from "./shared/utils.js";
import { EventBus, EVENTS } from "./shared/EventBus.js";
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
import { ArrowManager } from "./managers/ArrowManager.js";
import { BreakpointManager } from "./managers/ui/BreakpointManager.js";
import { translatePage, nyelvSzinkronizalas } from "../libs/i18next/translation.js";
import i18next from "../libs/language/i18next.js";

async function init() {
    try {
        await nyelvSzinkronizalas() || 'hu';
        translatePage();
        console.log("")
    } catch (error) {
        console.error(i18next.t("game-maps:choosing.errors.languageLoad", { defaultValue: "Hiba a nyelvi adatok betöltésekor:" }), error);
    }
    const mapViewer = new MapViewer(CONSTANTS.MAP_CANVAS_ID);
    const equirectangularViewer = new EquirectangularViewer(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID);

    let markersCached = mapViewer.cacheMarkers();
    await mapViewer.ready();
    await equirectangularViewer.ready();

    const eventBus = new EventBus();

    const gameMapID = getGameMapIdFromUrl();
    const appStore = new AppStore(eventBus, gameMapID);

    new BreakpointManager(eventBus, appStore);
    new LoadingOverlayManager(eventBus);
    new ToastManager(eventBus);
    new ConnectionListManager(eventBus, appStore);

    new MarkerEditorManager(eventBus, appStore);
    new ToolbarManager(eventBus, appStore);
    new SettingsManager(eventBus, appStore);
    new ModalManager(eventBus, appStore);
    new MapSelectorManager(eventBus, appStore);

    new MarkerManager(eventBus, mapViewer, appStore);
    new MapManager(eventBus, mapViewer, appStore);
    new EquirectangularManager(eventBus, equirectangularViewer, mapViewer, appStore);
    new ConnectionManager(eventBus, mapViewer, appStore);
    new ArrowManager(eventBus, mapViewer, equirectangularViewer, appStore);

    await markersCached;
    eventBus.emit(EVENTS.APP_INIT);
}

document.addEventListener("DOMContentLoaded", init);
