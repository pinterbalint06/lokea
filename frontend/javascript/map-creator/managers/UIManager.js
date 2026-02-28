import { EVENTS } from "../events/EventBus.js";
import { CONSTANTS, ICONS } from "../constants.js";
import { showToast, createSvgIcon, createSpinnerIcon, savePreviousValue } from "../utils.js";

export class UIManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.elements = {};
        this.toasts = {};
        this.animations = {
            isCollapsing: false
        };

        this.#gatherElements();
        this.#bindUIEvents();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements = {
            // buttons
            saveButton: document.getElementById("saveButton"),
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
    }

    #bindUIEvents() {
        this.elements.mapSelect.addEventListener("change", (event) => this.bus.emit(EVENTS.UI_SWITCH_MAP_REQUEST, { mapId: parseInt(event.target.value) }));
        this.elements.addNewMarkerBtn.addEventListener("click", () => this.bus.emit(EVENTS.UI_ADD_NEW_MARKER_REQUEST));

        let coordInputs = [this.elements.coordinateXInput, this.elements.coordinateYInput];
        coordInputs.forEach(coordinateInput => {
            coordinateInput.addEventListener("focus", savePreviousValue);
            coordinateInput.addEventListener("change", (e) => {
                this.bus.emit(EVENTS.UI_COORDINATE_CHANGED, { x: this.elements.coordinateXInput.valueAsNumber, y: this.elements.coordinateYInput.valueAsNumber, event: e });
            });
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

                if (!request.canProceed) {
                    event.preventDefault();
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
                } else {
                    this.animations.isCollapsing = true;
                    this.elements.savePointButton.disabled = true;
                    this.bus.emit(EVENTS.UI_COLLAPSE_HIDE_STARTED);
                }
            }
        });

        this.elements.collapseElement.addEventListener("hidden.bs.collapse", (event) => {
            if (event.target == this.elements.collapseElement) {
                this.animations.isCollapsing = false;
            }
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_SWITCHED, ({ mapId }) => {
            this.elements.collapseBootstrapElement.hide();
            this.elements.mapSelect.value = mapId;
            this.elements.newConnectionBtn.disabled = true;
        });

        this.bus.on(EVENTS.MARKER_PLACING_STARTED, () => {
            this.elements.floatingButtonDiv.classList.add("d-none");
        });

        this.bus.on(EVENTS.MARKER_PLACING_CANCELLED, () => {
            this.elements.floatingButtonDiv.classList.remove("d-none");
        });

        this.bus.on(EVENTS.TOAST_SHOW, ({ id, msg, type, closable = true, iconObject, duration = 3000, autohide = true, spinner = false, callback }) => {
            let icon;
            if (spinner) {
                icon = createSpinnerIcon();
            } else {
                icon = iconObject ? createSvgIcon(iconObject, "2em") : null;
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

        this.bus.on(EVENTS.NEW_MARKER_PLACED, () => {
            this.elements.collapseBootstrapElement.show();
        });

        this.bus.on(EVENTS.MARKER_MOVED, ({ x, y }) => this.#updateCoordinatesInput(x, y));

        this.bus.on(EVENTS.HIDE_LOADING, () => this.elements.loadingOverlay.classList.add("d-none"));

        this.bus.on(EVENTS.MAPS_LOADED, ({ maps }) => {
            let hasMaps = Object.keys(maps).length > 0;
            if (hasMaps) {
                this.elements.uploadOverlay.classList.add("d-none");
                this.elements.mapSelector.classList.remove("d-none");
                this.elements.saveButton.disabled = true;
                this.elements.newConnectionBtn.disabled = true;

                this.#updateMapSelector(maps);
            } else {
                this.elements.uploadOverlay.classList.remove("d-none");
                this.elements.mapSelector.classList.add("d-none");
            }
        });

        this.bus.on(EVENTS.MARKER_SELECTED, ({ position, data }) => {
            this.elements.coordinateXInput.value = position.x;
            this.elements.coordinateYInput.value = position.y;
            this.elements.northDirection.value = data ? data.north_direction : 0;
            this.elements.northDirectionRange.value = data ? data.north_direction : 0;
            this.#showCollapse();
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
}