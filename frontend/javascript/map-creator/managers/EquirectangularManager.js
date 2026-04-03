import { EVENTS } from "../shared/EventBus.js";
import { CONSTANTS } from "../shared/constants.js";
import { processUploadedImageFile } from "../shared/utils.js";
import { degreeToRadian } from "../../libs/math/mathUtils.js";
import { isCancellationError, loadPointEquirectangularLowThenHigh } from "../../libs/network/progressiveImage.js";


export class EquirectangularManager {
    constructor(eventBus, equirectangularViewer, mapViewer, appStore) {
        this.bus = eventBus;
        this.mapViewer = mapViewer;
        this.equirectangularViewer = equirectangularViewer;
        this.store = appStore;

        this.fovSyncID = null;
        this.abortController = null;
        this.activeLoadGeneration = 0;

        this.#bindBusEvents();
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.UI_EQUIRECTANGULAR_FILE_DROPPED, async ({ file }) => this.#handleEquirectangularLoad(file));

        this.bus.on(EVENTS.MARKER_SELECTED, async ({ id }) => {
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
                    isCurrent: () => this.store.getState().activePoint.id == id && this.activeLoadGeneration == loadGeneration,
                    onLowReady: () => {
                        if (this.store.getState().activePoint.id == id && this.activeLoadGeneration == loadGeneration) {
                            this.equirectangularViewer.setYaw(degreeToRadian(this.store.getState().activePoint.northDirection));
                            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kép sikeresen betöltve!", type: "success" });
                            this.#startFOVSync();
                        }
                    }
                });
            } catch (error) {
                if (!isCancellationError(error) && this.store.getState().activePoint.id == id && this.activeLoadGeneration == loadGeneration) {
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
            const activePointId = this.store.getState().activePoint.id;
            if (activePointId && !this.mapViewer.doesMarkerExist(activePointId)) {
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
            this.store.setState({ activePoint: { pendingEquirectangularFile: null } });
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

        this.bus.on(EVENTS.EQUIRECTANGULAR_IMAGE_LOADED, () => this.#startFOVSync());

        this.bus.on(EVENTS.UI_EQUIRECTANGULAR_FULLSCREEN_REQUEST, () => this.equirectangularViewer.toggleFullscreen());

        this.bus.on(EVENTS.UI_SETTINGS_FOV_TOGGLED, ({ enabled }) => {
            this.store.setState({ settings: { fovEnabled: enabled } });
            if (enabled) {
                this.#startFOVSync();
            } else {
                this.#stopFOVSync();
            }
        });

        this.bus.on(EVENTS.UI_SETTINGS_FOV_SIZE_CHANGED, ({ width, height }) => {
            let newSettings = {};
            if (width != undefined) {
                newSettings.fovWidth = width;
            };
            if (height != undefined) {
                newSettings.fovHeight = height;
            };
            this.store.setState({ settings: newSettings });

            if (this.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
                const settings = this.store.getState().settings;
                this.mapViewer.resizeMarker(CONSTANTS.FOV_MARKER_ID, settings.fovWidth, settings.fovHeight);
            }
        });
    }

    async #handleEquirectangularLoad(file) {
        this.equirectangularViewer.clearImage();
        this.store.setState({
            activePoint: { pendingEquirectangularFile: file },
            isBusy: { equirectangular: true }
        });

        let imgData;
        try {
            imgData = await processUploadedImageFile(file);

            // check if the same file is still pending
            if (this.store.getState().activePoint.pendingEquirectangularFile == file) {
                await this.equirectangularViewer.loadImage(imgData.url, imgData.width, imgData.height);

                if (this.store.getState().activePoint.id) {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kép sikeresen betöltve!", type: "success", delay: 3000 });
                    this.bus.emit(EVENTS.EQUIRECTANGULAR_IMAGE_LOADED);
                }
            }
        } catch (error) {
            console.error(error);
            this.store.setState({ activePoint: { pendingEquirectangularFile: null } });
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: error.message, type: "danger" });
        } finally {
            this.store.setState({ isBusy: { equirectangular: false } });
            if (imgData) {
                if (imgData.url) {
                    URL.revokeObjectURL(imgData.url);
                }
            }
        }
    }

    #startFOVSync() {
        this.#stopFOVSync();

        const state = this.store.getState();
        if (state.settings.fovEnabled && state.activePoint.id && this.mapViewer.doesMarkerExist(state.activePoint.id)) {
            let pos = this.mapViewer.getMarkerPosition(state.activePoint.id);

            this.mapViewer.placeMarkerByUV(
                CONSTANTS.FOV_MARKER_ID,
                pos.u, pos.v,
                state.settings.fovWidth, state.settings.fovHeight,
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
        if (this.store.getState().activePoint.id && this.equirectangularViewer && this.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
            let viewYaw = -this.equirectangularViewer.getYaw();

            let finalYaw = viewYaw + degreeToRadian(this.store.getState().activePoint.northDirection);

            this.mapViewer.rotateMarker(CONSTANTS.FOV_MARKER_ID, finalYaw);
        };
    }

    #syncFOVLoop = () => {
        this.#syncFOV();
        this.fovSyncID = requestAnimationFrame(this.#syncFOVLoop);
    }
}
