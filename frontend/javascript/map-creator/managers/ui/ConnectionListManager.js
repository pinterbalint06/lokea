import { EVENTS } from "../../shared/EventBus.js";
import { HoldToUnlockButton } from "../../../libs/elements/HoldToUnlockButton.js";
import { DegreeInput } from "../../../libs/elements/DegreeInput.js";

export class ConnectionListManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;

        this.elements = {};
        this.lastRenderedActivePointId = null;
        this.lastRenderedConnectionCount = -1;

        this.#gatherElements();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements.connectionsList = document.getElementById("kapcsolatokLista");
        this.elements.emptyConnections = document.getElementById("nincsenekKapcsolatok");
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.STATE_UPDATED, () => {
            const activePoint = this.store.getState().activePoint;
            const totalConnectionCount = activePoint.connections.length + activePoint.unsavedConnections.length;
            const shouldRerender = this.lastRenderedActivePointId != activePoint.id || this.lastRenderedConnectionCount != totalConnectionCount;

            if (shouldRerender) {
                this.#renderConnectionList(activePoint.connections, activePoint.unsavedConnections, activePoint.id, activePoint.draftConnectionDirections);
                this.lastRenderedActivePointId = activePoint.id;
                this.lastRenderedConnectionCount = totalConnectionCount;
            }
        });
    }

    #bindDegreeInput(connection, wrapper, directionField, draftDirections) {
        if (wrapper) {
            let initialValue = draftDirections[connection.connection_id]?.[directionField] ?? connection[directionField] ?? 0;

            let degreeInput = new DegreeInput(wrapper, { value: initialValue });

            degreeInput.addEventListener("input", (event) => {
                this.bus.emit(EVENTS.UI_CONNECTION_DIRECTION_UPDATE, {
                    connectionId: connection.connection_id,
                    direction: directionField,
                    value: event.detail.value
                });
            });

            degreeInput.addEventListener("change", (event) => {
                this.bus.emit(EVENTS.UI_CONNECTION_DIRECTION_UPDATE, {
                    connectionId: connection.connection_id,
                    direction: directionField,
                    value: event.detail.value
                });
            });

            degreeInput.addEventListener("error", (event) => {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: event.detail.message, type: "danger" });
            });
        };
    }

    #renderConnectionList(connections, unsavedConnections, activePointId, draftDirections) {
        this.elements.connectionsList.innerHTML = "";

        let allConnections = [...connections, ...unsavedConnections];

        if (allConnections.length == 0) {
            this.elements.emptyConnections.classList.remove("d-none");
            this.elements.connectionsList.classList.add("d-none");
        } else {
            this.elements.emptyConnections.classList.add("d-none");
            this.elements.connectionsList.classList.remove("d-none");

            let template = document.getElementById("connection-card-template");
            let fragment = new DocumentFragment();

            for (let i = 0; i < allConnections.length; i++) {
                let connection = allConnections[i];
                let clone = template.content.cloneNode(true);

                clone.querySelector(".start-id").innerText = connection.start_point_id;
                clone.querySelector(".end-id").innerText = connection.end_point_id;

                let card = clone.querySelector(".kapcsolat-kartya");

                let isCrossMap = connection.start_map_id != connection.end_map_id;
                let directionWrapper = clone.querySelector(".connection-direction-wrapper");

                if (isCrossMap) {
                    directionWrapper.classList.remove("d-none");

                    let currentWrapper = clone.querySelector(".direction-toward-current-wrapper");
                    let otherWrapper = clone.querySelector(".direction-toward-other-wrapper");

                    currentWrapper.addEventListener("click", (e) => e.stopPropagation());
                    otherWrapper.addEventListener("click", (e) => e.stopPropagation());

                    let currentPointField = (activePointId == connection.start_point_id) ? "direction_end_to_start" : "direction_start_to_end";
                    let otherMapField = (activePointId == connection.start_point_id) ? "direction_start_to_end" : "direction_end_to_start";

                    this.#bindDegreeInput(connection, currentWrapper, currentPointField, draftDirections);
                    this.#bindDegreeInput(connection, otherWrapper, otherMapField, draftDirections);
                } else {
                    if (directionWrapper) {
                        directionWrapper.remove();
                    }
                }

                card.addEventListener("mouseenter", () => {
                    this.bus.emit(EVENTS.UI_CONNECTION_HIGHLIGHT, {
                        connectionId: connection.connection_id,
                        type: "focused"
                    });
                });

                card.addEventListener("click", () => {
                    this.bus.emit(EVENTS.UI_CONNECTION_CENTER_VIEW, {
                        connectionId: connection.connection_id
                    });
                });

                card.addEventListener("mouseleave", () => {
                    let type = connection.connection_id < 0 ? "unsaved" : "editing";
                    this.bus.emit(EVENTS.UI_CONNECTION_HIGHLIGHT, {
                        connectionId: connection.connection_id,
                        type: type
                    });
                });

                let deleteBtn = clone.querySelector(".btn-delete-connection");
                let holdToDeleteBtn = new HoldToUnlockButton(deleteBtn, 1000);
                holdToDeleteBtn.addEventListener("confirm", (event) => {
                    event.detail.originalEvent.stopPropagation();
                    this.bus.emit(EVENTS.UI_CONNECTION_DELETE_REQUEST, {
                        connectionId: connection.connection_id,
                        startPointId: connection.start_point_id,
                        endPointId: connection.end_point_id
                    });
                });

                let startPoint = clone.querySelector(".start-point");

                startPoint.addEventListener("click", (event) => {
                    event.stopPropagation();
                    this.bus.emit(EVENTS.UI_POINT_CENTER_VIEW, {
                        targetPointId: connection.start_point_id,
                        targetMapId: connection.start_map_id
                    });
                });

                let endPoint = clone.querySelector(".end-point");

                endPoint.addEventListener("click", (event) => {
                    event.stopPropagation();
                    this.bus.emit(EVENTS.UI_POINT_CENTER_VIEW, {
                        targetPointId: connection.end_point_id,
                        targetMapId: connection.end_map_id
                    });
                });

                fragment.appendChild(clone);
            }

            this.elements.connectionsList.appendChild(fragment);
        }
    }
}
