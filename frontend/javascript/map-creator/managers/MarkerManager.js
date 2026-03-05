import { EVENTS } from "../events/EventBus.js";
import { CONSTANTS, ICONS } from "../shared/constants.js";
import { fetchPoints, savePoint as savePointApi, deletePoint as deletePointApi } from "../shared/api.js";

export class MarkerManager {
    constructor(eventBus, mapViewer, appState) {
        this.bus = eventBus;
        this.mapViewer = mapViewer;
        this.appState = appState; // gameMapId, activeMapId, pendingEquirectangularFile
        this.isSaving = false;
        this.markersCache = {};
        this.activePointId = null;
        this.isPlacingMarker = false;
        this.northDirection = 0;
        this.unsavedConnectionCount = 0;
        this.isConnectionMode = false;

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
                if (this.isPlacingMarker && this.activePointId && !this.isConnectionMode) {
                    if (this.mapViewer.doesMarkerExist(this.activePointId)) {
                        this.mapViewer.moveMarker(this.activePointId, x, y);
                    } else {
                        this.mapViewer.placeMarker(this.activePointId, x, y, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, "EMPTY");
                        this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "placeMarker" });
                        this.bus.emit(EVENTS.NEW_MARKER_PLACED);
                        this.#emitDirtyStateChange();
                    }
                    let pos = this.mapViewer.getMarkerPosition(this.activePointId);
                    this.bus.emit(EVENTS.MARKER_MOVED, {
                        x: pos.x,
                        y: pos.y,
                        screenX: x,
                        screenY: y
                    });
                    this.#emitDirtyStateChange();
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
                    this.#emitDirtyStateChange();
                } else {
                    event.target.value = event.target.dataset.previousValue;
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: isValid.error, type: "danger" });
                }
            }
        });

        const eventsToBlock = [
            EVENTS.UI_COLLAPSE_CLOSE_REQUESTED,
            EVENTS.MAP_SWITCH_REQUESTED,
            EVENTS.UI_ADD_NEW_MAP_REQUEST,
            EVENTS.UI_DELETE_POINT_REQUESTED
        ];

        eventsToBlock.forEach(event => {
            this.bus.on(event, (request) => {
                if (this.isSaving) {
                    request.canProceed = false;
                    request.reason = "Pont mentése folyamatban, kérlek várj!";
                }
            });
        });

        this.bus.on(EVENTS.MAP_SWITCHED, () => {
            this.#resetMarkerPlacingState();
            this.unsavedConnectionCount = 0;
            this.#emitDirtyStateChange();
        });

        this.bus.on(EVENTS.NEW_CONNECTION_ADDED, () => {
            this.unsavedConnectionCount++;
            this.#emitDirtyStateChange();
        });

        this.bus.on(EVENTS.CONNECTIONS_SAVED, ({ successCount }) => {
            this.unsavedConnectionCount = Math.max(0, this.unsavedConnectionCount - successCount);
            this.#emitDirtyStateChange();
        });

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
            if (!this.isPlacingMarker && id && id != CONSTANTS.TEMP_ID && !this.isConnectionMode) {
                this.activePointId = id;
                this.mapViewer.changeMarkerType(id, "EDIT");
                this.isPlacingMarker = true;

                let position = this.mapViewer.getMarkerPosition(id);
                let zoomLevel;
                if (this.mapViewer.getZoomLevel() < 4) {
                    zoomLevel = 4;
                }
                this.mapViewer.moveTo(position.x, position.y, zoomLevel);

                this.northDirection = this.markersCache[id].north_direction;
                this.bus.emit(EVENTS.MARKER_SELECTED, { id, position, data: this.markersCache[id] });
                this.#emitDirtyStateChange();
            }
        });

        this.bus.on(EVENTS.EQUIRECTANGULAR_IMAGE_LOADED, () => {
            this.mapViewer.changeMarkerType(this.activePointId, "UPLOADING");
            this.#emitDirtyStateChange();
        });

        this.bus.on(EVENTS.UI_NORTH_DIRECTION_CHANGED, ({ northDirection }) => {
            this.northDirection = northDirection;
            this.#emitDirtyStateChange();
        });

        this.bus.on(EVENTS.UI_POINT_SAVE_REQUESTED, async () => {
            if (this.#hasMarkerChanges()) {
                this.#savePoint();
            } else {
                if (!this.#hasUnsavedChanges()) {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "A pont nem változott!" });
                }
            }
        });

        this.bus.on(EVENTS.CONNECTION_MODE_CHANGED, ({ isConnecting }) => this.isConnectionMode = isConnecting);

        this.bus.on(EVENTS.UI_DELETE_POINT_CONFIRMED, async () => {
            let deletedPointId = this.activePointId;
            if (deletedPointId) {
                if (deletedPointId != CONSTANTS.TEMP_ID) {
                    try {
                        await deletePointApi(deletedPointId);
                        this.mapViewer.removeMarker(deletedPointId);
                        if (this.markersCache[deletedPointId]) {
                            delete this.markersCache[deletedPointId];
                        }
                        if (deletedPointId == this.activePointId) {
                            this.activePointId = null;
                        }
                        this.isPlacingMarker = false;
                        this.bus.emit(EVENTS.MARKER_DELETED, { pointId: deletedPointId });
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pont sikeresen törölve!", type: "success" });
                        this.#emitDirtyStateChange();
                    } catch (error) {
                        console.error("Error deleting point: ", error);
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a pont törlésekor!", type: "danger" });
                        this.bus.emit(EVENTS.MARKER_DELETE_FAILED);
                    }
                } else {
                    this.mapViewer.removeMarker(deletedPointId);
                    this.activePointId = null;
                    this.isPlacingMarker = false;
                    this.bus.emit(EVENTS.MARKER_DELETED);
                    this.#emitDirtyStateChange();
                }
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

    #hasMarkerChanges() {
        let isDirty = false;
        if (this.activePointId) {
            if (this.activePointId == CONSTANTS.TEMP_ID) {
                isDirty = this.appState.pendingEquirectangularFile != null;
            } else {
                let position = this.mapViewer.getMarkerPosition(this.activePointId);
                let cached = this.markersCache[this.activePointId];

                if (!cached) {
                    isDirty = true;
                } else {
                    let hasPositionChange = position.x != cached.point_x || position.y != cached.point_y;
                    let hasNorthDirChange = this.northDirection != cached.north_direction;
                    let hasPendingImage = this.appState.pendingEquirectangularFile != null;

                    isDirty = hasPositionChange || hasNorthDirChange || hasPendingImage;
                }
            }
        }

        return isDirty;
    }

    #hasUnsavedChanges() {
        let isDirty = this.#hasMarkerChanges();

        if (this.activePointId && this.activePointId != CONSTANTS.TEMP_ID) {
            let hasUnsavedConnections = this.unsavedConnectionCount > 0;
            isDirty = isDirty || hasUnsavedConnections;
        }

        return isDirty;
    }

    #emitDirtyStateChange() {
        let isDirty = this.#hasUnsavedChanges();
        this.bus.emit(EVENTS.POINT_DIRTY_STATE_CHANGED, {
            isDirty: isDirty,
            activePointId: this.activePointId
        });
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

    async #savePoint() {
        this.isSaving = true;
        let pointToSave = this.activePointId;
        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pont mentése", id: "savingPoint", closable: false, autohide: false, spinner: true });
        try {
            let position = this.mapViewer.getMarkerPosition(pointToSave);
            let isNewPoint = pointToSave == CONSTANTS.TEMP_ID;

            if (this.appState.activeMapId == CONSTANTS.TEMP_ID) {
                throw new Error("Először mentsd el a térképet!");
            }
            if (isNewPoint && !this.appState.pendingEquirectangularFile) {
                throw new Error("Nincs kép kiválasztva!");
            }

            let data = await savePointApi({
                pointId: pointToSave,
                position: position,
                northDirection: this.northDirection,
                equirectangularFile: this.appState.pendingEquirectangularFile,
                gameMapID: this.appState.gameMapID,
                mapID: this.appState.activeMapId,
                isNew: isNewPoint
            });

            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "savingPoint" });
            if (data.success) {
                let previousPointId = pointToSave;
                if (isNewPoint) {
                    this.mapViewer.changeMarkerId(pointToSave, data.pointId);
                    if (this.activePointId == CONSTANTS.TEMP_ID) {
                        this.activePointId = data.pointId;
                        this.mapViewer.changeMarkerType(data.pointId, "EDIT");
                    } else {
                        this.mapViewer.changeMarkerType(data.pointId, "READY");
                    }
                    pointToSave = data.pointId;
                }
                if (!this.markersCache[pointToSave]) {
                    this.markersCache[pointToSave] = {
                        point_id: pointToSave
                    };
                }
                this.markersCache[pointToSave].point_x = position.x;
                this.markersCache[pointToSave].point_y = position.y;
                this.markersCache[pointToSave].north_direction = this.northDirection;
                this.appState.pendingEquirectangularFile = null;

                this.bus.emit(EVENTS.POINT_SAVED, {
                    previousPointId,
                    pointId: pointToSave,
                    isNewPoint,
                    position,
                    data: this.markersCache[pointToSave],
                    pointCount: Object.keys(this.markersCache).length
                });

                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pont sikeresen mentve!", type: "success", iconObject: ICONS.SAVE_FLOPPY });
                this.#emitDirtyStateChange();
            } else {
                throw new Error(data.error || "Hiba a pont mentésekor!");
            }
        } catch (error) {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "savingPoint" });
            console.error(error);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: error.message || "Hiba a pont mentésekor!", type: "danger" });
        } finally {
            this.isSaving = false;
        }
    }
}