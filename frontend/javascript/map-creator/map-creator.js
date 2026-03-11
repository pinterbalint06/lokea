import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";
import { CONSTANTS } from "./shared/constants.js";
import { appState } from "./shared/state.js";
import { getGameMapIdFromUrl } from "./shared/utils.js";
import { eventBus, EVENTS } from './events/EventBus.js';
import { MarkerManager } from "./managers/MarkerManager.js";
import { MapManager } from "./managers/MapManager.js";
import { UIManager } from "./managers/UIManager.js";
import { EquirectangularManager } from "./managers/EquirectangularManager.js";
import { ConnectionManager } from "./managers/ConnectionManager.js";

async function init() {
    const mapViewer = new MapViewer(CONSTANTS.MAP_CANVAS_ID);
    const equirectangularViewer = new EquirectangularViewer(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID);

    await mapViewer.ready();
    await equirectangularViewer.ready();

    new UIManager(eventBus);
    new MarkerManager(eventBus, mapViewer, appState);
    new MapManager(eventBus, mapViewer, appState);
    new EquirectangularManager(eventBus, equirectangularViewer, mapViewer, appState);
    new ConnectionManager(eventBus, mapViewer, appState);

    appState.gameMapID = getGameMapIdFromUrl();

    eventBus.emit(EVENTS.APP_INIT);
}

document.addEventListener("DOMContentLoaded", init);

// TODOp!: látótérhez svg renderelés
// TODOp!!: új markernél elsőre nincs helyesen rajta a markeren a fov cone
// TODOp!!: térkép képének cseréje mentés után
// TODOp!!: mapok közti kapcsolatok
// TODOp!!: markerek fixálása pixel koordinátákra? mindig egy adott pixelen legyenek?
// TODOp!!!!!: markerek első mentésénél többször meg lehet nyomni a mentés gombot és akkor több marker jön létre ugyanazzal a pozícióval
// TODOp!: UIManager kezd nagy lenni lehet szét kéne szedni több kisebbre (pl. MapListManager, MapEditManager, btn to holdos cucc, meg tobi)