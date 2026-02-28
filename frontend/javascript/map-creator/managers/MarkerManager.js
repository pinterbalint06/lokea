import { EVENTS } from "../events/EventBus.js";
import { CONSTANTS, ICONS } from "../constants.js";
import { fetchPoints, savePoint as savePointApi } from "../api.js";

export class MarkerManager {
    constructor(eventBus, mapViewer, appState) {
        this.bus = eventBus;
        this.mapViewer = mapViewer;
        this.appState = appState; // gameMapId, activeMapId
        this.isSaving = false;
        this.markersCache = {};
        this.activePointId = null;
        this.isPlacingMarker = false;
        this.pendingEquirectangularFile = null;

        this.#bindBusEvents();
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_LOADED, async ({ mapId }) => {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "placeMarker" });
            this.#loadPoints(mapId);
        });

        this.bus.on(EVENTS.UI_ADD_NEW_MARKER_REQUEST, () => {
            if (this.appState.activeMapId != CONSTANTS.TEMP_ID) {
                this.activePointId = CONSTANTS.TEMP_ID;
                this.isPlacingMarker = true;
                this.mapViewer.canvasInput.setDefaultCursor("crosshair");
                this.bus.emit(EVENTS.MARKER_PLACING_STARTED);

                this.bus.emit(EVENTS.TOAST_SHOW, {
                    id: "placeMarker",
                    msg: "Kattints a térképre a jelölő elhelyezéséhez!",
                    iconObject: ICONS.POINTING_HAND,
                    autohide: false,
                    callback: () => {
                        // if temporary marker was not placed then it was cancelled => reset state
                        if (!this.mapViewer.doesMarkerExist(CONSTANTS.TEMP_ID)) {
                            this.#resetMarkerPlacingState();
                        }
                    }
                });
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Először mentsd el a térképet!", type: "danger" });
            }
        });

        this.bus.on(EVENTS.MAP_CLICKED, ({ x, y }) => {
            if (this.isSaving) {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pont mentés folyamatban, kérlek várj!", type: "danger" });
            } else {
                if (this.isPlacingMarker && this.activePointId) {
                    if (this.mapViewer.doesMarkerExist(this.activePointId)) {
                        this.mapViewer.moveMarker(this.activePointId, x, y);
                        if (this.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
                            // TODO: move this to equirectangularManager when it is created
                            this.mapViewer.moveMarker(CONSTANTS.FOV_MARKER_ID, cursorX, cursorY);
                        }
                    } else {
                        this.mapViewer.placeMarker(this.activePointId, x, y, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, "EMPTY");
                        this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "placeMarker" });
                        this.bus.emit(EVENTS.NEW_MARKER_PLACED);
                    }
                    this.bus.emit(EVENTS.MARKER_MOVED, this.mapViewer.getMarkerPosition(this.activePointId));
                }
            }
        });

        this.bus.on(EVENTS.UI_COORDINATE_CHANGED, ({ x, y, event }) => {
            if (this.activePointId) {
                let isValid = this.mapViewer.checkCoordinateValid(x, y);
                if (isValid.correct) {
                    event.target.dataset.previousValue = event.target.valueAsNumber;
                    this.mapViewer.moveMarkerToImageCoordinates(this.activePointId, x, y);
                    this.bus.emit(EVENTS.MARKER_MOVED, this.mapViewer.getMarkerPosition(this.activePointId));
                } else {
                    event.target.value = event.target.dataset.previousValue;
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: isValid.error, type: "danger" });
                }
            }
        });

        this.bus.on(EVENTS.UI_COLLAPSE_CLOSE_REQUESTED, (request) => {
            if (this.isSaving) {
                request.canProceed = false;
                request.reason = "Pont mentése folyamatban, kérlek várj!";
            }
        });

        this.bus.on(EVENTS.MAP_SWITCH_REQUESTED, (request) => {
            if (this.isSaving) {
                request.canProceed = false;
                request.reason = "Pont mentése folyamatban, kérlek várj!";
            }
        });

        this.bus.on(EVENTS.UI_ADD_NEW_MAP_REQUEST, (request) => {
            if (this.isSaving) {
                request.canProceed = false;
                request.reason = "Pont mentése folyamatban, kérlek várj!";
            }
        });

        this.bus.on(EVENTS.MAP_SWITCHED, () => this.#resetMarkerPlacingState());

        this.bus.on(EVENTS.UI_COLLAPSE_HIDE_STARTED, () => {
            if (this.activePointId != null) {
                if (this.activePointId == CONSTANTS.TEMP_ID) {
                    // it was temporary marker remove it
                    this.mapViewer.removeMarker(CONSTANTS.TEMP_ID);
                } else {
                    if (this.markersCache[this.activePointId]) {
                        // it was discarded revert to old data
                        let originalPoint = this.markersCache[this.activePointId];
                        this.mapViewer.moveMarkerToImageCoordinates(
                            this.activePointId,
                            originalPoint.point_x,
                            originalPoint.point_y
                        );
                        this.mapViewer.changeMarkerType(this.activePointId, "READY");
                    }
                }
                this.#resetMarkerPlacingState();
            }
        });

        this.bus.on(EVENTS.MARKER_CLICKED, ({ id }) => {
            if (!this.isPlacingMarker && id && id != CONSTANTS.TEMP_ID) {
                this.activePointId = id;
                this.mapViewer.changeMarkerType(id, "EDIT");
                this.isPlacingMarker = true;

                let position = this.mapViewer.getMarkerPosition(id);
                let zoomLevel;
                if (this.mapViewer.getZoomLevel() < 4) {
                    zoomLevel = 4;
                }
                this.mapViewer.moveTo(position.x, position.y, 4);

                // LOAD IMAGE, SHOW COLLAPSE
                this.bus.emit(EVENTS.MARKER_SELECTED, { id, position, data: this.markersCache[id] });
            }
        });
    }

    #resetMarkerPlacingState() {
        if (this.isPlacingMarker) {
            this.activePointId = null;
            this.isPlacingMarker = false;
            this.mapViewer.canvasInput.setDefaultCursor("default");
            this.bus.emit(EVENTS.MARKER_PLACING_CANCELLED);
        }
    }

    async #loadPoints(mapId) {
        try {
            this.bus.emit(EVENTS.TOAST_SHOW, { id: "loadingPoints", msg: "Pontok betöltése", closable: false, autohide: false, spinner: true });
            let points = await fetchPoints(mapId);
            if (mapId == this.appState.activeMapId) {
                this.markersCache = {};
                points.forEach(point => {
                    this.markersCache[point.point_id] = point;
                    this.mapViewer.placeMarkerByImageCoordinates(point.point_id, point.point_x, point.point_y, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, "ready");
                });
                this.bus.emit(EVENTS.POINTS_LOADED, { points: this.markersCache });
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pontok sikeresen betöltve!", type: "success" });
            }
        } catch (e) {
            console.error("Error loading points: ", e);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a pontok betöltésekor!", type: "danger" });
        } finally {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "loadingPoints" });
        }
    }
}