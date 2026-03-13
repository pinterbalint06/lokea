import { EVENTS } from "../events/EventBus.js";
import { CONSTANTS } from "../shared/constants.js";
import { processUploadedImageFile } from "../shared/utils.js";
import { degreeToRadian } from "../../libs/math/mathUtils.js";
import { isCancellationError, loadPointEquirectangularLowThenHigh } from "../../libs/network/progressiveImage.js";


export class EquirectangularManager {
    constructor(eventBus, equirectangularViewer, mapViewer, appState) {
        this.bus = eventBus;
        this.mapViewer = mapViewer;
        this.equirectangularViewer = equirectangularViewer;
        this.appState = appState; // gameMapId, activeMapId, pendingEquirectangularFile

        this.fovSyncID = null;
        this.currentNorthDirection = 0;
        this.abortController = null;
        this.activePointId = null;
        this.activeLoadGeneration = 0;

        this.#bindBusEvents();
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.UI_EQUIRECTANGULAR_FILE_DROPPED, async ({ file }) => this.#handleEquirectangularLoad(file));

        this.bus.on(EVENTS.MARKER_SELECTED, async ({ id, data }) => {
            this.activePointId = id;
            this.currentNorthDirection = degreeToRadian(data.north_direction);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kép betöltése", id: "equirectangularLoading", closable: false, spinner: true });
            this.activeLoadGeneration++
            const loadGeneration = this.activeLoadGeneration;

            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }

            try {
                this.abortController = new AbortController();
                let signal = this.abortController.signal;

                await loadPointEquirectangularLowThenHigh({
                    pointId: id,
                    signal,
                    loadToViewer: async (imgData) => {
                        await this.equirectangularViewer.loadImage(imgData.url, imgData.width, imgData.height);
                    },
                    isCurrent: () => this.activePointId == id && this.activeLoadGeneration == loadGeneration,
                    onLowReady: () => {
                        if (this.activePointId == id && this.activeLoadGeneration == loadGeneration) {
                            this.equirectangularViewer.setYaw(this.currentNorthDirection);
                            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kép sikeresen betöltve!", type: "success" });
                            this.#startFOVSync();
                        }
                    }
                });
            } catch (error) {
                if (!isCancellationError(error) && this.activePointId == id && this.activeLoadGeneration == loadGeneration) {
                    console.error(error);
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a kép betöltésekor!", type: "danger" });
                }
            } finally {
                this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "equirectangularLoading" });
                if (this.abortController && this.activeLoadGeneration == loadGeneration) {
                    this.abortController = null;
                }
            }

        });

        this.bus.on(EVENTS.NEW_MARKER_PLACED, () => this.activePointId = CONSTANTS.TEMP_ID);

        this.bus.on(EVENTS.POINT_SAVED, ({ previousPointId, pointId, isNewPoint }) => {
            if (isNewPoint && this.activePointId == previousPointId) {
                this.activePointId = pointId;
            }
        });

        this.bus.on(EVENTS.MARKER_MOVED, ({ x, y, screenX, screenY }) => {
            if (this.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
                if (screenX && screenY) {
                    this.mapViewer.moveMarker(CONSTANTS.FOV_MARKER_ID, screenX, screenY);
                } else {
                    this.mapViewer.moveMarkerToImageCoordinates(CONSTANTS.FOV_MARKER_ID, x, y);
                }
            }
        });

        this.bus.on(EVENTS.MAP_SWITCHED, () => {
            if (this.activePointId && !this.mapViewer.doesMarkerExist(this.activePointId)) {
                this.#stopFOVSync();
                this.activeLoadGeneration++;
                if (this.abortController) {
                    this.abortController.abort();
                    this.abortController = null;
                }
            }
        });

        this.bus.on(EVENTS.UI_COLLAPSE_HIDE_STARTED, () => {
            this.#stopFOVSync();
            this.currentNorthDirection = 0;
            this.appState.pendingEquirectangularFile = null;
            this.activePointId = null;
            this.activeLoadGeneration++;

            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }
        });

        this.bus.on(EVENTS.UI_COLLAPSE_HIDDEN, () => {
            this.equirectangularViewer.setYaw(0);
            this.equirectangularViewer.setZoom(0.05);
            this.equirectangularViewer.clearImage();
        });

        this.bus.on(EVENTS.UI_NORTH_DIRECTION_CHANGED, ({ northDirection }) => {
            this.currentNorthDirection = degreeToRadian(northDirection);
            this.#syncFOV();
        });

        this.bus.on(EVENTS.EQUIRECTANGULAR_IMAGE_LOADED, () => this.#startFOVSync());

        this.bus.on(EVENTS.UI_EQUIRECTANGULAR_FULLSCREEN_REQUEST, () => this.equirectangularViewer.toggleFullscreen());

        this.bus.on(EVENTS.UI_SETTINGS_FOV_TOGGLED, ({ enabled }) => {
            if (this.appState.settings) {
                this.appState.settings.fovEnabled = enabled;
            }
            if (enabled && this.activePointId) {
                this.#startFOVSync();
            } else {
                this.#stopFOVSync();
            }
        });

        this.bus.on(EVENTS.UI_SETTINGS_FOV_SIZE_CHANGED, ({ width, height }) => {
            if (width != undefined) {
                this.appState.settings.fovWidth = width
            };
            if (height != undefined) {
                this.appState.settings.fovHeight = height
            };

            if (this.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
                this.mapViewer.resizeMarker(CONSTANTS.FOV_MARKER_ID, this.appState.settings.fovWidth, this.appState.settings.fovHeight);
            }
        });
    }

    async #handleEquirectangularLoad(file) {
        this.equirectangularViewer.clearImage();
        this.appState.pendingEquirectangularFile = file;
        this.bus.emit(EVENTS.EQUIRECTANGULAR_IMAGE_LOADING_STARTED);

        let imgData;
        try {
            imgData = await processUploadedImageFile(file);

            // check if the same file is still pending
            if (this.appState.pendingEquirectangularFile == file) {
                await this.equirectangularViewer.loadImage(imgData.url, imgData.width, imgData.height);

                if (this.activePointId) {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kép sikeresen betöltve!", type: "success", delay: 3000 });
                    this.bus.emit(EVENTS.EQUIRECTANGULAR_IMAGE_LOADED);
                }
            }
        } catch (error) {
            console.error(error);
            this.appState.pendingEquirectangularFile = null;
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: error.message, type: "danger" });
        } finally {
            if (imgData) {
                if (imgData.url) {
                    URL.revokeObjectURL(imgData.url);
                }
            }
        }
    }

    #startFOVSync() {
        this.#stopFOVSync();

        if (this.appState.settings.fovEnabled && this.activePointId && this.mapViewer.doesMarkerExist(this.activePointId)) {
            let pos = this.mapViewer.getMarkerPosition(this.activePointId);

            this.mapViewer.placeMarkerByImageCoordinates(
                CONSTANTS.FOV_MARKER_ID,
                pos.x, pos.y,
                this.appState.settings.fovWidth, this.appState.settings.fovHeight,
                "fov_cone");
            this.mapViewer.setMarkerSelectable(CONSTANTS.FOV_MARKER_ID, false);
            this.mapViewer.setMarkerFixedToMap(CONSTANTS.FOV_MARKER_ID, true);

            this.fovSyncID = requestAnimationFrame(this.#syncFOVLoop);
        }
    }

    #stopFOVSync() {
        if (this.fovSyncID) {
            cancelAnimationFrame(this.fovSyncID);
        }
        if (this.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
            this.mapViewer.removeMarker(CONSTANTS.FOV_MARKER_ID);
        }
    }

    #syncFOV() {
        if (this.activePointId && this.equirectangularViewer && this.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
            let viewYaw = -this.equirectangularViewer.getYaw();

            let finalYaw = viewYaw + this.currentNorthDirection;

            this.mapViewer.rotateMarker(CONSTANTS.FOV_MARKER_ID, finalYaw);
        };
    }

    #syncFOVLoop = () => {
        this.#syncFOV();
        this.fovSyncID = requestAnimationFrame(this.#syncFOVLoop);
    }
}
