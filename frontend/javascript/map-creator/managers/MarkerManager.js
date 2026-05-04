import { EVENTS } from "../shared/EventBus.js";
import { ICONS } from "../../libs/icons/icons.js";
import { CONSTANTS } from "../shared/constants.js";
import { fetchPoints, savePoint as savePointApi, deletePoint as deletePointApi } from "../shared/api.js";
import i18next from "../../libs/language/i18next.js";

export class MarkerManager {
    constructor(eventBus, mapViewer, appStore) {
        this.bus = eventBus;
        this.mapViewer = mapViewer;
        this.store = appStore;
        this.markersCache = {};
        this.pendingCenterMarker = null;
        /**
        * @typedef {Object} ActivePointSession
        * @property {number} mapId - The map id this point belongs to.
        * @property {number} originalU - Original U coordinate of the point.
        * @property {number} originalV - Original V coordinate of the point.
        * @property {number} originalNorthDirection - Original north direction (degrees).
        * @property {number} draftU - Draft U coordinate while editing.
        * @property {number} draftV - Draft V coordinate while editing.
        */
        /** @type {ActivePointSession} */
        this.activePointSession = null;

        this.#bindBusEvents();
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_LOADED, async ({ mapId }) => {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "placeMarker" });
            await this.#loadPoints(mapId);
            this.#centerPendingMarker();
        });

        this.bus.on(EVENTS.UI_MARKER_PLACEMENT_REQUESTED, () => {
            const activeMapId = this.store.getState().activeMapId;
            const lockReason = this.store.isAppLocked();
            if (!lockReason) {
                if (activeMapId != CONSTANTS.TEMP_ID) {
                    this.store.setState({
                        activePoint: {
                            id: CONSTANTS.TEMP_ID,
                            mapId: activeMapId,
                        }
                    });
                    this.activePointSession = {
                        mapId: activeMapId,
                        originalU: null,
                        originalV: null,
                        originalNorthDirection: 0,
                        draftU: null,
                        draftV: null
                    };
                    this.store.setState({ isPlacingMarker: true });
                    this.mapViewer.canvasInput.setDefaultCursor("crosshair");

                    this.bus.emit(EVENTS.TOAST_SHOW, {
                        id: CONSTANTS.PLACE_MARKER_TOAST_ID,
                        msg: i18next.t("game:markerManager.clickToPlaceMarker"),
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
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:markerManager.saveMapFirst"), type: "danger" });
                }
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
            }
        });

        this.bus.on(EVENTS.MAP_CLICKED, ({ x, y }) => this.#handleMapClicked(x, y));

        this.bus.on(EVENTS.UI_COORDINATE_CHANGED, ({ x, y, event }) => {
            const activePointId = this.store.getState().activePoint.id;
            if (activePointId) {
                if (!this.mapViewer.doesMarkerExist(activePointId)) {
                    event.target.value = event.target.dataset.previousValue;
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:markerManager.coordinateOnlyModifiableOnMap"), type: "danger" });
                } else {
                    const isValid = this.mapViewer.checkCoordinateValid(x, y);
                    if (isValid.correct) {
                        event.target.dataset.previousValue = event.target.valueAsNumber;

                        this.mapViewer.moveMarkerToImageCoordinates(activePointId, x, y);

                        const position = this.mapViewer.getMarkerPosition(activePointId);

                        if (this.activePointSession) {
                            this.activePointSession.draftU = position.u;
                            this.activePointSession.draftV = position.v;
                        }

                        const isPosDirty = position.u !== this.activePointSession.originalU || position.v !== this.activePointSession.originalV;
                        this.store.setState({ activePoint: { isDirty: { position: isPosDirty } } });

                        this.bus.emit(EVENTS.MARKER_MOVED, position);
                    } else { // Revert to previous value
                        event.target.value = event.target.dataset.previousValue;
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: isValid.error, type: "danger" });
                    }
                }
            }
        });

        this.bus.on(EVENTS.MAP_SWITCHED, () => {
            this.mapViewer.cancelPanAnimation();

            if (this.store.getState().activePoint.id == CONSTANTS.TEMP_ID) {
                if (this.mapViewer.doesMarkerExist(CONSTANTS.TEMP_ID)) {
                    this.mapViewer.removeMarker(CONSTANTS.TEMP_ID);
                }
                this.#resetMarkerPlacingState();
                this.bus.emit(EVENTS.MARKER_DELETED, { pointId: CONSTANTS.TEMP_ID });
            } else {
                if (this.store.getState().isPlacingMarker) {
                    this.store.setState({ isPlacingMarker: false });
                    this.mapViewer.canvasInput.setDefaultCursor("default");
                }
            }
        });

        this.bus.on(EVENTS.UI_MARKER_EDITOR_CLOSING, () => {
            const activePointId = this.store.getState().activePoint.id;
            if (activePointId != null) {
                if (activePointId == CONSTANTS.TEMP_ID) {
                    // it was temporary marker remove it
                    this.mapViewer.removeMarker(CONSTANTS.TEMP_ID);
                } else {
                    // only revert if the marker is on the current map
                    if (this.markersCache[activePointId] && this.mapViewer.doesMarkerExist(activePointId)) {
                        let originalPoint = this.markersCache[activePointId];
                        this.mapViewer.moveMarkerToUV(activePointId, originalPoint.point_u, originalPoint.point_v);
                        this.mapViewer.changeMarkerType(activePointId, "READY");
                    }
                }
            }
            this.#resetMarkerPlacingState();
        });

        this.bus.on(EVENTS.MARKER_CLICKED, ({ id, x, y }) => {
            if (this.store.getState().activePoint.id == null) {
                if (id && id != CONSTANTS.TEMP_ID && !this.store.getState().isConnecting) {
                    this.store.setState({
                        activePoint: {
                            id,
                            mapId: this.store.getState().activeMapId,
                            northDirection: this.markersCache[id].north_direction
                        },
                        isPlacingMarker: true
                    });
                    this.mapViewer.changeMarkerType(id, "EDIT");

                    let position = this.mapViewer.getMarkerPosition(id);
                    let zoomLevel;
                    if (this.mapViewer.getZoomLevel() < 4) {
                        zoomLevel = 4;
                    }
                    this.mapViewer.moveTo(position.x, position.y, zoomLevel);

                    this.activePointSession = {
                        mapId: this.store.getState().activeMapId,
                        originalU: position.u,
                        originalV: position.v,
                        originalNorthDirection: this.markersCache[id].north_direction,
                        draftU: null,
                        draftV: null
                    };
                    this.bus.emit(EVENTS.MARKER_SELECTED, {
                        id,
                        mapId: this.activePointSession.mapId,
                        position,
                        data: this.markersCache[id]
                    });
                }
            } else {
                this.#handleMapClicked(x, y);
            }
        });

        this.bus.on(EVENTS.EQUIRECTANGULAR_IMAGE_LOADED, () => {
            const activePointId = this.store.getState().activePoint.id;
            if (activePointId && this.mapViewer.doesMarkerExist(activePointId)) {
                this.mapViewer.changeMarkerType(activePointId, "UPLOADING");
            }
        });

        this.bus.on(EVENTS.UI_NORTH_DIRECTION_CHANGED, ({ northDirection }) => {
            const originalNorthDirection = this.activePointSession ? this.activePointSession.originalNorthDirection : 0;
            this.store.setState({
                activePoint: {
                    northDirection: northDirection,
                    isDirty: { northDirection: northDirection != originalNorthDirection }
                }
            });
        });

        this.bus.on(EVENTS.UI_POINT_SAVE_REQUESTED, () => {
            const state = this.store.getState();
            const lockReason = state.isBusy.point;
            if (!lockReason) {
                if (state.activePoint.isDirty.position || state.activePoint.isDirty.northDirection || state.activePoint.pendingEquirectangularFile) {
                    this.#savePoint(state.activePoint.id);
                }
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
            }
        });

        this.bus.on(EVENTS.UI_POINT_CENTER_VIEW, ({ targetPointId, targetMapId }) => {
            const hasSamePendingCenterRequest = this.pendingCenterMarker
                && this.pendingCenterMarker.pointId == targetPointId
                && this.pendingCenterMarker.mapId == targetMapId;

            if (!hasSamePendingCenterRequest) {
                this.pendingCenterMarker = {
                    pointId: targetPointId,
                    mapId: targetMapId
                };
                if (targetMapId == this.store.getState().activeMapId) {
                    const hasTargetNow = this.mapViewer.doesMarkerExist(targetPointId)
                        || !!this.markersCache[targetPointId];

                    if (hasTargetNow) {
                        this.#centerPendingMarker();
                    }
                } else {
                    const lockReason = this.store.isAppLocked();
                    if (!lockReason) {
                        this.bus.emit(EVENTS.UI_SWITCH_MAP_REQUEST, { mapId: targetMapId });
                    } else {
                        this.pendingCenterMarker = null;
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
                    }
                }
            }
        });

        this.bus.on(EVENTS.UI_MODAL_CONFIRMED, async ({ modalType }) => {
            if (modalType == "delete_point") {
                const lockReason = this.store.getState().isBusy.point;
                if (!lockReason) {
                    await this.#deletePoint(this.store.getState().activePoint.id);
                } else {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
                }
            }
        });
    }

    #resetMarkerPlacingState() {
        const state = this.store.getState();
        const hadActiveState = state.isPlacingMarker || state.activePoint.id != null || this.activePointSession != null;

        if (hadActiveState) {
            this.store.setState({
                activePoint: {
                    id: null,
                    mapId: null,
                    northDirection: 0,
                    pendingEquirectangularFile: null,
                    isDirty: { position: false, northDirection: false, connections: false }
                },
                isPlacingMarker: false
            });
            this.activePointSession = null;
            this.mapViewer.canvasInput.setDefaultCursor("default");
        }
    }

    #syncActivePointForCurrentMap() {
        const activePointId = this.store.getState().activePoint.id;
        if (activePointId && activePointId != CONSTANTS.TEMP_ID) {
            if (this.activePointSession) {
                if (this.activePointSession.mapId == this.store.getState().activeMapId) {
                    if (this.markersCache[activePointId] && this.mapViewer.doesMarkerExist(activePointId)) {
                        if (this.activePointSession.draftU != null && this.activePointSession.draftV != null) {
                            this.mapViewer.moveMarkerToUV(activePointId, this.activePointSession.draftU, this.activePointSession.draftV);
                        }

                        this.store.setState({ isPlacingMarker: true });
                        let position = this.mapViewer.getMarkerPosition(activePointId);
                        this.bus.emit(EVENTS.MARKER_SELECTED, {
                            id: activePointId,
                            mapId: this.activePointSession.mapId,
                            position,
                            data: { ...this.markersCache[activePointId], north_direction: this.store.getState().activePoint.northDirection },
                            isSync: true
                        });
                    }
                }
            }
        }
    }

    async #loadPoints(mapId) {
        try {
            this.bus.emit(EVENTS.TOAST_SHOW, { id: "loadingPoints", msg: i18next.t("game:markerManager.loadingPoints"), type: "info", closable: false, autohide: false, spinner: true });
            let points = await fetchPoints(mapId);
            if (mapId == this.store.getState().activeMapId) {
                this.markersCache = {};
                points.forEach(point => {
                    this.markersCache[point.point_id] = point;
                    const markerType = point.point_id == this.store.getState().activePoint.id
                        ? "EDIT"
                        : "READY";
                    this.mapViewer.placeMarkerByUV(point.point_id, point.point_u, point.point_v, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, markerType);
                });
                this.#updateCurrentMapPointCount();
                this.#syncActivePointForCurrentMap();
                this.bus.emit(EVENTS.POINTS_LOADED, { points: this.markersCache });
            }
        } catch (e) {
            console.error(i18next.t("game:markerManager.errorLoadingPointsConsole"), e);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:markerManager.errorLoadingPoints"), type: "danger" });
        } finally {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "loadingPoints" });
        }
    }

    async #savePoint(pointToSave) {
        this.store.setState({ isBusy: { point: i18next.t("game:markerManager.savingPointInProgress") } });

        this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:markerManager.savingPoint"), type: "info", id: "savingPoint", closable: false, autohide: false, spinner: true });
        try {
            const position = this.#getPointPosition(pointToSave);
            let isNewPoint = pointToSave == CONSTANTS.TEMP_ID;
            let northDirection = this.store.getState().activePoint.northDirection;

            let fileBeingSaved = this.store.getState().activePoint.pendingEquirectangularFile;
            if (isNewPoint && this.store.getState().activeMapId == CONSTANTS.TEMP_ID) {
                throw new Error(i18next.t("game:markerManager.saveMapFirst"));
            }
            if (isNewPoint && !fileBeingSaved) {
                throw new Error(i18next.t("game:markerManager.noImageSelected"));
            }

            let data = await savePointApi({
                pointId: pointToSave,
                position: position,
                northDirection,
                equirectangularFile: fileBeingSaved,
                mapID: this.activePointSession.mapId,
                isNew: isNewPoint
            });

            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "savingPoint" });
            let previousPointId = pointToSave;
            if (isNewPoint) {
                this.mapViewer.changeMarkerId(pointToSave, data.pointId);
                if (this.store.getState().activePoint.id == CONSTANTS.TEMP_ID) {
                    this.store.setState({
                        activePoint: {
                            id: data.pointId
                        }
                    });
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

                this.#updateCurrentMapPointCount();
            }
            this.markersCache[pointToSave].point_u = position.u;
            this.markersCache[pointToSave].point_v = position.v;
            this.markersCache[pointToSave].north_direction = northDirection;
            let currentPosition = this.#getPointPosition(pointToSave);
            let userMovedMarkerDuringSave = (position.u != currentPosition.u || position.v != currentPosition.v);

            this.activePointSession = {
                mapId: this.activePointSession.mapId,
                originalU: position.u,
                originalV: position.v,
                originalNorthDirection: northDirection,
                draftU: userMovedMarkerDuringSave ? currentPosition.u : null,
                draftV: userMovedMarkerDuringSave ? currentPosition.v : null
            };
            if (fileBeingSaved == this.store.getState().activePoint.pendingEquirectangularFile) {
                this.store.setState({ activePoint: { pendingEquirectangularFile: null } });
            }

            this.bus.emit(EVENTS.POINT_SAVED, {
                previousPointId,
                pointId: pointToSave,
                isNewPoint,
                position,
                data: this.markersCache[pointToSave],
                pointCount: Object.keys(this.markersCache).length
            });

            this.store.setState({
                activePoint: {
                    isDirty: { position: false, northDirection: false }
                }
            });

            this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:markerManager.pointSavedSuccess"), type: "success", iconObject: ICONS.SAVE_FLOPPY });
        } catch (error) {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "savingPoint" });
            console.error(error);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: error.message || i18next.t("game:markerManager.errorSavingPoint"), type: "danger" });
        } finally {
            this.store.setState({ isBusy: { point: false } });
        }
    }

    async #deletePoint(deletedPointId) {
        if (deletedPointId) {
            if (deletedPointId != CONSTANTS.TEMP_ID) {
                try {
                    this.store.setState({ isBusy: { point: "Pont törlése folyamatban, kérlek várj!" } });
                    await deletePointApi(deletedPointId);
                    if (this.mapViewer.doesMarkerExist(deletedPointId)) {
                        this.mapViewer.removeMarker(deletedPointId);
                    }
                    if (this.markersCache[deletedPointId]) {
                        delete this.markersCache[deletedPointId];

                        this.#updateCurrentMapPointCount();
                    }
                    if (this.store.getState().activePoint.id == deletedPointId) {
                        this.activePointSession = null;
                    }
                    this.#resetMarkerPlacingState();
                    this.store.setState({ isBusy: { point: false } });
                    this.bus.emit(EVENTS.MARKER_DELETED, { pointId: deletedPointId });
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pont sikeresen törölve!", type: "success" });
                } catch (error) {
                    console.error(i18next.t("game:markerManager.errorDeletingPointConsole"), error);
                    this.store.setState({ isBusy: { point: false } });
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:markerManager.errorDeletingPoint"), type: "danger" });
                    this.bus.emit(EVENTS.MARKER_DELETE_FAILED);
                }
            } else {
                if (this.mapViewer.doesMarkerExist(deletedPointId)) {
                    this.mapViewer.removeMarker(deletedPointId);
                }
                this.activePointSession = null;
                this.#resetMarkerPlacingState();
                this.bus.emit(EVENTS.MARKER_DELETED);
            }
        }
    }

    #updateCurrentMapPointCount() {
        const currentMapPointCount = Object.keys(this.markersCache).length;
        this.store.setState({ currentMapPointCount });
    }

    #handleMapClicked(x, y) {
        const lockReason = this.store.isAppLocked();
        if (!lockReason) {
            const state = this.store.getState();
            const activePointId = state.activePoint.id;
            if (state.isPlacingMarker && activePointId && !state.isConnecting) {
                const doesMarkerExist = this.mapViewer.doesMarkerExist(activePointId);
                const isTemporary = activePointId == CONSTANTS.TEMP_ID;

                if (doesMarkerExist || isTemporary) {
                    if (doesMarkerExist) {
                        this.mapViewer.moveMarker(activePointId, x, y);
                    } else {
                        this.mapViewer.placeMarker(activePointId, x, y, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, "EMPTY");
                        this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "placeMarker" });
                        this.bus.emit(EVENTS.NEW_MARKER_PLACED);
                    }

                    const pos = this.mapViewer.getMarkerPosition(activePointId);
                    this.bus.emit(EVENTS.MARKER_MOVED, {
                        x: pos.x,
                        y: pos.y,
                        screenX: x,
                        screenY: y
                    });

                    if (this.activePointSession) {
                        this.activePointSession.draftU = pos.u;
                        this.activePointSession.draftV = pos.v;
                    }

                    const isPosDirty = pos.u != this.activePointSession.originalU || pos.v != this.activePointSession.originalV;
                    this.store.setState({ activePoint: { isDirty: { position: isPosDirty } } });
                }
            }
        } else {
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
        }
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
            throw new Error(i18next.t("game:markerManager.pointDataNotAvailable"));
        }

        return position;
    }

    #centerPendingMarker() {
        let targetPosition = null;

        if (this.pendingCenterMarker) {
            let pointId = this.pendingCenterMarker.pointId;
            let mapId = this.pendingCenterMarker.mapId;

            if (mapId == this.store.getState().activeMapId) {
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
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game:markerManager.pointNotFoundOnMap"), type: "danger" });
                }

                this.pendingCenterMarker = null;
            }
        }
    }
}
