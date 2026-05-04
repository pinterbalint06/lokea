import { EVENTS } from "../shared/EventBus.js";
import { ICONS } from "../../libs/icons/icons.js";
import { CONSTANTS } from "../shared/constants.js";
import { fetchMapList, saveNewMap, deleteMap as deleteMapApi, renameMap as renameMapApi } from "../shared/api.js";
import i18next from "../../libs/language/i18next.js";
import { isCancellationError, loadMapImageLowThenHigh } from "../../libs/network/progressiveImage.js";
import { processUploadedImageFile } from "../shared/utils.js";

export class MapManager {
    constructor(eventBus, mapViewer, appStore) {
        this.bus = eventBus;
        this.viewer = mapViewer;
        this.store = appStore;

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
            let mapIds = Object.keys(this.maps).map(id => parseInt(id));
            let hasMaps = mapIds.length > 0;
            if (hasMaps) {
                await this.viewer.ready();
                this.switchMap(mapIds[0]);
            }
            this.bus.emit(EVENTS.HIDE_LOADING);
        });

        this.bus.on(EVENTS.UI_SWITCH_MAP_REQUEST, ({ mapId }) => this.switchMap(mapId));
        this.bus.on(EVENTS.UI_MAP_FILE_DROPPED, ({ file }) => this.#handleMapLoad(file));
        this.bus.on(EVENTS.UI_SAVE_MAP_CLICKED, () => {
            const lockReason = this.store.getState().isBusy.map;
            if (!lockReason) {
                this.#saveMap(this.store.getState().activeMapId);
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
            }
        });

        this.bus.on(EVENTS.UI_MODAL_CONFIRMED, ({ modalType, mapId }) => {
            if (modalType == "delete_map") {
                const lockReason = this.store.getState().isBusy.map;
                if (!lockReason) {
                    this.#deleteMap(mapId);
                } else {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
                }
            }
        });

        this.bus.on(EVENTS.UI_MAP_RENAME_REQUEST, ({ mapId, newTitle }) => this.#renameMap(mapId, newTitle));
    }

    async #loadMaps() {
        let maps = {};
        try {
            let mapList = await fetchMapList(this.store.getState().gameMapId);
            maps = this.#processMapList(mapList);
        } catch (error) {
            console.error(error);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:mapManager.loadMapsError"), type: "danger" });
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

    async #saveMap(idToSave) {
        this.store.setState({ isBusy: { map: i18next.t("game:mapManager.savingMapInProgress") } });

        this.bus.emit(EVENTS.TOAST_SHOW, { id: `savingMap${idToSave}`, msg: i18next.t("game:mapManager.savingMap"), type: "info", closable: false, autohide: false, spinner: true });
        try {
            let currentMap = this.maps[idToSave];

            if (!this.pendingMapFile || !currentMap) {
                throw new Error(i18next.t("game:mapManager.noMapImageSelected"));
            }

            let result = await saveNewMap(this.pendingMapFile, this.store.getState().gameMapId, currentMap.name);
            let newId = result.mapId;

            currentMap.id = newId;
            this.maps[newId] = currentMap;

            if (currentMap.temporaryURL) {
                URL.revokeObjectURL(currentMap.temporaryURL);
                delete currentMap.temporaryURL;
            }

            delete this.maps[idToSave];

            if (this.store.getState().activeMapId == idToSave) {
                this.store.setState({ activeMapId: newId });
            }

            this.pendingMapFile = null;
            this.pendingMapFileMapId = null;
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `savingMap${idToSave}` });
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:mapManager.mapSavedSuccess"), type: "success", iconObject: ICONS.SAVE_FLOPPY });
            this.bus.emit(EVENTS.MAP_SAVE_SUCCEEDED, { oldMapId: idToSave, newMapId: newId, maps: this.maps });
        } catch (error) {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `savingMap${idToSave}` });
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: error.message, type: "danger" });
        } finally {
            // if save successful it this will emit not saveable because pendingMapFile is set to null
            // if failed it will emit saveable because pendingMapFile is still set
            this.#updateSaveAvailability();
            this.store.setState({ isBusy: { map: false } });
        }
    }

    async #handleMapLoad(file) {
        let imgData;
        this.pendingMapFile = file;
        this.pendingMapFileMapId = CONSTANTS.TEMP_ID;
        this.#updateSaveAvailability();
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
            await this.switchMap(CONSTANTS.TEMP_ID);
            this.bus.emit(EVENTS.NEW_MAP_LOADED, { maps: this.maps, loadedMapId: CONSTANTS.TEMP_ID });
        } catch (error) {
            console.error(error);
            this.pendingMapFile = null;
            this.pendingMapFileMapId = null;
            this.#updateSaveAvailability();
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: error.message, type: "danger" });
        }
    }

    async switchMap(mapId) {
        if (this.maps[mapId]) {
            this.store.setState({ activeMapId: mapId });
            this.#updateSaveAvailability();
            let mapData = this.maps[mapId];

            this.bus.emit(EVENTS.MAP_SWITCHED, { mapId });
            let randomIdForToast = Math.floor(Math.random() * 100000);
            this.bus.emit(EVENTS.TOAST_SHOW, { id: `mapSwitching${mapId}-${randomIdForToast}`, msg: i18next.t("game:mapManager.switchingToMap", { mapName: mapData.name }), type: "info", closable: false, autohide: false });

            this.activeLoadGeneration++
            const loadGeneration = this.activeLoadGeneration;

            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }
            if (mapId == CONSTANTS.TEMP_ID) {
                this.viewer.clearMarkersAndLines();
                await this.viewer.loadMap(mapData.temporaryURL, mapData.imgWidth, mapData.imgHeight);
                // show change toast for 0.5 sec after the map was loaded then hide it
                setTimeout(() => this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `mapSwitching${mapId}-${randomIdForToast}` }), 500);
            } else {
                try {
                    this.abortController = new AbortController();
                    let signal = this.abortController.signal;

                    await loadMapImageLowThenHigh({
                        mapId: mapId,
                        signal,
                        loadToViewer: async (imgData) => {
                            await this.viewer.loadMap(imgData.url, imgData.width, imgData.height);
                        },
                        isCurrent: () => this.store.getState().activeMapId == mapId && this.activeLoadGeneration == loadGeneration,
                        onLowReady: () => {
                            if (this.store.getState().activeMapId == mapId && this.activeLoadGeneration == loadGeneration) {
                                this.viewer.clearMarkersAndLines();
                                this.bus.emit(EVENTS.MAP_LOADED, { mapId });
                            }
                        }
                    });
                } catch (error) {
                    if (!isCancellationError(error) && this.store.getState().activeMapId == mapId && this.activeLoadGeneration == loadGeneration) {
                        console.error(error);
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:mapManager.loadImageError"), type: "danger" });
                    }
                } finally {
                    setTimeout(() => this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `mapSwitching${mapId}-${randomIdForToast}` }), 500);
                    if (this.abortController && this.activeLoadGeneration == loadGeneration) {
                        this.abortController = null;
                    }
                }
            }
        }
    }

    #updateSaveAvailability() {
        let canSave = !!this.pendingMapFile && this.pendingMapFileMapId == this.store.getState().activeMapId;
        if (this.store.getState().canSaveMap != canSave) {
            this.store.setState({ canSaveMap: canSave });
        }
    }

    async #renameMap(mapId, newTitle) {
        this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:mapManager.renamingMapInProgress"), type: "info", id: `renamingMap${mapId}`, closable: false, autohide: false, spinner: true });
        try {
            if (!this.maps[mapId]) {
                throw new Error(i18next.t("game:mapManager.mapNotFound"));
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
                msg: i18next.t("game:mapManager.mapRenamedSuccess"),
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

        if (map) {
            try {
                this.store.setState({ isBusy: { map: i18next.t("game:mapManager.deletingMapInProgress") } });

                this.bus.emit(EVENTS.TOAST_SHOW, { id: `deletingMap${mapId}`, msg: i18next.t("game:mapManager.deletingMap"), type: "info", closable: false, autohide: false, spinner: true });
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

                if (this.store.getState().activeMapId == mapId) {
                    let availableMaps = Object.keys(this.maps);
                    if (availableMaps.length > 0) {
                        await this.switchMap(availableMaps[0]);
                    } else {
                        this.store.setState({ activeMapId: null });
                        this.viewer.clearMarkersAndLines();
                        this.#updateSaveAvailability();
                    }
                }

                this.bus.emit(EVENTS.MAP_DELETED, { mapId });
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:mapManager.mapDeletedSuccess"), type: "success" });
            } catch (error) {
                console.error(error);
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:mapManager.mapDeleteFailed"), type: "danger" });
                this.bus.emit(EVENTS.MAP_DELETE_FAILED);
            } finally {
                this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: `deletingMap${mapId}` });
                this.store.setState({ isBusy: { map: false } });
            }
        } else {
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:mapManager.mapNotFound"), type: "danger" });
            this.bus.emit(EVENTS.MAP_DELETE_FAILED);
        }
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
