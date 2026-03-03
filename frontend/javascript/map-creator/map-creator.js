import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";
import { CONSTANTS } from "./constants.js";
import { appState } from "./state.js";
import { getGameMapIdFromUrl } from "./utils.js";
import { eventBus, EVENTS } from './events/EventBus.js';
import { MarkerManager } from "./managers/MarkerManager.js";
import { MapManager } from "./managers/MapManager.js";
import { UIManager } from "./managers/UIManager.js";
import { EquirectangularManager } from "./managers/EquirectangularManager.js";
import { ConnectionManager } from "./managers/ConnectionManager.js";

async function init() {

    // setup
    const mapViewer = new MapViewer(CONSTANTS.MAP_CANVAS_ID);
    const equirectangularViewer = new EquirectangularViewer(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID);

    new UIManager(eventBus);
    new MarkerManager(eventBus, mapViewer, appState);
    new MapManager(eventBus, mapViewer, appState);
    new EquirectangularManager(eventBus, equirectangularViewer, mapViewer, appState);
    new ConnectionManager(eventBus, mapViewer, appState);

    appState.gameMapID = getGameMapIdFromUrl();

    eventBus.emit(EVENTS.APP_INIT);
}

document.addEventListener("DOMContentLoaded", init);

// TODO: látótér állandó méretű (állítható méretű?)
// TODO: új markernél elsőre nincs helyesen rajta a markeren a fov cone
// TODO: pontok, kapcsolatok, térképek törlése
// TODO: térkép, pontok átnevezése
// TODO: térkép képének cseréje mentés után
// TODO: biztos hogy elakarod vetni a változtatásokat ha a user bezárja a collapset vagy elakarod menteni a változtatásokat egy modalban?
// TODO: mapok közti kapcsolatok
// TODO: "hidden.bs.collapse" és "hide.bs.collapse" események kezelése majd a ConnectionManagerben és EquirectangularManagerben
// TODO: markerek fixálása pixel koordinátákra? mindig egy adott pixelen legyenek?
// TODO: maradék az átdolgozásból
// 1. ConnectionManager kapcsolatok mentése