import { EVENTS } from "../../events/EventBus.js";
import { CONSTANTS } from "../../shared/constants.js";
import { savePreviousValue } from "../../shared/utils.js";
import { DragAndDropUploader } from "../../../libs/elements/DragAndDropUploader.js";

export class MarkerEditorManager {
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
            collapseElement: document.getElementById("ujPontCollapse"),
            closeCollapse: document.getElementById("closeCollapse"),
            savePointButton: document.getElementById("savePointButton"),
            deletePointBtn: document.getElementById("deletePointBtn"),
            newConnectionBtn: document.getElementById("kapcsolatLetrehozasaBtn"),
            equiFullscreenBtn: document.getElementById("equirectangularFullscreen"),
            coordinateXInput: document.getElementById("coordinateX"),
            coordinateYInput: document.getElementById("coordinateY"),
            northDirectionRange: document.getElementById("northDirectionRange"),
            northDirection: document.getElementById("northDirection"),
            equirectangularPreview: document.getElementById(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID),
            dropZoneEquirectangular: document.getElementById("drop-zone-equirectangular")
        };

        this.elements.collapseBootstrapElement = new bootstrap.Collapse(
            this.elements.collapseElement,
            {
                toggle: false
            }
        );

        this.elements.equirectangularUploader = new DragAndDropUploader(this.elements.dropZoneEquirectangular, {
            titleText: "Húzd ide a 360°-os képet",
            buttonText: "Kattints ide feltöltéshez",
            accept: "image/*"
        });

        this.#updateSavePointButtonState();
    }

    #bindUIEvents() {
        this.elements.equirectangularUploader.addEventListener("fileDropped", (event) => {
            this.bus.emit(EVENTS.UI_EQUIRECTANGULAR_FILE_DROPPED, { file: event.detail.file });
        });

        this.elements.newConnectionBtn.addEventListener("click", () => this.bus.emit(EVENTS.UI_CONNECTION_CREATE_REQUEST));

        let coordInputs = [this.elements.coordinateXInput, this.elements.coordinateYInput];
        coordInputs.forEach((coordinateInput) => {
            coordinateInput.addEventListener("focus", savePreviousValue);
            coordinateInput.addEventListener("change", (event) => {
                this.bus.emit(EVENTS.UI_COORDINATE_CHANGED, {
                    x: this.elements.coordinateXInput.valueAsNumber,
                    y: this.elements.coordinateYInput.valueAsNumber,
                    event
                });
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

        this.elements.northDirectionRange.addEventListener("input", (event) => {
            this.elements.northDirection.value = event.target.value;
            this.bus.emit(EVENTS.UI_NORTH_DIRECTION_CHANGED, { northDirection: this.elements.northDirection.valueAsNumber });
        });

        this.elements.collapseElement.addEventListener("show.bs.collapse", (event) => {
            if (event.target == this.elements.collapseElement) {
                this.animations.isCollapsing = true;
                this.bus.emit(EVENTS.UI_MARKER_EDITOR_OPENED);
                this.bus.emit(EVENTS.UI_COLLAPSE_SHOW_STARTED);
                if (window.innerWidth <= 992) {
                    this.bus.emit(EVENTS.UI_SETTINGS_CLOSE_REQUESTED);
                }
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

        this.elements.collapseElement.addEventListener("hidden.bs.collapse", (event) => {
            if (event.target == this.elements.collapseElement) {
                this.animations.isCollapsing = false;
                this.elements.northDirection.value = 0;
                this.elements.northDirectionRange.value = 0;
                this.elements.savePointButton.disabled = true;
                this.bus.emit(EVENTS.UI_MARKER_EDITOR_CLOSED);
                this.bus.emit(EVENTS.UI_COLLAPSE_HIDDEN);
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
            this.#emitSettingsCloseOnMobileBreakpoint();
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_SWITCHED, () => {
            this.connectionUiState.hasEnoughPoints = false;
            this.connectionUiState.isConnecting = false;
            this.#updateNewConnectionButtonState();
        });

        this.bus.on(EVENTS.NEW_MARKER_PLACED, () => this.elements.collapseBootstrapElement.show());

        this.bus.on(EVENTS.MARKER_MOVED, ({ x, y }) => this.#updateCoordinatesInput(x, y));

        this.bus.on(EVENTS.POINTS_LOADED, ({ points }) => {
            this.connectionUiState.hasEnoughPoints = Object.keys(points).length >= 2;
            this.#updateNewConnectionButtonState();
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
        });

        this.bus.on(EVENTS.UI_MARKER_EDITOR_CLOSE_REQUESTED, () => {
            this.elements.collapseBootstrapElement.hide();
        });

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
        if (window.innerWidth <= 992) {
            this.elements.collapseElement.classList.remove("collapse-horizontal");
        } else {
            this.elements.collapseElement.classList.add("collapse-horizontal");
        }
    }

    #updateNewConnectionButtonState() {
        this.elements.newConnectionBtn.disabled = !this.connectionUiState.hasEnoughPoints || this.connectionUiState.isConnecting;
    }

    #updateSavePointButtonState() {
        this.elements.savePointButton.disabled = this.pointSaveInProgress || this.pointImageLoading || !this.hasUnsavedChanges;
    }

    #emitSettingsCloseOnMobileBreakpoint() {
        let currentWidth = window.innerWidth;
        let wasAbove992 = this.previousWidth > 992;
        let isBelow992 = currentWidth <= 992;
        let markerEditorOpen = this.elements.collapseElement.classList.contains("show");

        if (wasAbove992 && isBelow992 && markerEditorOpen) {
            this.bus.emit(EVENTS.UI_SETTINGS_CLOSE_REQUESTED);
        }

        this.previousWidth = currentWidth;
    }
}