import { EVENTS } from "../events/EventBus.js";
import { CONSTANTS, ICONS } from "../shared/constants.js";
import { showToast, createSvgIcon, createSpinnerIcon, savePreviousValue } from "../shared/utils.js";

export class UIManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.elements = {};
        this.toasts = {};
        this.animations = {
            isCollapsing: false
        };
        this.connectionUiState = {
            hasEnoughPoints: false,
            isConnecting: false
        };

        this.#gatherElements();
        this.#updateCollapseDirection();
        this.#bindUIEvents();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements = {
            // buttons
            saveMapButton: document.getElementById("saveMapButton"),
            uploadButtonMap: document.getElementById("uploadBtn"),
            addNewMarkerBtn: document.getElementById("plusBtn"),
            uploadButtonEquirectangular: document.getElementById("uploadEquirectangularBtn"),
            savePointButton: document.getElementById("savePointButton"),
            equiFullscreenBtn: document.getElementById("equirectangularFullscreen"),
            closeCollapse: document.getElementById("closeCollapse"),
            addNewMapBtn: document.getElementById("addNewMapBtn"),
            newConnectionBtn: document.getElementById("kapcsolatLetrehozasaBtn"),

            // inputs
            fileInputMap: document.getElementById("fileInput"),
            fileInputEquirectangular: document.getElementById("fileInputEquirectangular"),
            coordinateXInput: document.getElementById("coordinateX"),
            coordinateYInput: document.getElementById("coordinateY"),
            mapSelect: document.getElementById("mapSelect"),
            northDirectionRange: document.getElementById("northDirectionRange"),
            northDirection: document.getElementById("northDirection"),

            // canvas
            mapCanvas: document.getElementById(CONSTANTS.MAP_CANVAS_ID),
            equirectangularPreview: document.getElementById(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID),

            // drop zone
            dropZoneMap: document.getElementById("drop-zone"),
            dropZoneEquirectangular: document.getElementById("drop-zone-equirectangular"),

            // other
            loadingOverlay: document.getElementById("loading"),
            uploadOverlay: document.getElementById("upload-overlay"),
            toastPlace: document.getElementById("toastPlace"),
            collapseElement: document.getElementById("ujPontCollapse"),
            mapSelector: document.getElementById("mapSelector"),
            floatingButtonDiv: document.getElementById("floatingButtonDiv"),
            connectionsList: document.getElementById("kapcsolatokLista"),
            emptyConnections: document.getElementById("nincsenekKapcsolatok")
        };

        this.elements.collapseBootstrapElement = new bootstrap.Collapse(
            this.elements.collapseElement,
            {
                toggle: false
            }
        );

        this.elements.savePointButton.disabled = true;
    }

    #bindUIEvents() {
        this.elements.mapSelect.addEventListener("change", (event) => this.bus.emit(EVENTS.UI_SWITCH_MAP_REQUEST, { mapId: parseInt(event.target.value) }));
        this.elements.addNewMarkerBtn.addEventListener("click", () => this.bus.emit(EVENTS.UI_ADD_NEW_MARKER_REQUEST));
        this.elements.saveMapButton.addEventListener("click", () => this.bus.emit(EVENTS.UI_SAVE_MAP_CLICKED));
        this.elements.newConnectionBtn.addEventListener("click", () => this.bus.emit(EVENTS.UI_CONNECTION_CREATE_REQUEST));

        let coordInputs = [this.elements.coordinateXInput, this.elements.coordinateYInput];
        coordInputs.forEach(coordinateInput => {
            coordinateInput.addEventListener("focus", savePreviousValue);
            coordinateInput.addEventListener("change", (e) => {
                this.bus.emit(EVENTS.UI_COORDINATE_CHANGED, { x: this.elements.coordinateXInput.valueAsNumber, y: this.elements.coordinateYInput.valueAsNumber, event: e });
            });
        });

        this.elements.northDirection.addEventListener("focus", savePreviousValue);
        this.elements.northDirection.addEventListener("change", (event) => {
            let degree = event.target.valueAsNumber;
            if (0 <= degree && degree <= 359) {
                event.target.dataset.previousValue = event.target.valueAsNumber;
                this.elements.northDirectionRange.value = degree;
                this.bus.emit(EVENTS.UI_NORTH_DIRECTION_CHANGED, { northDirection: this.elements.northDirection.valueAsNumber });
            } else {
                event.target.value = event.target.dataset.previousValue;
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "A szögnek 0 és 359 között kell lennie!", type: "danger" });
            }
        });


        this.elements.northDirectionRange.addEventListener("input", (e) => {
            this.elements.northDirection.value = e.target.value;
            this.bus.emit(EVENTS.UI_NORTH_DIRECTION_CHANGED, { northDirection: this.elements.northDirection.valueAsNumber });
        });

        this.elements.collapseElement.addEventListener("show.bs.collapse", (event) => {
            if (event.target == this.elements.collapseElement) {
                this.animations.isCollapsing = true;
                this.elements.floatingButtonDiv.classList.add("d-none");
                this.bus.emit(EVENTS.UI_COLLAPSE_SHOW_STARTED);
            }
        });

        this.elements.collapseElement.addEventListener("shown.bs.collapse", (event) => {
            if (event.target == this.elements.collapseElement) {
                this.animations.isCollapsing = false;
            }
        });

        this.elements.collapseElement.addEventListener("hide.bs.collapse", (event) => {
            if (event.target == this.elements.collapseElement) {
                let request = { canProceed: true, reason: "" };

                this.bus.emit(EVENTS.UI_COLLAPSE_CLOSE_REQUESTED, request);

                if (request.canProceed) {
                    this.animations.isCollapsing = true;
                    this.elements.savePointButton.disabled = true;
                    this.bus.emit(EVENTS.UI_COLLAPSE_HIDE_STARTED);
                } else {
                    event.preventDefault();
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
                }
            }
        });

        this.elements.collapseElement.addEventListener("hidden.bs.collapse", (event) => {
            if (event.target == this.elements.collapseElement) {
                this.animations.isCollapsing = false;
                this.elements.northDirection.value = 0;
                this.elements.northDirectionRange.value = 0;
                this.elements.savePointButton.disabled = true;
                this.bus.emit(EVENTS.UI_COLLAPSE_HIDDEN);
            }
        });

        this.elements.addNewMapBtn.addEventListener("click", (event) => {
            let request = { canProceed: true, reason: "" };

            this.bus.emit(EVENTS.UI_ADD_NEW_MAP_REQUEST, request);

            if (request.canProceed) {
                this.elements.fileInputMap.value = "";
                this.elements.fileInputMap.click();
            } else {
                event.preventDefault();
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
            }
        });

        this.elements.savePointButton.addEventListener("click", () => {
            this.bus.emit(EVENTS.UI_POINT_SAVE_REQUESTED);
        });

        this.elements.equiFullscreenBtn.addEventListener("click", () => this.bus.emit(EVENTS.UI_EQUIRECTANGULAR_FULLSCREEN_REQUEST));

        this.elements.closeCollapse.addEventListener("click", () => {
            // "hide.bs.collapse" event will be called and handles the rest
            this.elements.collapseBootstrapElement.hide();
        });

        window.addEventListener("keyup", (event) => {
            if (event.key == "Escape" && this.elements.collapseBootstrapElement) {
                this.elements.collapseBootstrapElement.hide();
            }
        });

        window.addEventListener("resize", () => this.#updateCollapseDirection());

        this.#setupUploadHandler(this.elements.dropZoneMap, this.elements.uploadButtonMap, this.elements.fileInputMap, EVENTS.UI_MAP_FILE_DROPPED);
        this.#setupUploadHandler(this.elements.dropZoneEquirectangular, this.elements.uploadButtonEquirectangular, this.elements.fileInputEquirectangular, EVENTS.UI_EQUIRECTANGULAR_FILE_DROPPED);
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_SWITCHED, ({ mapId }) => {
            this.elements.collapseBootstrapElement.hide();
            this.elements.mapSelect.value = mapId;
            this.connectionUiState.hasEnoughPoints = false;
            this.connectionUiState.isConnecting = false;
            this.#updateNewConnectionButtonState();
        });

        this.bus.on(EVENTS.MARKER_PLACING_STARTED, () => this.elements.floatingButtonDiv.classList.add("d-none"));

        this.bus.on(EVENTS.MARKER_PLACING_CANCELLED, () => this.elements.floatingButtonDiv.classList.remove("d-none"));

        this.bus.on(EVENTS.TOAST_SHOW, ({ id, msg, type, closable = true, iconObject, duration = 3000, autohide = true, spinner = false, callback }) => {
            let icon;
            if (spinner) {
                icon = createSpinnerIcon();
            } else {
                icon = iconObject ? createSvgIcon(iconObject, "1em") : null;
            }
            let options = { autohide, delay: duration };
            let toast = showToast(this.elements.toastPlace, msg, type, closable, options, icon, callback);
            if (id) {
                this.toasts[id] = toast
            };
        });

        this.bus.on(EVENTS.TOAST_HIDE_ID, ({ id }) => {
            if (this.toasts[id]) {
                this.toasts[id].hide();
                delete this.toasts[id];
            }
        });

        this.bus.on(EVENTS.NEW_MARKER_PLACED, () => this.elements.collapseBootstrapElement.show());

        this.bus.on(EVENTS.MARKER_MOVED, ({ x, y }) => this.#updateCoordinatesInput(x, y));

        this.bus.on(EVENTS.HIDE_LOADING, () => this.elements.loadingOverlay.classList.add("d-none"));

        this.bus.on(EVENTS.POINTS_LOADED, ({ points }) => {
            this.connectionUiState.hasEnoughPoints = Object.keys(points).length >= 2;
            this.#updateNewConnectionButtonState();
        });

        this.bus.on(EVENTS.MAPS_LOADED, ({ maps }) => {
            let hasMaps = Object.keys(maps).length > 0;
            if (hasMaps) {
                this.elements.uploadOverlay.classList.add("d-none");
                this.elements.mapSelector.classList.remove("d-none");
                this.elements.saveMapButton.disabled = true;
                this.connectionUiState.hasEnoughPoints = false;
                this.connectionUiState.isConnecting = false;
                this.#updateNewConnectionButtonState();

                this.#updateMapSelector(maps);
            } else {
                this.elements.uploadOverlay.classList.remove("d-none");
                this.elements.mapSelector.classList.add("d-none");
                this.connectionUiState.hasEnoughPoints = false;
                this.connectionUiState.isConnecting = false;
                this.#updateNewConnectionButtonState();
            }
        });

        this.bus.on(EVENTS.CONNECTION_MODE_CHANGED, ({ isConnecting }) => {
            this.connectionUiState.isConnecting = isConnecting;
            this.#updateNewConnectionButtonState();
        });

        this.bus.on(EVENTS.CONNECTION_LIST_UI_UPDATE, ({ connections, unsavedConnections }) => {
            this.#renderConnectionList(connections, unsavedConnections);
        });

        this.bus.on(EVENTS.MARKER_SELECTED, ({ position, data }) => {
            this.elements.coordinateXInput.value = position.x;
            this.elements.coordinateYInput.value = position.y;
            this.elements.northDirection.value = data ? data.north_direction : 0;
            this.elements.northDirectionRange.value = data ? data.north_direction : 0;
            this.#showCollapse();
        });

        this.bus.on(EVENTS.NEW_MAP_LOADED, ({ maps, loadedMapId }) => {
            this.elements.mapSelector.classList.remove("d-none");
            this.elements.uploadOverlay.classList.add("d-none");
            this.#updateMapSelector(maps);
            this.elements.mapSelect.value = loadedMapId;
        });

        this.bus.on(EVENTS.MAP_SAVE_STARTED, () => this.elements.saveMapButton.disabled = true);

        this.bus.on(EVENTS.MAP_SAVE_AVAILABILITY_CHANGED, ({ canSave }) => this.elements.saveMapButton.disabled = !canSave);

        this.bus.on(EVENTS.MAP_SWITCH_REQUEST_REJECTED, ({ revertToId }) => this.elements.mapSelect.value = revertToId);

        this.bus.on(EVENTS.POINT_DIRTY_STATE_CHANGED, ({ isDirty }) => {
            this.elements.savePointButton.disabled = !isDirty;
        });
    }

    #setupUploadHandler(dropZone, button, input, eventToEmit) {
        button.addEventListener("click", () => input.click());
        input.addEventListener("change", (event) => {
            if (event.target.files.length > 0) {
                this.bus.emit(eventToEmit, { file: event.target.files[0] });
            }
            event.target.value = "";
        });

        dropZone.addEventListener("dragover", (event) => {
            event.preventDefault();
            let draggedFiles = event.dataTransfer.items.filter(item => item.kind == "file");

            if (draggedFiles.length > 0) {
                event.dataTransfer.dropEffect = "copy";
                dropZone.classList.add("dropfocus");
            } else {
                event.dataTransfer.dropEffect = "none";
            }
        });
        dropZone.addEventListener("dragleave", (event) => {
            event.preventDefault();
            dropZone.classList.remove("dropfocus");
        });
        dropZone.addEventListener("drop", (event) => {
            event.preventDefault();
            dropZone.classList.remove("dropfocus");
            let files = event.dataTransfer.files;
            if (files.length > 0) {
                this.bus.emit(eventToEmit, { file: files[0] });
            }
        });
    }

    #updateMapSelector(maps) {
        this.elements.mapSelect.innerHTML = "";

        for (const mapObject in maps) {
            let option = document.createElement("option");
            option.value = maps[mapObject].id;
            option.text = maps[mapObject].name;
            this.elements.mapSelect.appendChild(option);
        }
    }

    #updateCoordinatesInput(x, y) {
        this.elements.coordinateXInput.value = x;
        this.elements.coordinateYInput.value = y;
    }

    #showCollapse() {
        if (this.animations.isCollapsing) {
            setTimeout(() => this.#showCollapse(), 50);
        } else {
            this.elements.collapseBootstrapElement.show();
        }
    }

    #updateCollapseDirection() {
        if (window.innerWidth < 992) {
            this.elements.collapseElement.classList.remove("collapse-horizontal");
        } else {
            this.elements.collapseElement.classList.add("collapse-horizontal");
        }
    }

    #updateNewConnectionButtonState() {
        this.elements.newConnectionBtn.disabled = !this.connectionUiState.hasEnoughPoints || this.connectionUiState.isConnecting;
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

                clone.querySelector(".start-id").textContent = connection.start_point_id;
                clone.querySelector(".end-id").textContent = connection.end_point_id;

                let card = clone.querySelector(".kapcsolat-kartya");

                card.addEventListener("mouseenter", () => {
                    this.bus.emit(EVENTS.UI_CONNECTION_HIGHLIGHT, {
                        connectionId: connection.connection_id,
                        type: "focused"
                    });
                });

                card.addEventListener("click", () => {
                    this.bus.emit(EVENTS.UI_CONNECTION_CENTER_VIEW, {
                        startPointId: connection.start_point_id,
                        endPointId: connection.end_point_id
                    });
                });

                card.addEventListener("mouseleave", () => {
                    let type = connection.connection_id < 0 ? "unsaved" : "editing";
                    this.bus.emit(EVENTS.UI_CONNECTION_HIGHLIGHT, {
                        connectionId: connection.connection_id,
                        type: type
                    });
                });

                fragment.appendChild(clone);
            }

            this.elements.connectionsList.appendChild(fragment);
        }
    }
}