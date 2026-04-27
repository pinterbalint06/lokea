import { fetchConnections, saveUnsavedConnections, deleteConnection, saveDraftConnectionDirections } from "../shared/api.js";
import { ICONS } from "../../libs/icons/icons.js";
import { CONSTANTS } from "../shared/constants.js";
import { EVENTS } from "../shared/EventBus.js";
import { degreeToRadian } from "../../libs/math/mathUtils.js";

export class ConnectionManager {
    constructor(eventBus, mapViewer, appStore) {
        this.bus = eventBus;
        this.mapViewer = mapViewer;
        this.store = appStore;

        this.portalId = CONSTANTS.PORTAL_ID_START;
        this.portalMarkerIdsByConnection = {};

        this.connectionsList = [];

        this.focusedConnectionId = null;

        this.temporaryId = CONSTANTS.TEMP_ID;

        this.#bindBusEvents();
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.APP_INIT, async () => {
            await this.#loadConnections();
        });

        this.bus.on(EVENTS.POINTS_LOADED, () => {
            this.#renderConnectionsForActiveMap();
        });

        this.bus.on(EVENTS.MAP_SWITCHED, () => {
            this.#renderConnectionsForActiveMap();
            this.#updateActivePointConnectionsStore();
        });

        this.bus.on(EVENTS.MAP_DELETED, async ({ mapId }) => {
            const { unsavedConnections } = this.store.getState().activePoint;

            this.store.setState({
                activePoint: {
                    unsavedConnections: unsavedConnections.filter(connection =>
                        !this.#isConnectionOnMap(connection, mapId)
                    )
                }
            });
            this.connectionsList = this.connectionsList.filter(connection =>
                !this.#isConnectionOnMap(connection, mapId)
            );

            this.#renderConnectionsForActiveMap();
            this.#updateActivePointConnectionsStore();
        });

        this.bus.on(EVENTS.MARKER_SELECTED, () => {
            this.#renderConnectionsForActiveMap();
            this.#updateActivePointConnectionsStore();
        });

        this.bus.on(EVENTS.MAP_CLICKED, () => {
            if (this.store.getState().isConnecting) {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kattints egy térképjelölőre!", type: "danger", duration: 1500 });
            }
        });

        this.bus.on(EVENTS.MARKER_CLICKED, ({ id }) => {
            if (this.store.getState().isConnecting) {
                const activePointId = this.store.getState().activePoint.id;
                if (activePointId != id) {
                    if (!this.#hasConnection(activePointId, id)) {
                        let newConnection = {
                            connection_id: this.temporaryId,
                            start_point_id: activePointId,
                            end_point_id: id,
                            game_maps_id: this.store.getState().gameMapId,
                            start_map_id: this.store.getState().activePoint.mapId,
                            end_map_id: this.store.getState().activeMapId
                        };

                        if (newConnection.start_map_id != newConnection.end_map_id) {
                            newConnection.direction_start_to_end = 0;
                            newConnection.direction_end_to_start = 0;
                        }

                        this.#checkIdOrder(newConnection);

                        const { unsavedConnections } = this.store.getState().activePoint;
                        this.store.setState({
                            activePoint: {
                                unsavedConnections: [...unsavedConnections, newConnection]
                            }
                        });
                        this.#updateDirtyState();
                        this.temporaryId--;
                        this.#renderConnectionsForActiveMap();

                        this.bus.emit(EVENTS.NEW_CONNECTION_ADDED, { newConnection });

                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Új kapcsolat létrehozva!", type: "success" });
                        this.#cancelConnectingMode();
                        this.#updateActivePointConnectionsStore();
                    } else {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Ezek a jelölők már össze vannak kapcsolva!", type: "danger" });
                    }
                } else {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Ugyanarra a pontra kattintottál. Válassz másik pontot!", type: "danger" });
                }
            }
        });

        this.bus.on(EVENTS.UI_MARKER_EDITOR_CLOSING, () => {
            this.focusedConnectionId = null;
            this.store.setState({
                activePoint: {
                    connections: [],
                    unsavedConnections: [],
                    draftConnectionDirections: {}
                }
            });
            this.#updateDirtyState();
            this.#cancelConnectingMode();
            this.#renderConnectionsForActiveMap();
        });

        this.bus.on(EVENTS.UI_MARKER_EDITOR_CLOSED, () => this.#updateActivePointConnectionsStore());

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
                    const currentDrafts = this.store.getState().activePoint.draftConnectionDirections;
                    const draftConnectionDirections = { ...currentDrafts };
                    let hadUnsaved = Object.keys(currentDrafts).length > 0;
                    if (draftConnectionDirections[connectionId]) {
                        draftConnectionDirections[connectionId] = { ...draftConnectionDirections[connectionId] };
                    } else {
                        draftConnectionDirections[connectionId] = {};
                    }
                    if (this.#getConnectionById(connectionId)?.[direction] != value) {
                        draftConnectionDirections[connectionId][direction] = value;
                    } else {
                        delete draftConnectionDirections[connectionId][direction];
                        if (Object.keys(draftConnectionDirections[connectionId]).length == 0) {
                            delete draftConnectionDirections[connectionId];
                        }
                    }

                    this.store.setState({ activePoint: { draftConnectionDirections } });

                    let hasUnsaved = Object.keys(draftConnectionDirections).length > 0;
                    if (hasUnsaved != hadUnsaved) {
                        this.#updateDirtyState();
                    }
                }

                this.#renderConnectionsForActiveMap();
            }
        });

        this.bus.on(EVENTS.UI_SETTINGS_CONNECTION_OFF_MAP_VISIBILITY_CHANGED, ({ enabled }) => {
            this.store.setState({ settings: { showOffMapConnections: enabled } });
            this.#renderConnectionsForActiveMap();
        });

        this.bus.on(EVENTS.UI_SETTINGS_CONNECTION_ALL_VISIBILITY_CHANGED, ({ enabled }) => {
            this.store.setState({ settings: { showAllConnections: enabled } });
            this.#renderConnectionsForActiveMap();
        });

        this.bus.on(EVENTS.UI_POINT_SAVE_REQUESTED, () => {
            const lockReason = this.store.getState().isBusy.connection;
            if (!lockReason) {
                const { unsavedConnections, draftConnectionDirections } = this.store.getState().activePoint;
                if (this.store.getState().activePoint.id != CONSTANTS.TEMP_ID && (unsavedConnections.length > 0 || Object.keys(draftConnectionDirections).length > 0)) {
                    this.#saveConnections();
                }
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
            }
        });

        this.bus.on(EVENTS.MARKER_DELETED, ({ pointId }) => {
            this.connectionsList = this.connectionsList.filter(connection =>
                connection.start_point_id != pointId && connection.end_point_id != pointId
            );
            const { unsavedConnections } = this.store.getState().activePoint;
            this.store.setState({
                activePoint: {
                    unsavedConnections: unsavedConnections.filter(connection =>
                        connection.start_point_id != pointId && connection.end_point_id != pointId
                    )
                }
            });
            this.#renderConnectionsForActiveMap();
            this.#updateActivePointConnectionsStore();
        });

        this.bus.on(EVENTS.UI_CONNECTION_HIGHLIGHT, ({ connectionId, type }) => {
            if (this.store.getState().activePoint.id) {
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
            const lockReason = this.store.getState().isBusy.connection;
            if (!lockReason) {
                if (connectionId < 0) {
                    // unsaved connection
                    const { unsavedConnections } = this.store.getState().activePoint;
                    this.store.setState({
                        activePoint: {
                            unsavedConnections: unsavedConnections.filter(connection =>
                                connection.connection_id != connectionId
                            )
                        }
                    });
                    if (this.focusedConnectionId == connectionId) {
                        this.focusedConnectionId = null;
                    }
                    this.#renderConnectionsForActiveMap();
                    this.#updateActivePointConnectionsStore();
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolat sikeresen törölve!", type: "success" });
                } else {
                    await this.#deleteConnection(connectionId);
                }
                this.#updateDirtyState();
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
            }
        });

        this.bus.on(EVENTS.MARKER_MOVED, () => this.#renderConnectionsForActiveMap());
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

    #startConnectingMode() {
        if (!this.store.getState().isConnecting) {
            const activePointId = this.store.getState().activePoint.id;
            if (activePointId) {
                if (activePointId != CONSTANTS.TEMP_ID) {
                    this.store.setState({ isConnecting: true });
                    this.mapViewer.canvasInput.setDefaultCursor("crosshair");
                    let currentUnsavedConnections = this.store.getState().activePoint.unsavedConnections.length;
                    this.bus.emit(EVENTS.TOAST_SHOW, {
                        id: CONSTANTS.CONNECTION_TOAST_ID,
                        msg: "Kattints a végpontra!",
                        type: "info",
                        autohide: false,
                        callback: () => {
                            this.#cancelConnectingMode();
                            if (currentUnsavedConnections == this.store.getState().activePoint.unsavedConnections.length) {
                                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolat létrehozás megszakítva!", type: "info" });
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
                hasConnection = this.store.getState().activePoint.unsavedConnections.some(connection =>
                    (connection.start_point_id == startPointId && connection.end_point_id == endPointId) ||
                    (connection.start_point_id == endPointId && connection.end_point_id == startPointId)
                );
            }
        }

        return hasConnection;
    }

    #cancelConnectingMode() {
        if (this.store.getState().isConnecting) {
            this.store.setState({ isConnecting: false });
            this.mapViewer.canvasInput.setDefaultCursor("default");
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: CONSTANTS.CONNECTION_TOAST_ID });
        }
    }

    #isConnectionOnMap(connection, mapId) {
        return connection.start_map_id == mapId || connection.end_map_id == mapId;
    }

    async #saveConnections() {
        this.store.setState({ isBusy: { connection: "Kapcsolatok mentése folyamatban, kérlek várj!" } });
        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolatok mentése", type: "info", id: "savingConnections", closable: false, autohide: false, spinner: true });

        try {
            const state = this.store.getState();
            let { unsavedConnections, draftConnectionDirections } = state.activePoint;

            if (unsavedConnections.length > 0) {
                let saveNewResult = await saveUnsavedConnections(state.gameMapId, unsavedConnections);

                let newSaveSuccess = saveNewResult.saved.length;
                let newSaveFailed = saveNewResult.failed.length;

                if (newSaveSuccess > 0) {
                    saveNewResult.saved.forEach(connection => this.#checkIdOrder(connection));
                    this.connectionsList.push(...saveNewResult.saved);

                    unsavedConnections = unsavedConnections.filter(connection =>
                        !saveNewResult.saved.some(savedConn =>
                            savedConn.start_point_id == connection.start_point_id &&
                            savedConn.end_point_id == connection.end_point_id
                        )
                    );
                    this.store.setState({ activePoint: { unsavedConnections } });
                }

                for (let fail of saveNewResult.failed) {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: `Új kapcsolat mentése sikertelen: ${fail.message}`, type: "danger" });
                }

                if (newSaveSuccess > 0) {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${newSaveSuccess} új kapcsolat sikeresen mentve!`, type: "success", iconObject: ICONS.SAVE_FLOPPY });
                }
                if (newSaveFailed > 0) {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${newSaveFailed} új kapcsolat mentése sikertelen!`, type: "danger" });
                }
            }

            let draftIds = Object.keys(draftConnectionDirections);
            if (draftIds.length > 0) {
                let draftResult = await saveDraftConnectionDirections(draftConnectionDirections);

                let directionSaveSuccess = draftResult.saved.length;
                let directionSaveFailed = draftResult.failed.length;

                if (directionSaveSuccess > 0) {
                    let updatedDrafts = { ...draftConnectionDirections };
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
                        delete updatedDrafts[savedDraft.connection_id];
                    });
                    draftConnectionDirections = updatedDrafts;
                    this.store.setState({ activePoint: { draftConnectionDirections } });
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
            this.#updateActivePointConnectionsStore();
        } catch (error) {
            console.error("Error saving connections:", error);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a kapcsolatok mentésekor!", type: "danger" });
        } finally {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "savingConnections" });
            this.#updateDirtyState();
            this.store.setState({ isBusy: { connection: false } });
        }
    }

    async #loadConnections() {
        try {
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolatok betöltése", type: "info", id: "loadingConnections", closable: false, autohide: false, spinner: true });
            const gameMapID = this.store.getState().gameMapId;
            let connections = await fetchConnections(gameMapID);

            connections.forEach(conn => this.#checkIdOrder(conn));

            this.connectionsList = connections;
            this.bus.emit(EVENTS.CONNECTIONS_LOADED, { connections: this.connectionsList });
            this.#renderConnectionsForActiveMap();
            this.#updateActivePointConnectionsStore();
        } catch (error) {
            console.error("Error loading connections:", error);
        } finally {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "loadingConnections" });
        }
    }

    #getConnectionById(connectionId) {
        let connection = this.connectionsList.find(connection => connection.connection_id == connectionId);

        if (!connection) {
            connection = this.store.getState().activePoint.unsavedConnections.find(connection => connection.connection_id == connectionId);
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

        let draftAngle = this.store.getState().activePoint.draftConnectionDirections[connection.connection_id]?.[direction];
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
            this.mapViewer.placeMarkerByImageCoordinates(
                this.portalId,
                targetX,
                targetY,
                CONSTANTS.PORTAL_MARKER_SIZE.width,
                CONSTANTS.PORTAL_MARKER_SIZE.height,
                "portal"
            );
            this.mapViewer.setMarkerSelectable(this.portalId, false);
            this.portalMarkerIdsByConnection[connection.connection_id] = this.portalId;

            portalMarkerId = this.portalId;
            this.portalId--;
        }

        this.mapViewer.connectMarkers(existingMarkerId, portalMarkerId, connection.connection_id, lineType);
    }

    #renderConnectionsForActiveMap() {
        let activePortalConnections = [];

        this.mapViewer.clearLines();

        const state = this.store.getState();
        const settings = state.settings;
        for (const connection of this.connectionsList) {
            let startExists = this.mapViewer.doesMarkerExist(connection.start_point_id);
            let endExists = this.mapViewer.doesMarkerExist(connection.end_point_id);
            const activePointId = state.activePoint.id;
            let isActive = (activePointId == connection.start_point_id || activePointId == connection.end_point_id);

            if (settings.showAllConnections || isActive) {
                if (startExists && endExists) {
                    let lineType = isActive ? "editing" : "default";
                    this.mapViewer.connectMarkers(connection.start_point_id, connection.end_point_id, connection.connection_id, lineType);
                } else {
                    let shouldRenderOffMap = (
                        (settings.showAllConnections && settings.showOffMapConnections) || isActive) &&
                        (startExists != endExists);
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

        for (let unsavedConnection of state.activePoint.unsavedConnections) {
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

    #updateActivePointConnectionsStore() {
        const activePointId = this.store.getState().activePoint.id;

        let currentMarkerConnections = [];
        if (activePointId) {
            currentMarkerConnections = this.connectionsList.filter(connection =>
                connection.start_point_id == activePointId ||
                connection.end_point_id == activePointId
            );
        }

        this.store.setState({
            activePoint: {
                connections: currentMarkerConnections
            }
        });
    }

    async #deleteConnection(connectionId) {
        this.store.setState({ isBusy: { connection: "Kapcsolat törlése folyamatban, kérlek várj!" } });
        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolat törlése", type: "info", id: "deletingConnection", closable: false, autohide: false, spinner: true });

        try {
            await deleteConnection(connectionId);

            if (this.focusedConnectionId == connectionId) {
                this.focusedConnectionId = null;
            }

            const { draftConnectionDirections } = this.store.getState().activePoint;
            if (draftConnectionDirections[connectionId]) {
                const newDrafts = { ...draftConnectionDirections };
                delete newDrafts[connectionId];
                this.store.setState({
                    activePoint: {
                        draftConnectionDirections: newDrafts
                    }
                });
            }
            this.connectionsList = this.connectionsList.filter(connection =>
                connection.connection_id != connectionId
            );

            this.#renderConnectionsForActiveMap();
            this.#updateActivePointConnectionsStore();

            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolat sikeresen törölve!", type: "success" });
        } catch (error) {
            console.error("Error deleting connection:", error);
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Hiba a kapcsolat törlésekor!", type: "danger" });
        } finally {
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: "deletingConnection" });
            this.store.setState({ isBusy: { connection: false } });
        }
    }

    #updateDirtyState() {
        const { unsavedConnections, draftConnectionDirections } = this.store.getState().activePoint;
        const hasUnsaved = unsavedConnections.length > 0 || Object.keys(draftConnectionDirections).length > 0;
        this.store.setState({ activePoint: { isDirty: { connections: hasUnsaved } } });
    }
}
