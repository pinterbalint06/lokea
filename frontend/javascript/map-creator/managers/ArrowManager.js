import { degreeToRadian, normalizeAngleRadians } from "../../libs/math/mathUtils.js";
import { EVENTS } from "../shared/EventBus.js";

export class ArrowManager {
    constructor(eventBus, mapViewer, equirectangularViewer, appStore) {
        this.bus = eventBus;
        this.mapViewer = mapViewer;
        this.equirectangularViewer = equirectangularViewer;
        this.store = appStore;
        this.sameMapHeadingCache = {};

        this.#bindBusEvents();
    }

    #bindBusEvents() {
        const clearEvents = [
            EVENTS.UI_EQUIRECTANGULAR_FILE_DROPPED,
            EVENTS.UI_MARKER_EDITOR_CLOSING,
            EVENTS.MARKER_DELETED
        ];
        for (const eventName of clearEvents) {
            this.bus.on(eventName, () => this.equirectangularViewer.clearArrows());
        }

        const renderEvents = [
            EVENTS.MARKER_SELECTED,
            EVENTS.MAP_SWITCHED,
            EVENTS.EQUIRECTANGULAR_IMAGE_LOADED,
            EVENTS.NEW_CONNECTION_ADDED,
            EVENTS.MARKER_MOVED,
            EVENTS.UI_SETTINGS_CONNECTION_OFF_MAP_VISIBILITY_CHANGED,
            EVENTS.UI_CONNECTION_DIRECTION_UPDATE,
            EVENTS.STATE_UPDATED
        ];
        for (const eventName of renderEvents) {
            this.bus.on(eventName, () => this.#renderArrowsForActivePoint());
        }

        this.bus.on(EVENTS.UI_CONNECTION_DELETE_REQUEST, () => {
            this.sameMapHeadingCache = {};
            this.#renderArrowsForActivePoint();
        });
    }

    #renderArrowsForActivePoint() {
        const state = this.store.getState();
        const activePointId = state.activePoint.id;
        this.equirectangularViewer.clearArrows();

        if (activePointId) {
            const visibleConnections = [...state.activePoint.connections, ...state.activePoint.unsavedConnections];
            const draftConnectionDirections = state.activePoint.draftConnectionDirections;

            for (const connection of visibleConnections) {
                const directionField = this.#getDirectionField(connection, activePointId);
                const headingRadians = this.#getHeadingRadians(connection, activePointId, directionField, draftConnectionDirections);
                const targetPointId = this.#getTargetPointId(connection, activePointId);
                const targetMapId = this.#getTargetMapId(connection, activePointId);

                if (Number.isFinite(headingRadians) && targetPointId != null && targetMapId != null) {
                    this.equirectangularViewer.addArrowFromHeading(
                        connection.connection_id,
                        headingRadians,
                        () => {
                            this.bus.emit(EVENTS.UI_POINT_CENTER_VIEW, {
                                targetPointId,
                                targetMapId
                            });
                        }
                    );
                }
            }
        }
    }

    #getDirectionField(connection, activePointId) {
        return connection.start_point_id == activePointId
            ? "direction_start_to_end"
            : "direction_end_to_start";
    }

    #getHeadingRadians(connection, activePointId, directionField, draftConnectionDirections) {
        let headingRadians = null;
        const isCrossMap = connection.start_map_id != connection.end_map_id;

        if (isCrossMap) {
            let directionDegrees = draftConnectionDirections[connection.connection_id]?.[directionField]
                ?? connection[directionField];

            if (directionDegrees != undefined) {
                headingRadians = degreeToRadian(directionDegrees);
            }
        } else {
            const targetPointId = this.#getTargetPointId(connection, activePointId);
            const activeExists = this.mapViewer.doesMarkerExist(activePointId);
            const targetExists = targetPointId != null && this.mapViewer.doesMarkerExist(targetPointId);

            if (activeExists && targetExists) {
                const sourcePosition = this.mapViewer.getMarkerPosition(activePointId);
                const targetPosition = this.mapViewer.getMarkerPosition(targetPointId);
                const vectorX = targetPosition.x - sourcePosition.x;
                const vectorY = targetPosition.y - sourcePosition.y;

                headingRadians = normalizeAngleRadians(Math.atan2(vectorY, vectorX) + Math.PI / 2); // add 90 degrees so it points up
                this.sameMapHeadingCache[connection.connection_id] = headingRadians;
            } else {
                headingRadians = this.sameMapHeadingCache[connection.connection_id];
            }
        }

        return headingRadians;
    }

    #getTargetPointId(connection, activePointId) {
        let targetPointId = null;

        if (connection.start_point_id == activePointId) {
            targetPointId = connection.end_point_id;
        } else {
            if (connection.end_point_id == activePointId) {
                targetPointId = connection.start_point_id;
            }
        }

        return targetPointId;
    }

    #getTargetMapId(connection, activePointId) {
        let targetMapId = null;

        if (connection.start_point_id == activePointId) {
            targetMapId = connection.end_map_id;
        } else {
            if (connection.end_point_id == activePointId) {
                targetMapId = connection.start_map_id;
            }
        }

        return targetMapId;
    }
}
