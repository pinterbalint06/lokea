import { EVENTS } from "../events/EventBus.js";
import { ICONS } from "../../libs/icons/icons.js";
import { CONSTANTS } from "../shared/constants.js";
import { fetchMapList, saveNewMap, deleteMap as deleteMapApi, renameMap as renameMapApi } from "../shared/api.js";
import { isCancellationError, loadMapImageLowThenHigh } from "../../libs/network/progressiveImage.js";
import { processUploadedImageFile } from "../shared/utils.js";

export class MapManager {
    constructor(eventBus, mapViewer, appState) {
        this.bus = eventBus;
        this.viewer = mapViewer;
        this.appState = appState; // gameMapId, activeMapId
        this.isSaving = false;
        this.isConnectionMode = false;

        this.maps = {};
        this.pendingMapFile = null;
        this.pendingMapFileMapId = null;
        this.abortController = null;
        this.activeLoadGeneration = 0;

        this.#bindBusEvents();
        this.#setupViewerClicks();
    }

    #setupViewerClicks() {
        this.viewer.onClickHandler = (cursorX, cursorY) => {
            let clickedMarkerId = this.viewer.getMarkerAtClick(cursorX, cursorY);
            if (clickedMarkerId != -1) {
                // TODOp: har rányom egyre is mozogjon
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

        const eventsToBlock = [
            EVENTS.UI_ADD_NEW_MAP_REQUEST,
            EVENTS.MAP_SWITCH_REQUESTED
        ];

        eventsToBlock.forEach(event => {
            this.bus.on(event, (request) => {
                if (this.isSaving) {
                    request.canProceed = false;
                    request.reason = "Térkép mentése folyamatban, kérlek várj!";
                }
            });
        });

        this.bus.on(EVENTS.UI_SWITCH_MAP_REQUEST, ({ mapId }) => this.switchMap(mapId));
        this.bus.on(EVENTS.UI_MAP_FILE_DROPPED, ({ file }) => this.#handleMapLoad(file));
        this.bus.on(EVENTS.UI_SAVE_MAP_CLICKED, () => this.#saveMap());

        this.bus.on(EVENTS.UI_DELETE_MAP_REQUESTED, ({ request, mapId }) => {
            if (this.isSaving) {
                request.canProceed = false;
                request.reason = "Térkép mentése folyamatban, kérlek várj!";
            } else {
                if (!this.maps[mapId]) {
                    request.canProceed = false;
                    request.reason = "A térkép nem található!";
                }
            }
        });

        this.bus.on(EVENTS.UI_DELETE_MAP_CONFIRMED, ({ mapId }) => this.#deleteMap(mapId));

        this.bus.on(EVENTS.UI_MAP_RENAME_REQUEST, ({ mapId, newTitle }) => this.#renameMap(mapId, newTitle));
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
        let oldId = this.appState.activeMapId;
        this.bus.emit(EVENTS.TOAST_SHOW, { id: `savingMap${oldId}`, msg: "Térkép mentése folyamatban", closable: false, autohide: false, spinner: true });
        try {
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
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `savingMap${oldId}` });
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Térkép sikeresen mentve!", type: "success", iconObject: ICONS.SAVE_FLOPPY });
            this.bus.emit(EVENTS.MAP_SAVE_SUCCEEDED, { oldMapId: oldId, newMapId: newId, maps: this.maps });
        } catch (error) {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `savingMap${oldId}` });
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
            // TODOp: itt??? valamit akartam
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
        if (this.maps[mapId]) {
            this.appState.activeMapId = mapId;
            this.#emitSaveAvailabilityChanged();
            let mapData = this.maps[mapId];

            this.bus.emit(EVENTS.MAP_SWITCHED, { mapId });
            let randomIdForToast = Math.floor(Math.random() * 100000);
            this.bus.emit(EVENTS.TOAST_SHOW, { id: `mapSwitching${mapId}-${randomIdForToast}`, msg: "Váltás: " + mapData.name, closable: false, autohide: false });

            if (mapId == CONSTANTS.TEMP_ID) {
                this.viewer.clearMarkersAndLines();
                await this.viewer.loadMap(mapData.temporaryURL, mapData.imgWidth, mapData.imgHeight);
                // show change toast for 1 sec after the map was loaded then hide it
                setTimeout(() => this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `mapSwitching${mapId}-${randomIdForToast}` }), 1000);
            } else {
                this.activeLoadGeneration++
                const loadGeneration = this.activeLoadGeneration;

                if (this.abortController) {
                    this.abortController.abort();
                    this.abortController = null;
                }
                try {
                    this.abortController = new AbortController();
                    let signal = this.abortController.signal;

                    await loadMapImageLowThenHigh({
                        mapId: mapId,
                        signal,
                        loadToViewer: async (imgData) => {
                            await this.viewer.loadMap(imgData.url, imgData.width, imgData.height);
                        },
                        isCurrent: () => this.appState.activeMapId == mapId && this.activeLoadGeneration == loadGeneration,
                        onLowReady: () => {
                            if (this.appState.activeMapId == mapId && this.activeLoadGeneration == loadGeneration) {
                                this.viewer.clearMarkersAndLines();
                                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Térkép sikeresen betöltve!", type: "success" });
                                this.bus.emit(EVENTS.MAP_LOADED, { mapId });
                            }
                        }
                    });
                    setTimeout(() => this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `mapSwitching${mapId}-${randomIdForToast}` }), 1000);
                } catch (error) {
                    if (!isCancellationError(error) && this.activePointId == id && this.activeLoadGeneration == loadGeneration) {
                        console.error(error);
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a kép betöltésekor!", type: "danger" });
                    }
                } finally {
                    this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `mapSwitching${mapId}-${randomIdForToast}` });
                    if (this.abortController && this.activeLoadGeneration == loadGeneration) {
                        this.abortController = null;
                    }
                }
            }
        }
    }

    #emitSaveAvailabilityChanged() {
        this.bus.emit(EVENTS.MAP_SAVE_AVAILABILITY_CHANGED, {
            canSave: !!this.pendingMapFile && this.pendingMapFileMapId == this.appState.activeMapId
        });
    }

    async #renameMap(mapId, newTitle) {
        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Térkép átnevezése folyamatban", id: `renamingMap${mapId}`, closable: false, autohide: false, spinner: true });
        try {
            if (!this.maps[mapId]) {
                throw new Error("A térkép nem található!");
            }

            let finalTitle;
            if (mapId != CONSTANTS.TEMP_ID) {
                let result = await renameMapApi(mapId, newTitle);
                finalTitle = result.title;
            } else {
                finalTitle = newTitle.trim();
            }

            if (this.maps[mapId]) {
                this.maps[mapId].name = finalTitle;
            }

            this.bus.emit(EVENTS.MAP_RENAME_SUCCEEDED, { mapId, newTitle: finalTitle });
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `renamingMap${mapId}` });
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: "Térkép sikeresen átnevezve!",
                type: "success",
                duration: 2000
            });
        } catch (error) {
            console.error("Rename failed:", error);
            this.bus.emit(EVENTS.MAP_RENAME_FAILED, { mapId, error });
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `renamingMap${mapId}` });
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: error.message || "A térkép átnevezése sikertelen!",
                type: "danger"
            });
        }
    }

    async #deleteMap(mapId) {
        let map = this.maps[mapId];
        this.bus.emit(EVENTS.TOAST_SHOW, { id: `deletingMap${mapId}`, msg: "Térkép törlése folyamatban", closable: false, autohide: false, spinner: true });

        if (map) {
            try {
                if (mapId != CONSTANTS.TEMP_ID) {
                    if (mapId) {
                        await deleteMapApi(mapId);
                    }
                } else {
                    await this.#deleteTemporaryMap(map);
                }

                if (this.maps[mapId]) {
                    delete this.maps[mapId];
                }

                this.bus.emit(EVENTS.MAPS_LOADED, { maps: this.maps });

                if (this.appState.activeMapId == mapId) {
                    let availableMaps = Object.keys(this.maps);
                    if (availableMaps.length > 0) {
                        await this.switchMap(availableMaps[0]);
                    } else {
                        this.appState.activeMapId = null;
                        this.viewer.clearMarkersAndLines();
                        this.#emitSaveAvailabilityChanged();
                    }
                }

                this.bus.emit(EVENTS.MAP_DELETED, { mapId });
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Térkép sikeresen törölve!", type: "success" });
            } catch (error) {
                console.error(error);
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Térkép törlése sikertelen!", type: "danger" });
                this.bus.emit(EVENTS.MAP_DELETE_FAILED);
            }
        } else {
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "A térkép nem található!", type: "danger" });
            this.bus.emit(EVENTS.MAP_DELETE_FAILED);
        }
        this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `deletingMap${mapId}` });
    }

    async #deleteTemporaryMap(map) {
        let mapId = map.id;
        if (map.temporaryURL) {
            URL.revokeObjectURL(map.temporaryURL);
        }

        if (this.pendingMapFileMapId == mapId) {
            this.pendingMapFile = null;
            this.pendingMapFileMapId = null;
        }
    }
}