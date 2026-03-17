import { EVENTS } from "../events/EventBus.js";
import { ICONS } from "../../libs/icons/icons.js";
import { CONSTANTS } from "../shared/constants.js";
import { fetchPoints, savePoint as savePointApi, deletePoint as deletePointApi } from "../shared/api.js";

export class MarkerManager {
    constructor(eventBus, mapViewer, appState) {
        this.bus = eventBus;
        this.mapViewer = mapViewer;
        this.appState = appState; // { gameMapId, activeMapId, pendingEquirectangularFile }
        this.isSaving = false;
        this.markersCache = {};
        this.activePointId = null;
        this.isPlacingMarker = false;
        this.pendingCenterMarker = null;
        /**
        * @typedef {Object} ActivePointSession
        * @property {number} mapId - The map id this point belongs to.
        * @property {number} originalU - Original U coordinate of the point.
        * @property {number} originalV - Original V coordinate of the point.
        * @property {number} originalNorthDirection - Original north direction (degrees).
        * @property {number} draftNorthDirection - Draft north direction while editing.
        * @property {number} draftU - Draft U coordinate while editing.
        * @property {number} draftV - Draft V coordinate while editing.
        */
        /** @type {ActivePointSession} */
        this.activePointSession = null;
        this.unsavedConnectionCount = 0;
        this.isConnectionMode = false;

        this.#bindBusEvents();
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_LOADED, async ({ mapId }) => {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "placeMarker" });
            await this.#loadPoints(mapId);
            this.#centerPendingMarker();
        });

        this.bus.on(EVENTS.UI_MARKER_PLACEMENT_REQUESTED, () => {
            if (this.appState.activeMapId != CONSTANTS.TEMP_ID) {
                this.activePointId = CONSTANTS.TEMP_ID;
                this.activePointSession = {
                    mapId: this.appState.activeMapId,
                    originalU: null,
                    originalV: null,
                    originalNorthDirection: 0,
                    draftNorthDirection: null,
                    draftU: null,
                    draftV: null
                };
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

        this.bus.on(EVENTS.MAP_CLICKED, ({ x, y }) => this.#handleMapClicked(x, y));

        this.bus.on(EVENTS.UI_COORDINATE_CHANGED, ({ x, y, event }) => {
            if (this.activePointId) {
                if (!this.mapViewer.doesMarkerExist(this.activePointId)) {
                    event.target.value = event.target.dataset.previousValue;
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "A pont egy másik térképen van, koordináta csak ott módosítható!", type: "danger" });
                } else {
                    let isValid = this.mapViewer.checkCoordinateValid(x, y);
                    if (isValid.correct) {
                        event.target.dataset.previousValue = event.target.valueAsNumber;
                        this.mapViewer.moveMarkerToImageCoordinates(this.activePointId, x, y);
                        let position = this.mapViewer.getMarkerPosition(this.activePointId);
                        this.#updateSessionDraftUV(this.activePointId, position.u, position.v);
                        this.bus.emit(EVENTS.MARKER_MOVED, position);
                        this.#emitDirtyStateChange();
                    } else {
                        event.target.value = event.target.dataset.previousValue;
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: isValid.error, type: "danger" });
                    }
                }
            }
        });

        const eventsToBlock = [
            EVENTS.UI_COLLAPSE_CLOSE_REQUESTED,
            EVENTS.MAP_SWITCH_REQUESTED,
            EVENTS.UI_ADD_NEW_MAP_REQUEST,
            EVENTS.UI_DELETE_POINT_REQUESTED,
            EVENTS.UI_DELETE_MAP_REQUESTED
        ];

        eventsToBlock.forEach(event => {
            this.bus.on(event, ({ request }) => {
                if (this.isSaving) {
                    request.canProceed = false;
                    request.reason = "Pont mentése folyamatban, kérlek várj!";
                }
            });
        });

        this.bus.on(EVENTS.MAP_SWITCHED, () => {
            this.mapViewer.cancelPanAnimation();

            if (this.activePointId == CONSTANTS.TEMP_ID) {
                if (this.mapViewer.doesMarkerExist(CONSTANTS.TEMP_ID)) {
                    this.mapViewer.removeMarker(CONSTANTS.TEMP_ID);
                }
                this.#resetMarkerPlacingState();
                this.bus.emit(EVENTS.MARKER_DELETED, { pointId: CONSTANTS.TEMP_ID });
            } else {
                if (this.isPlacingMarker) {
                    this.isPlacingMarker = false;
                    this.mapViewer.canvasInput.setDefaultCursor("default");
                }
            }
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

        this.bus.on(EVENTS.UNSAVED_CONNECTION_DELETED, () => {
            this.unsavedConnectionCount = Math.max(0, this.unsavedConnectionCount - 1);
            this.#emitDirtyStateChange();
        });

        this.bus.on(EVENTS.UI_COLLAPSE_HIDE_STARTED, () => {
            if (this.activePointId != null) {
                if (this.activePointId == CONSTANTS.TEMP_ID) {
                    // it was temporary marker remove it
                    this.mapViewer.removeMarker(CONSTANTS.TEMP_ID);
                } else {
                    // only revert if the marker is on the current map
                    if (this.markersCache[this.activePointId] && this.mapViewer.doesMarkerExist(this.activePointId)) {
                        let originalPoint = this.markersCache[this.activePointId];
                        this.mapViewer.moveMarkerToUV(this.activePointId, originalPoint.point_u, originalPoint.point_v);
                        this.mapViewer.changeMarkerType(this.activePointId, "READY");
                    }
                }
            }
            this.#resetMarkerPlacingState();
            this.#emitDirtyStateChange();
        });

        this.bus.on(EVENTS.MARKER_CLICKED, ({ id, x, y }) => {
            if (this.activePointId == null) {
                if (id && id != CONSTANTS.TEMP_ID && !this.isConnectionMode) {
                    this.activePointId = id;
                    this.mapViewer.changeMarkerType(id, "EDIT");
                    this.isPlacingMarker = true;

                    let position = this.mapViewer.getMarkerPosition(id);
                    let zoomLevel;
                    if (this.mapViewer.getZoomLevel() < 4) {
                        zoomLevel = 4;
                    }
                    this.mapViewer.moveTo(position.x, position.y, zoomLevel);

                    this.activePointSession = {
                        mapId: this.appState.activeMapId,
                        originalU: position.u,
                        originalV: position.v,
                        originalNorthDirection: this.markersCache[id].north_direction,
                        draftNorthDirection: null,
                        draftU: null,
                        draftV: null
                    };
                    this.bus.emit(EVENTS.MARKER_SELECTED, {
                        id,
                        mapId: this.activePointSession.mapId,
                        position,
                        data: this.markersCache[id]
                    });
                    this.#emitDirtyStateChange();
                }
            } else {
                this.#handleMapClicked(x, y);
            }
        });

        this.bus.on(EVENTS.EQUIRECTANGULAR_IMAGE_LOADED, () => {
            if (this.activePointId && this.mapViewer.doesMarkerExist(this.activePointId)) {
                this.mapViewer.changeMarkerType(this.activePointId, "UPLOADING");
            }
            this.#emitDirtyStateChange();
        });

        this.bus.on(EVENTS.UI_NORTH_DIRECTION_CHANGED, ({ northDirection }) => {
            this.#updateSessionDraftNorthDirection(northDirection);
            this.#emitDirtyStateChange();
        });

        this.bus.on(EVENTS.UI_POINT_SAVE_REQUESTED, () => {
            if (!this.isSaving) {
                if (this.#hasMarkerChanges()) {
                    this.#savePoint();
                } else {
                    if (!this.#hasUnsavedChanges()) {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "A pont nem változott!" });
                    }
                }
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pont mentése folyamatban, kérlek várj!", type: "danger" });
            }
        });

        this.bus.on(EVENTS.UI_POINT_CENTER_VIEW, ({ targetPointId, targetMapId }) => {
            this.pendingCenterMarker = {
                pointId: targetPointId,
                mapId: targetMapId
            };
            if (targetMapId == this.appState.activeMapId) {
                this.#centerPendingMarker();
            } else {
                let switchRequest = { canProceed: true, reason: "" };
                this.bus.emit(EVENTS.MAP_SWITCH_REQUESTED, switchRequest);

                if (switchRequest.canProceed) {
                    this.bus.emit(EVENTS.UI_SWITCH_MAP_REQUEST, { mapId: targetMapId });
                } else {
                    this.pendingCenterMarker = null;
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: switchRequest.reason, type: "danger" });
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
                        if (this.mapViewer.doesMarkerExist(deletedPointId)) {
                            this.mapViewer.removeMarker(deletedPointId);
                        }
                        if (this.markersCache[deletedPointId]) {
                            delete this.markersCache[deletedPointId];
                        }
                        if (this.activePointId == deletedPointId) {
                            this.activePointSession = null;
                        }
                        this.#resetMarkerPlacingState();
                        this.#emitDirtyStateChange();
                        this.bus.emit(EVENTS.MARKER_DELETED, { pointId: deletedPointId });
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pont sikeresen törölve!", type: "success" });
                    } catch (error) {
                        console.error("Error deleting point: ", error);
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a pont törlésekor!", type: "danger" });
                        this.bus.emit(EVENTS.MARKER_DELETE_FAILED);
                    }
                } else {
                    if (this.mapViewer.doesMarkerExist(deletedPointId)) {
                        this.mapViewer.removeMarker(deletedPointId);
                    }
                    this.activePointSession = null;
                    this.#resetMarkerPlacingState();
                    this.#emitDirtyStateChange();
                    this.bus.emit(EVENTS.MARKER_DELETED);
                }
            }
        });
    }

    #resetMarkerPlacingState() {
        const hadActiveState = this.isPlacingMarker || this.activePointId != null || this.activePointSession != null;

        if (hadActiveState) {
            this.activePointId = null;
            this.activePointSession = null;
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
                let session = this.activePointSession;
                let hasSession = session != null;
                if (hasSession) {
                    let hasPendingImage = this.appState.pendingEquirectangularFile != null;
                    let hasNorthDirChange = this.#getSessionNorthDirection(session) != session.originalNorthDirection;
                    let hasPositionChange = this.#doesActivePointHavePositionChange(session);
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

    #syncActivePointForCurrentMap() {
        if (this.activePointId && this.activePointId != CONSTANTS.TEMP_ID) {
            if (this.activePointSession) {
                if (this.activePointSession.mapId == this.appState.activeMapId) {
                    if (this.markersCache[this.activePointId] && this.mapViewer.doesMarkerExist(this.activePointId)) {
                        if (this.activePointSession.draftU != null && this.activePointSession.draftV != null) {
                            this.mapViewer.moveMarkerToUV(this.activePointId, this.activePointSession.draftU, this.activePointSession.draftV);
                        }

                        this.isPlacingMarker = true;
                        let position = this.mapViewer.getMarkerPosition(this.activePointId);
                        this.bus.emit(EVENTS.MARKER_SELECTED, {
                            id: this.activePointId,
                            mapId: this.activePointSession.mapId,
                            position,
                            data: { ...this.markersCache[this.activePointId], north_direction: this.#getSessionNorthDirection(this.activePointSession) }
                        });
                    }
                }
            }
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
                    const markerType = point.point_id == this.activePointId
                        ? "EDIT"
                        : "READY";
                    this.mapViewer.placeMarkerByUV(point.point_id, point.point_u, point.point_v, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, markerType);
                });
                this.#syncActivePointForCurrentMap();
                this.bus.emit(EVENTS.POINTS_LOADED, { points: this.markersCache });
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pontok sikeresen betöltve!", type: "success" });
                this.#emitDirtyStateChange();
            }
        } catch (e) {
            console.error("Error loading points: ", e);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a pontok betöltésekor!", type: "danger" });
        } finally {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "loadingPoints" });
        }
    }

    async #savePoint() {
        if (!this.isSaving) {
            this.isSaving = true;
            let pointToSave = this.activePointId;
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pont mentése", id: "savingPoint", closable: false, autohide: false, spinner: true });
            this.bus.emit(EVENTS.POINT_SAVE_STARTED, { pointId: pointToSave });
            try {
                let position = this.#getPointPosition(pointToSave);
                let isNewPoint = pointToSave == CONSTANTS.TEMP_ID;
                let northDirection = this.#getSessionNorthDirection(this.activePointSession);

                if (isNewPoint && this.appState.activeMapId == CONSTANTS.TEMP_ID) {
                    throw new Error("Először mentsd el a térképet!");
                }
                if (isNewPoint && !this.appState.pendingEquirectangularFile) {
                    throw new Error("Nincs kép kiválasztva!");
                }

                let data = await savePointApi({
                    pointId: pointToSave,
                    position: position,
                    northDirection,
                    equirectangularFile: this.appState.pendingEquirectangularFile,
                    mapID: this.activePointSession.mapId,
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
                    } else {
                        if (this.mapViewer.doesMarkerExist(pointToSave)) {
                            this.mapViewer.changeMarkerType(pointToSave, "EDIT");
                        }
                    }
                    if (!this.markersCache[pointToSave]) {
                        this.markersCache[pointToSave] = {
                            point_id: pointToSave
                        };
                    }
                    this.markersCache[pointToSave].point_u = position.u;
                    this.markersCache[pointToSave].point_v = position.v;
                    this.markersCache[pointToSave].north_direction = northDirection;
                    this.activePointSession = {
                        mapId: this.activePointSession.mapId,
                        originalU: position.u,
                        originalV: position.v,
                        originalNorthDirection: northDirection,
                        draftNorthDirection: null,
                        draftU: null,
                        draftV: null
                    };
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
                this.bus.emit(EVENTS.POINT_SAVE_FINISHED, { pointId: pointToSave });
            }
        }
    }

    #updateSessionDraftUV(pointId, u, v) {
        if (pointId && pointId != CONSTANTS.TEMP_ID && this.activePointId == pointId) {
            if (this.activePointSession) {
                this.activePointSession.draftU = u;
                this.activePointSession.draftV = v;
            }
        }
    }

    #updateSessionDraftNorthDirection(northDirection) {
        if (this.activePointSession) {
            if (northDirection == this.activePointSession.originalNorthDirection) {
                this.activePointSession.draftNorthDirection = null;
            } else {
                this.activePointSession.draftNorthDirection = northDirection;
            }
        }
    }

    #handleMapClicked(x, y) {
        if (!this.isSaving) {
            if (this.isPlacingMarker && this.activePointId && !this.isConnectionMode) {
                const doesMarkerExist = this.mapViewer.doesMarkerExist(this.activePointId);
                const isTemporary = this.activePointId == CONSTANTS.TEMP_ID;

                if (doesMarkerExist || isTemporary) {
                    if (doesMarkerExist) {
                        this.mapViewer.moveMarker(this.activePointId, x, y);
                    } else {
                        this.mapViewer.placeMarker(this.activePointId, x, y, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, "EMPTY");
                        this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "placeMarker" });
                        this.bus.emit(EVENTS.NEW_MARKER_PLACED);
                        this.#emitDirtyStateChange();
                    }

                    const pos = this.mapViewer.getMarkerPosition(this.activePointId);
                    this.bus.emit(EVENTS.MARKER_MOVED, {
                        x: pos.x,
                        y: pos.y,
                        screenX: x,
                        screenY: y
                    });

                    this.#updateSessionDraftUV(this.activePointId, pos.u, pos.v);
                    this.#emitDirtyStateChange();
                }
            }
        } else {
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pont mentés folyamatban, kérlek várj!", type: "danger" });
        }
    }

    #doesActivePointHavePositionChange(session) {
        let hasPositionChange = false;
        let currentPosition = this.#getPointPosition(this.activePointId);

        if (currentPosition) {
            hasPositionChange = currentPosition.u != session.originalU || currentPosition.v != session.originalV;
        }

        return hasPositionChange;
    }

    #getSessionNorthDirection(session) {
        let northDirection = 0;
        if (session) {
            if (session.draftNorthDirection != null) {
                northDirection = session.draftNorthDirection;
            } else {
                if (session.originalNorthDirection) {
                    northDirection = session.originalNorthDirection;
                }
            }
        }

        return northDirection;
    }

    #getPointPosition(pointId) {
        let position = null;

        if (this.mapViewer.doesMarkerExist(pointId)) {
            position = this.mapViewer.getMarkerPosition(pointId);
        } else {
            position = {
                u: this.activePointSession.draftU ?? this.activePointSession.originalU,
                v: this.activePointSession.draftV ?? this.activePointSession.originalV
            };
        }

        if (!position) {
            throw new Error("A pont adatai nem elérhetőek!");
        }

        return position;
    }

    #centerPendingMarker() {
        let targetPosition = null;

        if (this.pendingCenterMarker) {
            let pointId = this.pendingCenterMarker.pointId;
            let mapId = this.pendingCenterMarker.mapId;

            if (mapId == this.appState.activeMapId) {
                if (this.mapViewer.doesMarkerExist(pointId)) {
                    targetPosition = this.mapViewer.getMarkerPosition(pointId);
                } else {
                    let targetPoint = this.markersCache[pointId];
                    if (targetPoint) {
                        let targetPixelPosition = this.mapViewer.uvToImageCoordinates(targetPoint.point_u, targetPoint.point_v);
                        targetPosition = {
                            x: targetPixelPosition.x,
                            y: targetPixelPosition.y
                        };
                    }
                }

                if (targetPosition) {
                    this.mapViewer.moveTo(targetPosition.x, targetPosition.y);
                } else {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "A pont nem található ezen a térképen!", type: "danger" });
                }

                this.pendingCenterMarker = null;
            }
        }
    }
}