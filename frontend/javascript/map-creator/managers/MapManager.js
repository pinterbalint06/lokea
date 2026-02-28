import { EVENTS } from "../events/EventBus.js";
import { CONSTANTS, ICONS } from "../constants.js";
import { fetchMapList, saveNewMap, fetchImage } from "../api.js";
import { processUploadedImageFile } from "../utils.js";

export class MapManager {
    constructor(eventBus, mapViewer, appState) {
        this.bus = eventBus;
        this.viewer = mapViewer;
        this.appState = appState; // gameMapId, activeMapId
        this.isSaving = false;

        this.maps = {};
        this.pendingMapFile = null;
        this.pendingMapFileMapId = null;

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
            this.bus.emit(EVENTS.HIDE_LOADING);
        });

        this.bus.on(EVENTS.UI_ADD_NEW_MAP_REQUEST, (request) => {
            if (this.isSaving) {
                request.canProceed = false;
                request.reason = "Térkép mentése folyamatban, kérlek várj!";
            }
        });

        this.bus.on(EVENTS.UI_SWITCH_MAP_REQUEST, ({ mapId }) => this.switchMap(mapId));
        this.bus.on(EVENTS.UI_MAP_FILE_DROPPED, ({ file }) => this.#handleMapLoad(file));
        this.bus.on(EVENTS.UI_SAVE_MAP_CLICKED, () => this.#saveMap());
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

    async #saveMap() {
        this.isSaving = true;
        this.bus.emit(EVENTS.TOAST_SHOW, { id: "savingMap", msg: "Térkép mentése folyamatban...", closable: false, autohide: false, spinner: true });
        try {
            let oldId = this.appState.activeMapId;
            let currentMap = this.maps[oldId];

            if (!this.pendingMapFile || !currentMap) {
                throw new Error("A térkép kép még nincs kiválasztva!");
            }

            this.bus.emit(EVENTS.MAP_SAVE_STARTED);
            let result = await saveNewMap(this.pendingMapFile, this.appState.gameMapID, currentMap.name);
            let newId = result.mapId;

            currentMap.id = newId;
            this.maps[newId] = currentMap;

            if (currentMap.temporaryURL) {
                URL.revokeObjectURL(currentMap.temporaryURL);
                delete currentMap.temporaryURL;
            }

            delete this.maps[oldId];

            if (this.appState.activeMapId == oldId) {
                this.appState.activeMapId = newId;
            }

            this.pendingMapFile = null;
            this.pendingMapFileMapId = null;
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "savingMap" });
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Térkép sikeresen mentve!", type: "success", iconObject: ICONS.SAVE_FLOPPY });
            this.bus.emit(EVENTS.MAP_SAVE_SUCCEEDED, { oldMapId: oldId, newMapId: newId });
        } catch (error) {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "savingMap" });
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: error.message, type: "danger" });
            this.bus.emit(EVENTS.MAP_SAVE_FAILED, { error });
        } finally {
            // if save successful it this will emit not saveable because pendingMapFile is set to null
            // if failed it will emit saveable because pendingMapFile is still set
            this.#emitSaveAvailabilityChanged();
            this.isSaving = false;
        }
    }

    async #handleMapLoad(file) {
        let imgData;
        this.pendingMapFile = file;
        this.pendingMapFileMapId = CONSTANTS.TEMP_ID;
        this.#emitSaveAvailabilityChanged();
        try {
            imgData = await processUploadedImageFile(file);

            if (this.maps[CONSTANTS.TEMP_ID] && this.maps[CONSTANTS.TEMP_ID].temporaryURL) {
                URL.revokeObjectURL(this.maps[CONSTANTS.TEMP_ID].temporaryURL);
            }

            let newMap = {
                id: CONSTANTS.TEMP_ID,
                name: file.name.split(".")[0],
                temporaryURL: imgData.url,
                imgWidth: imgData.width,
                imgHeight: imgData.height
            };

            this.maps[CONSTANTS.TEMP_ID] = newMap;
            this.switchMap(CONSTANTS.TEMP_ID);
            this.bus.emit(EVENTS.NEW_MAP_LOADED, { maps: this.maps, loadedMapId: CONSTANTS.TEMP_ID });
        } catch (error) {
            console.error(error);
            this.pendingMapFile = null;
            this.pendingMapFileMapId = null;
            this.#emitSaveAvailabilityChanged();
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: error.message, type: "danger" });
        }
    }

    async switchMap(mapId) {
        let request = { canProceed: true, reason: "" };

        this.bus.emit(EVENTS.MAP_SWITCH_REQUESTED, request);

        if (request.canProceed) {
            if (!this.isSaving) {
                if (this.maps[mapId]) {
                    // TODO: cancelConnection(); was done in switchMap not yet rewroekd
                    this.appState.activeMapId = mapId;
                    this.#emitSaveAvailabilityChanged();
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
                this.bus.emit(EVENTS.MAP_SWITCH_REQUEST_REJECTED, { revertToId: this.appState.activeMapId });
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Térkép mentése folyamatban, kérlek várj!", type: "danger" });
            }
        } else {
            this.bus.emit(EVENTS.MAP_SWITCH_REQUEST_REJECTED, { revertToId: this.appState.activeMapId });
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
        }

    }

    #emitSaveAvailabilityChanged() {
        this.bus.emit(EVENTS.MAP_SAVE_AVAILABILITY_CHANGED, {
            canSave: !!this.pendingMapFile && this.pendingMapFileMapId == this.appState.activeMapId
        });
    }
}