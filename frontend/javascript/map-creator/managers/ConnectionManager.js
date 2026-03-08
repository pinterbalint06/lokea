import { fetchConnections, saveUnsavedConnections, deleteConnection } from "../shared/api.js";
import { ICONS } from "../../libs/icons/icons.js";
import { CONSTANTS } from "../shared/constants.js";
import { EVENTS } from "../events/EventBus.js";

export class ConnectionManager {
    constructor(eventBus, mapViewer, appState) {
        this.bus = eventBus;
        this.mapViewer = mapViewer;
        this.appState = appState; // gameMapId, activeMapId

        this.connectionsList = [];
        this.unsavedConnections = [];
        this.isConnecting = false;
        this.activePointId = null;
        this.temporaryId = -1;
        this.isSaving = false;
        this.connectionToastId = "connectionMode";
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
            this.activePointId = null;
            this.#cancelConnectingMode();
            this.#renderConnectionsForActiveMap();
            this.#emitConnectionListUpdate();
        });

        this.bus.on(EVENTS.MARKER_SELECTED, ({ id }) => {
            this.activePointId = id;
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
        });

        this.bus.on(EVENTS.MARKER_PLACING_STARTED, () => {
            this.activePointId = CONSTANTS.TEMP_ID;
        });

        this.bus.on(EVENTS.MARKER_PLACING_CANCELLED, () => {
            this.activePointId = null;
        });

        this.bus.on(EVENTS.MAP_CLICKED, () => {
            if (this.isConnecting) {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kattints egy térképjelölőre!", type: "danger", duration: 1500 });
            }
        });

        this.bus.on(EVENTS.MARKER_CLICKED, ({ id }) => {
            if (this.isConnecting) {
                if (this.activePointId != id) {
                    if (!this.mapViewer.isAlreadyConnected(this.activePointId, id)) {
                        this.mapViewer.connectMarkers(this.activePointId, id, this.temporaryId, "unsaved");
                        let newConnection = {
                            connection_id: this.temporaryId,
                            start_point_id: this.activePointId,
                            end_point_id: id,
                            game_maps_id: this.appState.activeMapId
                        };
                        this.unsavedConnections.push(newConnection);
                        this.temporaryId--;

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
            this.unsavedConnections = [];
            this.#cancelConnectingMode();
            this.#renderConnectionsForActiveMap();
        });

        this.bus.on(EVENTS.UI_COLLAPSE_HIDDEN, () => this.#emitConnectionListUpdate());

        this.bus.on(EVENTS.UI_CONNECTION_CREATE_REQUEST, () => {
            this.#startConnectingMode();
        });

        this.bus.on(EVENTS.UI_POINT_SAVE_REQUESTED, async () => {
            if (this.activePointId != CONSTANTS.TEMP_ID && this.unsavedConnections.length > 0) {
                this.#saveConnections();
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
            this.mapViewer.changeLineType(connectionId, type);
        });

        this.bus.on(EVENTS.UI_CONNECTION_CENTER_VIEW, ({ startPointId, endPointId }) => {
            let pos1 = this.mapViewer.getMarkerPosition(startPointId);
            let pos2 = this.mapViewer.getMarkerPosition(endPointId);
            let centerX = (pos1.x + pos2.x) / 2;
            let centerY = (pos1.y + pos2.y) / 2;
            this.mapViewer.moveTo(centerX, centerY);
        });

        this.bus.on(EVENTS.UI_CONNECTION_DELETE_REQUEST, async ({ connectionId, startPointId, endPointId }) => {
            if (connectionId < 0) {
                // unsaved connection
                this.unsavedConnections = this.unsavedConnections.filter(connection =>
                    connection.connection_id != connectionId
                );
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

    #cancelConnectingMode() {
        if (this.isConnecting) {
            this.isConnecting = false;
            this.mapViewer.canvasInput.setDefaultCursor("default");
            this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: this.connectionToastId });
            this.bus.emit(EVENTS.CONNECTION_MODE_CHANGED, { isConnecting: false });
        }
    }

    async #saveConnections() {
        this.isSaving = true;
        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolatok mentése", id: "savingConnections", closable: false, autohide: false, spinner: true });

        try {
            let result = await saveUnsavedConnections(this.appState.gameMapID, this.unsavedConnections);

            let successCount = result.saved.length;
            let failedCount = result.failed.length;

            if (successCount > 0) {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${successCount} kapcsolat sikeresen mentve!`, type: "success", iconObject: ICONS.SAVE_FLOPPY });
                this.connectionsList.push(...result.saved);

                this.unsavedConnections = this.unsavedConnections.filter(connection =>
                    !result.saved.some(savedConn =>
                        savedConn.start_point_id == connection.start_point_id &&
                        savedConn.end_point_id == connection.end_point_id
                    )
                );

                this.bus.emit(EVENTS.CONNECTIONS_SAVED, { successCount });
            }

            if (failedCount > 0) {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: `${failedCount} kapcsolat mentése sikertelen!`, type: "danger" });
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

    async #loadConnections() {
        try {
            const gameMapID = this.appState.gameMapID;
            let connections = await fetchConnections(gameMapID);

            this.connectionsList = connections;
            this.bus.emit(EVENTS.CONNECTIONS_LOADED, { connections: this.connectionsList });
            this.#renderConnectionsForActiveMap();
            this.#emitConnectionListUpdate();
        } catch (error) {
            console.error("Error loading connections:", error);
        }
    }

    #renderConnectionsForActiveMap() {
        this.mapViewer.clearLines();

        let connectionsForActiveMap = this.connectionsList.filter(connection =>
            this.mapViewer.doesMarkerExist(connection.start_point_id) &&
            this.mapViewer.doesMarkerExist(connection.end_point_id)
        );

        for (let i = 0; i < connectionsForActiveMap.length; i++) {
            let type = "default";
            if (this.activePointId == connectionsForActiveMap[i].start_point_id ||
                this.activePointId == connectionsForActiveMap[i].end_point_id) {
                type = "editing";
            }
            this.mapViewer.connectMarkers(
                connectionsForActiveMap[i].start_point_id,
                connectionsForActiveMap[i].end_point_id,
                connectionsForActiveMap[i].connection_id,
                type
            );
        }

        for (let i = 0; i < this.unsavedConnections.length; i++) {
            if (this.mapViewer.doesMarkerExist(this.unsavedConnections[i].start_point_id) &&
                this.mapViewer.doesMarkerExist(this.unsavedConnections[i].end_point_id)) {
                this.mapViewer.connectMarkers(
                    this.unsavedConnections[i].start_point_id,
                    this.unsavedConnections[i].end_point_id,
                    this.unsavedConnections[i].connection_id,
                    "unsaved"
                );
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
            unsavedConnections: this.unsavedConnections
        });
    }

    async #deleteConnection(connectionId) {
        this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Kapcsolat törlése", id: "deletingConnection", closable: false, autohide: false, spinner: true });

        try {
            await deleteConnection(connectionId);

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