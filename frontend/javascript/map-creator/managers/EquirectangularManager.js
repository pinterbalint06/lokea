import { EVENTS } from "../events/EventBus.js";
import { CONSTANTS } from "../constants.js";
import { fetchEquirectangularImage } from "../api.js";
import { processUploadedImageFile } from "../utils.js";
import { degreeToRadian } from "../../libs/math/mathUtils.js";


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

        this.#bindBusEvents();
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.UI_EQUIRECTANGULAR_FILE_DROPPED, async ({ file }) => this.#handleEquirectangularLoad(file));

        this.bus.on(EVENTS.MARKER_SELECTED, async ({ id, data }) => {
            this.activePointId = id;
            this.currentNorthDirection = data.north_direction;
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kép betöltése", id: "equirectangularLoading", closable: false, spinner: true });

            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }

            let imgData;
            try {
                this.abortController = new AbortController();
                let signal = this.abortController.signal;
                imgData = await fetchEquirectangularImage(id, signal);
                // check if the same point is still active
                if (this.activePointId == id) {
                    await this.#loadImage(imgData.url, imgData.width, imgData.height, id);
                }
            } catch (error) {
                if (error.name != "AbortError" && !(error.type && error.type === "REQUEST_CANCELLED")) {
                    console.error(error);
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a kép betöltésekor!", type: "danger" });
                }
            } finally {
                this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "equirectangularLoading" });
                if (imgData) {
                    imgData.cleanup();
                }
            }

        });

        this.bus.on(EVENTS.NEW_MARKER_PLACED, () => this.activePointId = CONSTANTS.TEMP_ID);

        this.bus.on(EVENTS.MARKER_MOVED, ({ x, y, screenX, screenY }) => {
            if (this.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
                if (screenX && screenY) {
                    this.mapViewer.moveMarker(CONSTANTS.FOV_MARKER_ID, screenX, screenY);
                } else {
                    this.mapViewer.moveMarkerToImageCoordinates(CONSTANTS.FOV_MARKER_ID, x, y);
                }
            }
        });

        this.bus.on(EVENTS.UI_COLLAPSE_HIDE_STARTED, () => {
            this.#stopFOVSync();
            this.currentNorthDirection = 0;
            this.appState.pendingEquirectangularFile = null;
            this.activePointId = null;
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
    }

    async #handleEquirectangularLoad(file) {
        this.equirectangularViewer.clearImage();
        // TODO: emit event to so UI nows savePointBUtton should be disabled until the image is loaded
        this.appState.pendingEquirectangularFile = file;

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

    async #loadImage(url, width, height, id) {
        try {
            this.equirectangularViewer.setYaw(this.currentNorthDirection);
            await this.equirectangularViewer.loadImage(url, width, height);
            if (this.activePointId == id) {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kép sikeresen betöltve!", type: "success" });
                this.#startFOVSync();
            }
        } catch (error) {
            if (!(error.type && error.type == "REQUEST_CANCELLED")) {
                console.error(error);
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a kép betöltésekor!", type: "danger" });
            }
        }
    }

    #startFOVSync() {
        this.#stopFOVSync();

        let pos = this.mapViewer.getMarkerPosition(this.activePointId);

        this.mapViewer.placeMarkerByImageCoordinates(CONSTANTS.FOV_MARKER_ID, pos.x, pos.y, CONSTANTS.CONE_SIZE.width, CONSTANTS.CONE_SIZE.height, "fov_cone");
        this.mapViewer.setMarkerSelectable(CONSTANTS.FOV_MARKER_ID, false);

        this.fovSyncID = requestAnimationFrame(this.#syncFOVLoop);
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
        if (this.activePointId && this.equirectangularViewer) {
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
