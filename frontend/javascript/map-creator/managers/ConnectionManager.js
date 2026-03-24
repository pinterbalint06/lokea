import { fetchConnections, saveUnsavedConnections, deleteConnection, saveDraftConnectionDirections } from "../shared/api.js";
import { ICONS } from "../../libs/icons/icons.js";
import { CONSTANTS } from "../shared/constants.js";
import { EVENTS } from "../events/EventBus.js";
import { degreeToRadian } from "../../libs/math/mathUtils.js";

export class ConnectionManager {
    constructor(eventBus, mapViewer, appState) {
        this.bus = eventBus;
        this.mapViewer = mapViewer;
        this.appState = appState; // gameMapId, activeMapId

        this.portalIdStart = -9999;
        this.portalMarkerIdsByConnection = {};
        this.connectionsList = [];
        this.unsavedConnections = [];
        this.draftConnectionDirections = {};
        this.isConnecting = false;
        this.activePointId = null;
        this.activePointMapId = null;
        this.focusedConnectionId = null;
        this.showOffMapConnectionsWhenNotActive = true;
        this.showAllConnectionsWhenNotActive = true;
        this.temporaryId = -1;
        this.isSaving = false;
        this.connectionToastId = "connectionMode";
        this.#bindBusEvents();
    }

    #checkIdOrder(connection) {
        if (connection.start_point_id > connection.end_point_id) {
            let tempPoint = connection.start_point_id;
            connection.start_point_id = connection.end_point_id;
            connection.end_point_id = tempPoint;

            let tempMap = connection.start_map_id;
            connection.start_map_id = connection.end_map_id;
            connection.end_map_id = tempMap;

            let tempDir = connection.direction_start_to_end;
            connection.direction_start_to_end = connection.direction_end_to_start;
            connection.direction_end_to_start = tempDir;
        }
        return connection;
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.APP_INIT, async () => {
            await this.#loadConnections();
        });

        this.bus.on(EVENTS.POINTS_LOADED, () => {
            this.#renderConnectionsForActiveMap();
        });

        this.bus.on(EVENTS.MAP_SWITCHED, () => {
            this.#cancelConnectingMode();
            this.#renderConnectionsForActiveMap();
            this.#emitConnectionListUpdate();
        });

        this.bus.on(EVENTS.MAP_DELETED, async ({ mapId }) => {
            this.unsavedConnections = this.unsavedConnections.filter(connection =>
                !this.#isConnectionOnMap(connection, mapId)
            );
            this.connectionsList = this.connectionsList.filter(connection =>
                !this.#isConnectionOnMap(connection, mapId)
            );

            this.#renderConnectionsForActiveMap();
            this.#emitConnectionListUpdate();
        });

        this.bus.on(EVENTS.MARKER_SELECTED, ({ id, mapId }) => {
            this.activePointId = id;
            this.activePointMapId = mapId ?? this.appState.activeMapId;
            this.#renderConnectionsForActiveMap();
            this.#emitConnectionListUpdate();
        });

        this.bus.on(EVENTS.POINT_SAVED, ({ previousPointId, pointId, isNewPoint }) => {
            if (isNewPoint && this.activePointId == previousPointId) {
                this.activePointId = pointId;
                this.#renderConnectionsForActiveMap();
                this.#emitConnectionListUpdate();
            }
        });

        this.bus.on(EVENTS.MARKER_PLACING_STARTED, () => {
            this.activePointId = CONSTANTS.TEMP_ID;
            this.activePointMapId = this.appState.activeMapId;
        });

        this.bus.on(EVENTS.MARKER_PLACING_CANCELLED, () => {
            if (this.activePointId == CONSTANTS.TEMP_ID) {
                this.activePointId = null;
                this.activePointMapId = null;
            }
        });

        this.bus.on(EVENTS.MAP_CLICKED, () => {
            if (this.isConnecting) {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kattints egy térképjelölőre!", type: "danger", duration: 1500 });
            }
        });

        this.bus.on(EVENTS.MARKER_CLICKED, ({ id }) => {
            if (this.isConnecting) {
                if (this.activePointId != id) {
                    if (!this.#hasConnection(this.activePointId, id)) {
                        let newConnection = {
                            connection_id: this.temporaryId,
                            start_point_id: this.activePointId,
                            end_point_id: id,
                            game_maps_id: this.appState.gameMapID,
                            start_map_id: this.activePointMapId ?? this.appState.activeMapId,
                            end_map_id: this.appState.activeMapId
                        };

                        if (newConnection.start_map_id != newConnection.end_map_id) {
                            newConnection.direction_start_to_end = 0;
                            newConnection.direction_end_to_start = 0;
                        }

                        this.#checkIdOrder(newConnection);

                        this.unsavedConnections.push(newConnection);
                        this.temporaryId--;
                        this.#renderConnectionsForActiveMap();

                        this.bus.emit(EVENTS.NEW_CONNECTION_ADDED, { newConnection });

                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Új kapcsolat létrehozva!", type: "success" });
                        this.#cancelConnectingMode();
                        this.#emitConnectionListUpdate();
                    } else {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Ezek a jelölők már össze vannak kapcsolva!", type: "danger" });
                    }
                } else {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Ugyanarra a pontra kattintottál. Válassz másik pontot!", type: "danger" });
                }
            }
        });

        this.bus.on(EVENTS.UI_COLLAPSE_HIDE_STARTED, () => {
            this.activePointId = null;
            this.activePointMapId = null;
            this.focusedConnectionId = null;
            this.unsavedConnections = [];
            this.draftConnectionDirections = {};
            this.bus.emit(EVENTS.UNSAVED_CONNECTION_DIRECTION_CHANGED, { areThereUnsaved: false });
            this.#cancelConnectingMode();
            this.#renderConnectionsForActiveMap();
        });

        this.bus.on(EVENTS.UI_COLLAPSE_HIDDEN, () => this.#emitConnectionListUpdate());

        this.bus.on(EVENTS.UI_CONNECTION_CREATE_REQUEST, () => {
            this.#startConnectingMode();
        });

        this.bus.on(EVENTS.UI_CONNECTION_DIRECTION_UPDATE, ({ connectionId, direction, value }) => {
            let connection = this.#getConnectionById(connectionId);
            if (connection) {
                let isUnsaved = connectionId < 0;
                if (isUnsaved) {
                    connection[direction] = value;
                } else {
                    let hadUnsaved = Object.keys(this.draftConnectionDirections).length > 0;
                    if (!this.draftConnectionDirections[connectionId]) {
                        this.draftConnectionDirections[connectionId] = {};
                    }
                    if (this.#getConnectionById(connectionId)?.[direction] != value) {
                        this.draftConnectionDirections[connectionId][direction] = value;
                    } else {
                        delete this.draftConnectionDirections[connectionId][direction];
                        if (Object.keys(this.draftConnectionDirections[connectionId]).length == 0) {
                            delete this.draftConnectionDirections[connectionId];
                        }
                    }

                    let hasUnsaved = Object.keys(this.draftConnectionDirections).length > 0;
                    if (hasUnsaved != hadUnsaved) {
                        this.bus.emit(EVENTS.UNSAVED_CONNECTION_DIRECTION_CHANGED, { areThereUnsaved: hasUnsaved });
                    }
                }

                this.#renderConnectionsForActiveMap();
            }
        });

        this.bus.on(EVENTS.UI_SETTINGS_CONNECTION_OFF_MAP_VISIBILITY_CHANGED, ({ enabled }) => {
            this.showOffMapConnectionsWhenNotActive = enabled;
            this.#renderConnectionsForActiveMap();
        });

        this.bus.on(EVENTS.UI_SETTINGS_CONNECTION_ALL_VISIBILITY_CHANGED, ({ enabled }) => {
            this.showAllConnectionsWhenNotActive = enabled;
            this.#renderConnectionsForActiveMap();
        });

        this.bus.on(EVENTS.UI_POINT_SAVE_REQUESTED, () => {
            if (!this.isSaving) {
                if (this.activePointId != CONSTANTS.TEMP_ID && (this.unsavedConnections.length > 0 || Object.keys(this.draftConnectionDirections).length > 0)) {
                    this.#saveConnections();
                }
            }
        });

        this.bus.on(EVENTS.MARKER_DELETED, ({ pointId }) => {
            this.connectionsList = this.connectionsList.filter(connection =>
                connection.start_point_id != pointId && connection.end_point_id != pointId
            );
            this.unsavedConnections = this.unsavedConnections.filter(connection =>
                connection.start_point_id != pointId && connection.end_point_id != pointId
            );
            this.#renderConnectionsForActiveMap();
            this.#emitConnectionListUpdate();
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
                    request.reason = "Kapcsolatok mentése folyamatban, kérlek várj!";
                }
            });
        });

        this.bus.on(EVENTS.UI_CONNECTION_HIGHLIGHT, ({ connectionId, type }) => {
            if (this.activePointId) {
                if (type == "focused") {
                    this.focusedConnectionId = connectionId;
                } else {
                    if (this.focusedConnectionId == connectionId) {
                        this.focusedConnectionId = null;
                    }
                }

                if (this.mapViewer.doesLineExist(connectionId)) {
                    this.mapViewer.changeLineType(connectionId, type);
                }
            }
        });

        this.bus.on(EVENTS.UI_CONNECTION_CENTER_VIEW, ({ connectionId }) => {
            let visibleMarkerIds = this.#getVisibleConnectionMarkerIds(connectionId);

            if (visibleMarkerIds.length == 2) {
                let firstMarkerId = visibleMarkerIds[0];
                let secondMarkerId = visibleMarkerIds[1];
                let pos1 = this.mapViewer.getMarkerPosition(firstMarkerId);
                let pos2 = this.mapViewer.getMarkerPosition(secondMarkerId);
                let centerX = (pos1.x + pos2.x) / 2;
                let centerY = (pos1.y + pos2.y) / 2;
                this.mapViewer.moveTo(centerX, centerY);
            }
        });

        this.bus.on(EVENTS.UI_CONNECTION_DELETE_REQUEST, async ({ connectionId }) => {
            if (connectionId < 0) {
                // unsaved connection
                this.unsavedConnections = this.unsavedConnections.filter(connection =>
                    connection.connection_id != connectionId
                );
                if (this.focusedConnectionId == connectionId) {
                    this.focusedConnectionId = null;
                }
                this.#renderConnectionsForActiveMap();
                this.#emitConnectionListUpdate();
                this.bus.emit(EVENTS.UNSAVED_CONNECTION_DELETED);
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolat sikeresen törölve!", type: "success" });
            } else {
                await this.#deleteConnection(connectionId);
            }
        });
    }

    #startConnectingMode() {
        if (!this.isConnecting) {
            if (this.activePointId) {
                if (this.activePointId != CONSTANTS.TEMP_ID) {
                    this.isConnecting = true;
                    this.mapViewer.canvasInput.setDefaultCursor("crosshair");
                    this.bus.emit(EVENTS.CONNECTION_MODE_CHANGED, { isConnecting: true });
                    let currentUnsavedConnections = this.unsavedConnections.length;
                    this.bus.emit(EVENTS.TOAST_SHOW, {
                        id: this.connectionToastId,
                        msg: "Kattints a végpontra!",
                        autohide: false,
                        callback: () => {
                            this.#cancelConnectingMode();
                            if (currentUnsavedConnections == this.unsavedConnections.length) {
                                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolat létrehozás megszakítva!" });
                            }
                        }
                    });
                } else {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Először mentsd el a pontot!", type: "danger" });
                }
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Először válassz ki egy pontot!", type: "danger" });
            }
        }
    }


    #hasConnection(startPointId, endPointId) {
        let hasConnection = false;
        const validIds = startPointId && endPointId;
        if (validIds) {
            // saved connections
            hasConnection = this.connectionsList.some(connection =>
                (connection.start_point_id == startPointId && connection.end_point_id == endPointId) ||
                (connection.start_point_id == endPointId && connection.end_point_id == startPointId)
            );
            if (!hasConnection) {
                // unsaved connections
                hasConnection = this.unsavedConnections.some(connection =>
                    (connection.start_point_id == startPointId && connection.end_point_id == endPointId) ||
                    (connection.start_point_id == endPointId && connection.end_point_id == startPointId)
                );
            }
        }

        return hasConnection;
    }

    #cancelConnectingMode() {
        if (this.isConnecting) {
            this.isConnecting = false;
            this.mapViewer.canvasInput.setDefaultCursor("default");
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: this.connectionToastId });
            this.bus.emit(EVENTS.CONNECTION_MODE_CHANGED, { isConnecting: false });
        }
    }

    #isConnectionOnMap(connection, mapId) {
        return connection.start_map_id == mapId || connection.end_map_id == mapId;
    }

    async #saveConnections() {
        if (!this.isSaving) {
            this.isSaving = true;
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolatok mentése", id: "savingConnections", closable: false, autohide: false, spinner: true });

            try {
                if (this.unsavedConnections.length > 0) {
                    let saveNewResult = await saveUnsavedConnections(this.appState.gameMapID, this.unsavedConnections);

                    let newSaveSuccess = saveNewResult.saved.length;
                    let newSaveFailed = saveNewResult.failed.length;

                    if (newSaveSuccess > 0) {
                        saveNewResult.saved.forEach(connection => this.#checkIdOrder(connection));
                        this.connectionsList.push(...saveNewResult.saved);

                        this.unsavedConnections = this.unsavedConnections.filter(connection =>
                            !saveNewResult.saved.some(savedConn =>
                                savedConn.start_point_id == connection.start_point_id &&
                                savedConn.end_point_id == connection.end_point_id
                            )
                        );
                    }

                    for (let fail of saveNewResult.failed) {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: `Új kapcsolat mentése sikertelen: ${fail.message}`, type: "danger" });
                    }

                    if (newSaveSuccess > 0) {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${newSaveSuccess} új kapcsolat sikeresen mentve!`, type: "success", iconObject: ICONS.SAVE_FLOPPY });
                        this.bus.emit(EVENTS.CONNECTIONS_SAVED, { successCount: newSaveSuccess });
                    }
                    if (newSaveFailed > 0) {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${newSaveFailed} új kapcsolat mentése sikertelen!`, type: "danger" });
                    }
                }

                let draftIds = Object.keys(this.draftConnectionDirections);
                if (draftIds.length > 0) {
                    let draftResult = await saveDraftConnectionDirections(this.draftConnectionDirections);

                    let directionSaveSuccess = draftResult.saved.length;
                    let directionSaveFailed = draftResult.failed.length;

                    if (directionSaveSuccess > 0) {
                        draftResult.saved.forEach(savedDraft => {
                            let connection = this.connectionsList.find(connection => connection.connection_id == savedDraft.connection_id);
                            if (connection) {
                                if (savedDraft.direction_start_to_end != undefined) {
                                    connection.direction_start_to_end = savedDraft.direction_start_to_end;
                                }
                                if (savedDraft.direction_end_to_start != undefined) {
                                    connection.direction_end_to_start = savedDraft.direction_end_to_start;
                                }
                            }
                            delete this.draftConnectionDirections[savedDraft.connection_id];
                        });

                        this.bus.emit(EVENTS.UNSAVED_CONNECTION_DIRECTION_CHANGED, {
                            areThereUnsaved: Object.keys(this.draftConnectionDirections).length > 0
                        });
                    }

                    for (let fail of draftResult.failed) {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: `Új kapcsolat irány mentése sikertelen: ${fail.message}`, type: "danger" });
                    }

                    if (directionSaveSuccess > 0) {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${directionSaveSuccess} kapcsolat új irányainak mentése sikeres!`, type: "success", iconObject: ICONS.SAVE_FLOPPY });
                    }
                    if (directionSaveFailed > 0) {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${directionSaveFailed} kapcsolat új irányainak mentése sikertelen!`, type: "danger" });
                    }
                }

                this.#renderConnectionsForActiveMap();
                this.#emitConnectionListUpdate();

            } catch (error) {
                console.error("Error saving connections:", error);
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a kapcsolatok mentésekor!", type: "danger" });
            } finally {
                this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "savingConnections" });
                this.isSaving = false;
            }
        }
    }

    async #loadConnections() {
        try {
            const gameMapID = this.appState.gameMapID;
            let connections = await fetchConnections(gameMapID);

            connections.forEach(conn => this.#checkIdOrder(conn));

            this.connectionsList = connections;
            this.bus.emit(EVENTS.CONNECTIONS_LOADED, { connections: this.connectionsList });
            this.#renderConnectionsForActiveMap();
            this.#emitConnectionListUpdate();
        } catch (error) {
            console.error("Error loading connections:", error);
        }
    }

    #getConnectionById(connectionId) {
        let connection = this.connectionsList.find(connection => connection.connection_id == connectionId);

        if (!connection) {
            connection = this.unsavedConnections.find(connection => connection.connection_id == connectionId);
        }

        return connection;
    }

    #getVisibleConnectionMarkerIds(connectionId) {
        let visibleMarkerIds = [];
        let connection = this.#getConnectionById(connectionId);

        if (connection) {
            let startExists = this.mapViewer.doesMarkerExist(connection.start_point_id);
            let endExists = this.mapViewer.doesMarkerExist(connection.end_point_id);
            let portalMarkerId = this.portalMarkerIdsByConnection[connectionId];

            if (startExists && endExists) {
                visibleMarkerIds.push(connection.start_point_id);
                visibleMarkerIds.push(connection.end_point_id);
            } else {
                if (startExists != endExists) {
                    if (startExists) {
                        visibleMarkerIds.push(connection.start_point_id);
                    } else {
                        visibleMarkerIds.push(connection.end_point_id);
                    }

                    if (portalMarkerId != null && this.mapViewer.doesMarkerExist(portalMarkerId)) {
                        visibleMarkerIds.push(portalMarkerId);
                    }
                }
            }
        }

        return visibleMarkerIds;
    }

    #getDirection(connection, fromPointId) {
        let direction = (fromPointId == connection.start_point_id)
            ? "direction_start_to_end"
            : "direction_end_to_start";

        let draftAngle = this.draftConnectionDirections[connection.connection_id]?.[direction];
        let angle = draftAngle ?? connection[direction];

        return angle;
    }

    #drawOffMapConnection(connection, existingMarkerId, lineType) {
        let positon = this.mapViewer.getMarkerPosition(existingMarkerId);

        let angle = this.#getDirection(connection, existingMarkerId) ?? 0;

        let distance = 40;
        let angleRad = degreeToRadian(angle);
        let targetX = Math.round(positon.x + (distance * Math.sin(angleRad)));
        let targetY = Math.round(positon.y + (-distance * Math.cos(angleRad)));

        let portalMarkerId = this.portalMarkerIdsByConnection[connection.connection_id];

        if (portalMarkerId != null && this.mapViewer.doesMarkerExist(portalMarkerId)) {
            this.mapViewer.moveMarkerToImageCoordinates(portalMarkerId, targetX, targetY);
        } else {
            portalMarkerId = this.portalIdStart--;

            this.mapViewer.placeMarkerByImageCoordinates(
                portalMarkerId,
                targetX,
                targetY,
                CONSTANTS.PORTAL_MARKER_SIZE.width,
                CONSTANTS.PORTAL_MARKER_SIZE.height,
                "portal"
            );
            this.mapViewer.setMarkerSelectable(portalMarkerId, false);
            this.portalMarkerIdsByConnection[connection.connection_id] = portalMarkerId;
        }

        this.mapViewer.connectMarkers(existingMarkerId, portalMarkerId, connection.connection_id, lineType);
    }

    #renderConnectionsForActiveMap() {
        let activePortalConnections = [];

        this.mapViewer.clearLines();

        for (const connection of this.connectionsList) {
            let startExists = this.mapViewer.doesMarkerExist(connection.start_point_id);
            let endExists = this.mapViewer.doesMarkerExist(connection.end_point_id);
            let isActive = (this.activePointId == connection.start_point_id || this.activePointId == connection.end_point_id);

            if (this.showAllConnectionsWhenNotActive || isActive) {
                if (startExists && endExists) {
                    let lineType = isActive ? "editing" : "default";
                    this.mapViewer.connectMarkers(connection.start_point_id, connection.end_point_id, connection.connection_id, lineType);
                } else {
                    let shouldRenderOffMap = ((this.showAllConnectionsWhenNotActive && this.showOffMapConnectionsWhenNotActive) || isActive) && (startExists != endExists);
                    if (shouldRenderOffMap) {
                        let existingMarkerId = startExists ? connection.start_point_id : connection.end_point_id;
                        let lineType = isActive ? "editing" : "default";
                        this.#drawOffMapConnection(connection, existingMarkerId, lineType);
                        if (!activePortalConnections.includes(connection.connection_id)) {
                            activePortalConnections.push(connection.connection_id);
                        }
                    }
                }
            }
        }

        for (let unsavedConnection of this.unsavedConnections) {
            let startExists = this.mapViewer.doesMarkerExist(unsavedConnection.start_point_id);
            let endExists = this.mapViewer.doesMarkerExist(unsavedConnection.end_point_id);

            if (startExists && endExists) {
                this.mapViewer.connectMarkers(unsavedConnection.start_point_id, unsavedConnection.end_point_id, unsavedConnection.connection_id, "unsaved");
            } else {
                if (startExists != endExists) {
                    let existingMarkerId = startExists ? unsavedConnection.start_point_id : unsavedConnection.end_point_id;
                    this.#drawOffMapConnection(unsavedConnection, existingMarkerId, "unsaved");
                    if (!activePortalConnections.includes(unsavedConnection.connection_id)) {
                        activePortalConnections.push(unsavedConnection.connection_id);
                    }
                }
            }
        }

        for (const connectionId in this.portalMarkerIdsByConnection) {
            if (!activePortalConnections.includes(parseInt(connectionId))) {
                let portalMarkerId = this.portalMarkerIdsByConnection[connectionId];
                if (this.mapViewer.doesMarkerExist(portalMarkerId)) {
                    this.mapViewer.removeMarker(portalMarkerId);
                }
                delete this.portalMarkerIdsByConnection[connectionId];
            }
        }

        if (this.focusedConnectionId) {
            if (this.mapViewer.doesLineExist(this.focusedConnectionId)) {
                this.mapViewer.changeLineType(this.focusedConnectionId, "focused");
            }
        }
    }

    #emitConnectionListUpdate() {
        let currentMarkerConnections = this.connectionsList.filter(connection =>
            connection.start_point_id === this.activePointId ||
            connection.end_point_id === this.activePointId
        );

        this.bus.emit(EVENTS.CONNECTION_LIST_UI_UPDATE, {
            connections: currentMarkerConnections,
            unsavedConnections: this.unsavedConnections,
            activePointId: this.activePointId
        });
    }

    async #deleteConnection(connectionId) {
        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolat törlése", id: "deletingConnection", closable: false, autohide: false, spinner: true });

        try {
            await deleteConnection(connectionId);

            if (this.focusedConnectionId == connectionId) {
                this.focusedConnectionId = null;
            }

            if (this.draftConnectionDirections[connectionId]) {
                delete this.draftConnectionDirections[connectionId];
                this.bus.emit(EVENTS.UNSAVED_CONNECTION_DIRECTION_CHANGED, { areThereUnsaved: Object.keys(this.draftConnectionDirections).length > 0 });
            }
            this.connectionsList = this.connectionsList.filter(connection =>
                connection.connection_id != connectionId
            );

            this.#renderConnectionsForActiveMap();
            this.#emitConnectionListUpdate();

            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolat sikeresen törölve!", type: "success" });
        } catch (error) {
            console.error("Error deleting connection:", error);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a kapcsolat törlésekor!", type: "danger" });
        } finally {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "deletingConnection" });
        }
    }
}
