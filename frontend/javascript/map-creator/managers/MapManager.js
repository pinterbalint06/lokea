import { EVENTS } from "../events/EventBus.js";
import { CONSTANTS, ICONS } from "../constants.js";
import { fetchMapList, saveNewMap, fetchImage } from "../api.js";

export class MapManager {
    constructor(eventBus, mapViewer, appState) {
        this.bus = eventBus;
        this.viewer = mapViewer;
        this.appState = appState; // gameMapId, activeMapId, isSaving

        this.maps = {};
        this.pendingMapFile = null;

        this.#bindBusEvents();
        this.#setupViewerClicks();
    }

    #setupViewerClicks() {
        this.viewer.onClickHandler = (cursorX, cursorY) => {
            let clickedMarkerId = this.viewer.getMarkerAtClick(cursorX, cursorY);
            if (clickedMarkerId != -1) {
                this.bus.emit(EVENTS.MARKER_CLICKED, { id: clickedMarkerId, x: cursorX, y: cursorY });
            } else {
                this.bus.emit(EVENTS.MAP_CLICKED, { x: cursorX, y: cursorY });
            }
        };
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.APP_INIT, async () => {
            this.maps = await this.#loadMaps();
            this.bus.emit(EVENTS.MAPS_LOADED, { maps: this.maps });
            let mapIds = Object.keys(this.maps);
            let hasMaps = mapIds.length > 0;
            if (hasMaps) {
                await this.viewer.ready();
                this.switchMap(mapIds[0]);
            }
        });

        this.bus.on(EVENTS.UI_SWITCH_MAP_REQUEST, ({ mapId }) => this.switchMap(mapId));
    }

    async #loadMaps() {
        let maps = {};
        try {
            let mapList = await fetchMapList(this.appState.gameMapID);
            maps = this.#processMapList(mapList);
        } catch (error) {
            console.error(error);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Nem sikerült betölteni a térképeket.", type: "danger" });
        }
        return maps;
    }

    #processMapList(mapList) {
        let maps = {};

        for (let i = 0; i < mapList.length; i++) {
            const element = mapList[i];
            maps[element.map_id] = {
                id: element.map_id,
                name: element.title,
            };
        }

        return maps;
    }

    async switchMap(mapId) {
        let request = { canProceed: true, reason: "" };
        this.bus.emit(EVENTS.MAP_SWITCH_REQUESTED, request);
        if (request.canProceed) {
            if (!this.appState.isSaving) {
                if (this.maps[mapId]) {
                    // TODO: cancelConnection(); was done in switchMap not yet rewroekd
                    this.appState.activeMapId = mapId;
                    let mapData = this.maps[mapId];

                    this.bus.emit(EVENTS.MAP_SWITCHED, { mapId });
                    this.bus.emit(EVENTS.TOAST_SHOW, { id: "mapSwitching", msg: "Váltás: " + mapData.name, closable: false, autohide: false });

                    if (mapId == CONSTANTS.TEMP_ID) {
                        this.viewer.clearMarkersAndLines();
                        await this.viewer.loadMap(mapData.temporaryURL, mapData.imgWidth, mapData.imgHeight);
                        // show change toast for 1 sec after the map was loaded then hide it
                        setTimeout(() => this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "mapSwitching" }), 1000);
                    } else {
                        try {
                            let imgData = await fetchImage(mapId);
                            if (mapId == this.appState.activeMapId) {
                                this.viewer.clearMarkersAndLines();
                                this.viewer.loadMap(imgData.url, imgData.width, imgData.height);

                                this.bus.emit(EVENTS.MAP_LOADED, { mapId });
                            }

                            // show change toast for 1 sec after the map was loaded then hide it
                            setTimeout(() => this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "mapSwitching" }), 1000);
                        } catch (e) {
                            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "mapSwitching" });
                            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a kép betöltésekor!", type: "danger" });
                        }
                    }
                }
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Térkép mentése folyamatban, kérlek várj!", type: "danger" });
            }
        } else {
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
        }

    }
}