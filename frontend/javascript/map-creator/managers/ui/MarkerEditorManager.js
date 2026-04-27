import { EVENTS } from "../../shared/EventBus.js";
import { CONSTANTS } from "../../shared/constants.js";
import { savePreviousValue } from "../../shared/utils.js";
import { DragAndDropUploader } from "../../../libs/elements/DragAndDropUploader.js";
import { DegreeInput } from "../../../libs/elements/DegreeInput.js";

export class MarkerEditorManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;
        this.elements = {};
        this.animations = {
            isCollapsing: false
        };
        this.forceClose = false;

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
            previewAccordionCollapse: document.getElementById("elonezet"),
            coordinateXInput: document.getElementById("coordinateX"),
            coordinateYInput: document.getElementById("coordinateY"),
            northDirectionWrapper: document.getElementById("northDirectionWrapper"),
            equirectangularPreview: document.getElementById(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID),
            dropZoneEquirectangular: document.getElementById("drop-zone-equirectangular")
        };

        this.elements.collapseBootstrapElement = new bootstrap.Collapse(
            this.elements.collapseElement,
            {
                toggle: false
            }
        );

        this.elements.previewAccordionBootstrapElement = new bootstrap.Collapse(
            this.elements.previewAccordionCollapse,
            {
                toggle: false
            }
        );

        this.elements.equirectangularUploader = new DragAndDropUploader(this.elements.dropZoneEquirectangular, {
            titleText: "Húzd ide a 360°-os képet",
            buttonText: "Kattints ide feltöltéshez",
            accept: "image/*"
        });

        this.elements.northDirectionInput = new DegreeInput(this.elements.northDirectionWrapper);

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

        this.elements.northDirectionInput.addEventListener("input", (event) => {
            this.bus.emit(EVENTS.UI_NORTH_DIRECTION_CHANGED, { northDirection: event.detail.value });
        });

        this.elements.northDirectionInput.addEventListener("error", (event) => {
            this.bus.emit(EVENTS.TOAST_SHOW, { msg: event.detail.message, type: "danger" });
        });

        this.elements.collapseElement.addEventListener("show.bs.collapse", (event) => {
            if (event.target == this.elements.collapseElement) {
                this.animations.isCollapsing = true;
                this.store.setState({ isOpen: { markerEditor: true } });
                this.bus.emit(EVENTS.UI_MARKER_EDITOR_OPENING);
                if (this.store.getState().isMobile) {
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
                const lockReason = this.store.isAppLocked();
                if (!lockReason) {
                    if (this.store.doesActivePointHaveUnsavedChanges() && !this.forceClose) {
                        event.preventDefault();
                        this.forceClose = true;
                        this.bus.emit(EVENTS.UI_MODAL_REQUESTED, { modalType: "discard" });
                    } else {
                        this.forceClose = false;

                        this.animations.isCollapsing = true;
                        this.elements.savePointButton.disabled = true;
                        this.bus.emit(EVENTS.UI_MARKER_EDITOR_CLOSING);
                    }
                } else {
                    event.preventDefault();
                    this.forceClose = false;
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
                }
            }
        });

        this.elements.collapseElement.addEventListener("hidden.bs.collapse", (event) => {
            if (event.target == this.elements.collapseElement) {
                this.animations.isCollapsing = false;
                this.store.setState({ isOpen: { markerEditor: false } });
                this.elements.northDirectionInput.setValue(0);
                this.elements.savePointButton.disabled = true;
                this.bus.emit(EVENTS.UI_MARKER_EDITOR_CLOSED);
            }
        });

        this.elements.deletePointBtn.addEventListener("click", (event) => {
            const lockReason = this.store.getState().isBusy.point;
            if (!lockReason) {
                this.bus.emit(EVENTS.UI_MODAL_REQUESTED, { modalType: "delete_point" });
            } else {
                event.preventDefault();
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
            }
        });

        this.elements.savePointButton.addEventListener("click", () => {
            const lockReason = this.store.getState().isBusy.point;
            if (!lockReason) {
                if (this.store.doesActivePointHaveUnsavedChanges()) {
                    this.bus.emit(EVENTS.UI_POINT_SAVE_REQUESTED);
                } else {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "A pont nem változott!", type: "info" });
                }
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
            }
        });

        this.elements.equiFullscreenBtn.addEventListener("click", () => this.bus.emit(EVENTS.UI_EQUIRECTANGULAR_FULLSCREEN_REQUEST));

        this.elements.closeCollapse.addEventListener("click", () => {
            // "hide.bs.collapse" event will be called and handles the rest
            this.elements.collapseBootstrapElement.hide();
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_SWITCHED, () => this.#updateNewConnectionButtonState());

        this.bus.on(EVENTS.NEW_MARKER_PLACED, () => this.elements.collapseBootstrapElement.show());

        this.bus.on(EVENTS.MARKER_MOVED, ({ x, y }) => this.#updateCoordinatesInput(x, y));

        this.bus.on(EVENTS.STATE_UPDATED, () => {
            this.#updateNewConnectionButtonState();
            this.#updateSavePointButtonState();

            this.#updateCollapseDirection();

            const state = this.store.getState();
            if (state.isMobile && state.isOpen.markerEditor && state.isOpen.settings) {
                this.bus.emit(EVENTS.UI_SETTINGS_CLOSE_REQUESTED);
            }
        });

        this.bus.on(EVENTS.MARKER_SELECTED, ({ position, data }) => {
            this.elements.coordinateXInput.value = position.x;
            this.elements.coordinateYInput.value = position.y;
            this.elements.northDirectionInput.setValue(data ? data.north_direction : 0);
            this.#updateNewConnectionButtonState();
            this.#showCollapse();
        });

        this.bus.on(EVENTS.EQUIRECTANGULAR_IMAGE_LOADED, () => this.elements.previewAccordionBootstrapElement.show());

        this.bus.on(EVENTS.UI_MODAL_CONFIRMED, ({ modalType }) => {
            if (modalType == "discard" && this.forceClose) {
                this.elements.collapseBootstrapElement.hide();
            }
        });

        this.bus.on(EVENTS.UI_MODAL_HIDDEN, () => {
            this.forceClose = false;
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
        if (this.store.getState().isMobile) {
            this.elements.collapseElement.classList.remove("collapse-horizontal");
        } else {
            this.elements.collapseElement.classList.add("collapse-horizontal");
        }
    }

    #hasEnoughPoints() {
        const state = this.store.getState();
        const currentPointCount = state.currentMapPointCount;
        let totalHasEnough = currentPointCount >= 2;

        const activePointId = state.activePoint.id;
        const activePointMapId = state.activePoint.mapId;

        const doesCurrentMapHaveAtleastOnePoint = currentPointCount >= 1;
        const activePointIsNotTemp = activePointId && activePointId != CONSTANTS.TEMP_ID;
        const activePointIsOnDifferentMap = activePointMapId && activePointMapId != state.activeMapId;
        if (doesCurrentMapHaveAtleastOnePoint && activePointIsNotTemp && activePointIsOnDifferentMap) {
            totalHasEnough = true;
        }

        return totalHasEnough;
    }

    #updateNewConnectionButtonState() {
        const state = this.store.getState();
        this.elements.newConnectionBtn.disabled = !this.#hasEnoughPoints() || state.isConnecting || state.activeMapId == CONSTANTS.TEMP_ID;
    }

    #updateSavePointButtonState() {
        const state = this.store.getState();

        const isNewPointMissingFile = (state.activePoint.id === CONSTANTS.TEMP_ID && !state.activePoint.pendingEquirectangularFile);

        this.elements.savePointButton.disabled =
            state.isBusy.point ||
            state.isBusy.equirectangular ||
            !this.store.doesActivePointHaveUnsavedChanges() ||
            isNewPointMissingFile;
    }
}
