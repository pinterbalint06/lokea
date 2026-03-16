import { EVENTS } from "../../events/EventBus.js";
import { HoldToUnlockButton } from "../../../libs/elements/HoldToUnlockButton.js";

export class ConnectionListManager {
    constructor(eventBus) {
        this.bus = eventBus;

        this.elements = {};

        this.#gatherElements();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements.connectionsList = document.getElementById("kapcsolatokLista");
        this.elements.emptyConnections = document.getElementById("nincsenekKapcsolatok");
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.CONNECTION_LIST_UI_UPDATE, ({ connections, unsavedConnections }) => {
            this.#renderConnectionList(connections, unsavedConnections);
        });
    }

    #renderConnectionList(connections, unsavedConnections) {
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