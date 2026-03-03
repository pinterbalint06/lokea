import { fetchConnections } from "../api.js";
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
        });



        this.bus.on(EVENTS.UI_COLLAPSE_CLOSE_REQUESTED, (request) => {
            if (this.isSaving) {
                request.canProceed = false;
                request.reason = "Kapcsolatok mentése folyamatban, kérlek várj!";
            }
        });

        this.bus.on(EVENTS.MAP_SWITCH_REQUESTED, (request) => {
            if (this.isSaving) {
                request.canProceed = false;
                request.reason = "Kapcsolatok mentése folyamatban, kérlek várj!";
            }
        });

        this.bus.on(EVENTS.UI_ADD_NEW_MAP_REQUEST, (request) => {
            if (this.isSaving) {
                request.canProceed = false;
                request.reason = "Kapcsolatok mentése folyamatban, kérlek várj!";
            }
        });
    }

    async #loadConnections() {
        try {
            const gameMapID = this.appState.gameMapID;
            let connections = await fetchConnections(gameMapID);

            this.connectionsList = connections;
            this.bus.emit(EVENTS.CONNECTIONS_LOADED, { connections: this.connectionsList });
            this.#renderConnectionsForActiveMap();
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
}