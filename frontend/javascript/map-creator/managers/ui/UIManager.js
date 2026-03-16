import { EVENTS } from "../../events/EventBus.js";
import { CONSTANTS } from "../../shared/constants.js";
import { savePreviousValue } from "../../shared/utils.js";
import { DragAndDropUploader } from "../../../libs/elements/DragAndDropUploader.js";
import { ICONS } from "../../../libs/icons/icons.js";

export class UIManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.elements = {};
        this.animations = {
            isCollapsing: false
        };
        this.connectionUiState = {
            hasEnoughPoints: false,
            isConnecting: false
        };
        this.pointSaveInProgress = false;
        this.pointImageLoading = false;
        this.hasUnsavedChanges = false;
        this.pendingAction = null;
        this.previousWidth = window.innerWidth;

        this.#gatherElements();
        this.#updateCollapseDirection();
        this.#bindUIEvents();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements = {
            // buttons
            saveMapButton: document.getElementById("saveMapButton"),
            addNewMarkerBtn: document.getElementById("plusBtn"),
            savePointButton: document.getElementById("savePointButton"),
            equiFullscreenBtn: document.getElementById("equirectangularFullscreen"),
            closeCollapse: document.getElementById("closeCollapse"),
            addNewMapBtn: document.getElementById("addNewMapBtn"),
            newConnectionBtn: document.getElementById("kapcsolatLetrehozasaBtn"),
            deletePointBtn: document.getElementById("deletePointBtn"),

            // inputs
            coordinateXInput: document.getElementById("coordinateX"),
            coordinateYInput: document.getElementById("coordinateY"),
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
            collapseElement: document.getElementById("ujPontCollapse"),
            mapSelector: document.getElementById("mapSelector"),
            floatingButtonDiv: document.getElementById("floatingButtonDiv"),

            // settings
            settingsBtn: document.getElementById("settingsBtn"),
            beallitasokCollapseElement: document.getElementById("beallitasokCollapse"),
            closeBeallitasok: document.getElementById("closeBeallitasok")
        };

        this.elements.collapseBootstrapElement = new bootstrap.Collapse(
            this.elements.collapseElement,
            {
                toggle: false
            }
        );

        this.elements.beallitasokCollapseBootstrapElement = new bootstrap.Collapse(
            this.elements.beallitasokCollapseElement,
            {
                toggle: false
            }
        );

        this.#updateSavePointButtonState();
    }

    #bindUIEvents() {
        this.mapUploader = new DragAndDropUploader(this.elements.dropZoneMap, {
            titleText: "Húzd ide a térkép fájlt",
            buttonText: "Kattints ide feltöltéshez",
            accept: "image/*"
        });

        this.mapUploader.addEventListener("fileDropped", (event) => {
            this.bus.emit(EVENTS.UI_MAP_FILE_DROPPED, { file: event.detail.file });
        });

        this.equirectangularUploader = new DragAndDropUploader(this.elements.dropZoneEquirectangular, {
            titleText: "Húzd ide a 360°-os képet",
            buttonText: "Kattints ide feltöltéshez",
            accept: "image/*"
        });

        this.equirectangularUploader.addEventListener("fileDropped", (event) => {
            this.bus.emit(EVENTS.UI_EQUIRECTANGULAR_FILE_DROPPED, { file: event.detail.file });
        });

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
                if (window.innerWidth <= 992) {
                    this.elements.beallitasokCollapseBootstrapElement.hide();
                }
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
                    if (this.hasUnsavedChanges) {
                        event.preventDefault();
                        this.pendingAction = { type: "collapse_close" };
                        this.bus.emit(EVENTS.UI_SHOW_DISCARD_MODAL);
                    } else {
                        this.animations.isCollapsing = true;
                        this.elements.savePointButton.disabled = true;
                        this.bus.emit(EVENTS.UI_COLLAPSE_HIDE_STARTED);
                    }
                } else {
                    event.preventDefault();
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
                }
            }
        });

        this.elements.deletePointBtn.addEventListener("click", (event) => {
            let request = { canProceed: true, reason: "" };

            this.bus.emit(EVENTS.UI_DELETE_POINT_REQUESTED, { request });

            if (request.canProceed) {
                this.bus.emit(EVENTS.UI_SHOW_POINT_DELETE_MODAL);
            } else {
                event.preventDefault();
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
            }
        });

        this.elements.collapseElement.addEventListener("hidden.bs.collapse", (event) => {
            if (event.target == this.elements.collapseElement) {
                this.animations.isCollapsing = false;
                this.elements.northDirection.value = 0;
                this.elements.northDirectionRange.value = 0;
                this.elements.savePointButton.disabled = true;
                this.elements.floatingButtonDiv.classList.remove("d-none");
                this.bus.emit(EVENTS.UI_COLLAPSE_HIDDEN);
            }
        });

        this.elements.beallitasokCollapseElement.addEventListener("show.bs.collapse", (event) => {
            if (event.target == this.elements.beallitasokCollapseElement && window.innerWidth < 992) {
                this.elements.floatingButtonDiv.classList.add("d-none");
            }
        });

        this.elements.beallitasokCollapseElement.addEventListener("hidden.bs.collapse", (event) => {
            if (event.target == this.elements.beallitasokCollapseElement && window.innerWidth < 992) {
                this.elements.floatingButtonDiv.classList.remove("d-none");
            }
        });

        this.elements.addNewMapBtn.addEventListener("click", () => {
            let request = { canProceed: true, reason: "" };

            this.bus.emit(EVENTS.UI_ADD_NEW_MAP_REQUEST, request);

            if (request.canProceed) {
                this.elements.fileInputMap.value = "";
                this.elements.fileInputMap.click();
            } else {
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

        window.addEventListener("resize", () => {
            this.#updateCollapseDirection();
            this.#handleTwoCollapseResize();
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_SWITCHED, ({ mapId }) => {
            this.connectionUiState.hasEnoughPoints = false;
            this.connectionUiState.isConnecting = false;
            this.#updateNewConnectionButtonState();
        });

        this.bus.on(EVENTS.MARKER_PLACING_STARTED, () => this.elements.floatingButtonDiv.classList.add("d-none"));

        this.bus.on(EVENTS.MARKER_PLACING_CANCELLED, () => this.elements.floatingButtonDiv.classList.remove("d-none"));

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

        this.bus.on(EVENTS.POINT_SAVED, ({ pointCount }) => {
            this.connectionUiState.hasEnoughPoints = pointCount >= 2;
            this.#updateNewConnectionButtonState();
        });

        this.bus.on(EVENTS.POINT_SAVE_STARTED, () => {
            this.pointSaveInProgress = true;
            this.#updateSavePointButtonState();
        });

        this.bus.on(EVENTS.POINT_SAVE_FINISHED, () => {
            this.pointSaveInProgress = false;
            this.#updateSavePointButtonState();
        });

        this.bus.on(EVENTS.EQUIRECTANGULAR_IMAGE_LOADING_STARTED, () => {
            this.pointImageLoading = true;
            this.#updateSavePointButtonState();
        });

        this.bus.on(EVENTS.EQUIRECTANGULAR_IMAGE_LOADED, () => {
            this.pointImageLoading = false;
            this.#updateSavePointButtonState();
        });

        this.bus.on(EVENTS.MARKER_SELECTED, ({ position, data }) => {
            this.elements.coordinateXInput.value = position.x;
            this.elements.coordinateYInput.value = position.y;
            this.elements.northDirection.value = data ? data.north_direction : 0;
            this.elements.northDirectionRange.value = data ? data.north_direction : 0;
            this.#showCollapse();
        });

        this.bus.on(EVENTS.NEW_MAP_LOADED, () => {
            this.elements.mapSelector.classList.remove("d-none");
            this.elements.uploadOverlay.classList.add("d-none");
        });

        this.bus.on(EVENTS.UI_DISCARD_CHANGES_CONFIRMED, () => {
            this.hasUnsavedChanges = false;
            if (this.pendingAction) {
                switch (this.pendingAction.type) {
                    case "collapse_close":
                        this.elements.collapseBootstrapElement.hide();
                        break;
                }
                this.pendingAction = null;
            }
        });

        this.bus.on(EVENTS.UI_MODAL_HIDDEN, () => {
            this.pendingAction = null;
        });

        this.bus.on(EVENTS.MARKER_DELETED, () => {
            this.elements.collapseBootstrapElement.hide();
        });

        this.bus.on(EVENTS.MAP_DELETED, () => {
            this.elements.collapseBootstrapElement.hide();
            this.elements.beallitasokCollapseBootstrapElement.hide();
        });

        this.bus.on(EVENTS.MAP_SAVE_STARTED, () => this.elements.saveMapButton.disabled = true);

        this.bus.on(EVENTS.MAP_SAVE_AVAILABILITY_CHANGED, ({ canSave }) => this.elements.saveMapButton.disabled = !canSave);

        this.bus.on(EVENTS.POINT_DIRTY_STATE_CHANGED, ({ isDirty }) => {
            this.hasUnsavedChanges = isDirty;
            this.#updateSavePointButtonState();
        });
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
            this.elements.beallitasokCollapseElement.classList.remove("collapse-horizontal");
        } else {
            this.elements.collapseElement.classList.add("collapse-horizontal");
            this.elements.beallitasokCollapseElement.classList.add("collapse-horizontal");
        }
    }

    #updateNewConnectionButtonState() {
        this.elements.newConnectionBtn.disabled = !this.connectionUiState.hasEnoughPoints || this.connectionUiState.isConnecting;
    }

    #updateSavePointButtonState() {
        this.elements.savePointButton.disabled = this.pointSaveInProgress || this.pointImageLoading || !this.hasUnsavedChanges;
    }

    #handleTwoCollapseResize() {
        let currentWidth = window.innerWidth;
        let wasAbove992 = this.previousWidth > 992;
        let isBelow992 = currentWidth <= 992;

        if (wasAbove992 && isBelow992) {
            let mainCollapseOpen = this.elements.collapseElement.classList.contains("show");
            let settingsCollapseOpen = this.elements.beallitasokCollapseElement.classList.contains("show");

            if (settingsCollapseOpen) {
                this.elements.floatingButtonDiv.classList.add("d-none");
                if (mainCollapseOpen) {
                    this.elements.beallitasokCollapseElement.classList.remove("show");
                    this.elements.beallitasokCollapseElement.classList.add("hide");
                }
            }
        } else {
            if (!wasAbove992 && !isBelow992) {
                // wasBelow992 && isAbove992
                let settingsCollapseOpen = this.elements.beallitasokCollapseElement.classList.contains("show");
                if (settingsCollapseOpen) {
                    this.elements.floatingButtonDiv.classList.remove("d-none");
                }
            }
        }

        this.previousWidth = currentWidth;
    }
}