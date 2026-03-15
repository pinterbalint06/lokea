import { EVENTS } from "../events/EventBus.js";
import { CONSTANTS } from "../shared/constants.js";
import { createSVGIcon } from "../../libs/utils/svgUtils.js";
import { showToast, createSpinnerIcon, savePreviousValue } from "../shared/utils.js";
import { CustomSelect } from "../../libs/elements/CustomSelect.js";
import { HoldToUnlockButton } from "../../libs/elements/HoldToUnlockButton.js";
import { createElement } from "../../libs/utils/DOMUtils.js";
import { ICONS } from "../../libs/icons/icons.js";

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
        this.pointSaveInProgress = false;
        this.pointImageLoading = false;
        this.hasUnsavedChanges = false;
        this.pendingAction = null;
        this.deleteContext = null;
        this.previousWidth = window.innerWidth;
        this.renameContexts = {};

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
            discardChangesBtn: document.getElementById("valtoztatasokElveteseBtn"),
            deletePointBtn: document.getElementById("deletePointBtn"),
            confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

            // inputs
            fileInputMap: document.getElementById("fileInput"),
            fileInputEquirectangular: document.getElementById("fileInputEquirectangular"),
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
            toastPlace: document.getElementById("toastPlace"),
            collapseElement: document.getElementById("ujPontCollapse"),
            mapSelector: document.getElementById("mapSelector"),
            floatingButtonDiv: document.getElementById("floatingButtonDiv"),
            connectionsList: document.getElementById("kapcsolatokLista"),
            emptyConnections: document.getElementById("nincsenekKapcsolatok"),
            mapSelectWrapped: document.getElementById("customSelect"),

            // modals
            changesModal: document.getElementById("valtoztatasokModal"),
            deleteModal: document.getElementById("deleteModal"),

            // settings
            settingsBtn: document.getElementById("settingsBtn"),
            beallitasokCollapseElement: document.getElementById("beallitasokCollapse"),
            closeBeallitasok: document.getElementById("closeBeallitasok"),
            fovToggle: document.getElementById("fovToggle"),
            fovWidthRange: document.getElementById("fovWidthRange"),
            fovWidthNumber: document.getElementById("fovWidthNumber"),
            fovHeightRange: document.getElementById("fovHeightRange"),
            fovHeightNumber: document.getElementById("fovHeightNumber"),
            offMapConnectionsToggle: document.getElementById("offMapConnectionsToggle"),
            allConnectionsWhenNotActiveToggle: document.getElementById("allConnectionsWhenNotActiveToggle"),

            // shared delete modal content
            deleteTitle: document.getElementById("deleteTitle"),
            deleteDescription: document.getElementById("deleteDescription"),
            deleteWarning: document.getElementById("deleteWarning")
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

        this.elements.changesModalBootstrapElement = new bootstrap.Modal(this.elements.changesModal);

        this.elements.deleteModalBootstrapElement = new bootstrap.Modal(this.elements.deleteModal);

        this.#updateSavePointButtonState();

        this.elements.customMapSelector = new CustomSelect(
            this.elements.mapSelectWrapped,
            (value, text) => this.#createCustomSelectOption(value, text)
        );
    }

    #bindUIEvents() {
        this.elements.customMapSelector.addEventListener("change", (event) => {
            let targetMapId = parseInt(event.detail.value);

            let request = { canProceed: true, reason: "" };
            this.bus.emit(EVENTS.MAP_SWITCH_REQUESTED, request);

            if (request.canProceed) {
                this.bus.emit(EVENTS.UI_SWITCH_MAP_REQUEST, { mapId: targetMapId });
            } else {
                event.preventDefault();
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
            }
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
                        this.elements.changesModalBootstrapElement.show();
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
                this.#showDeleteModal({ type: "point" });
            } else {
                event.preventDefault();
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
            }
        });

        this.elements.discardChangesBtn.addEventListener("click", (event) => {
            event.target.blur(); // valami aria warning miatt kell
            this.elements.changesModalBootstrapElement.hide();
            this.hasUnsavedChanges = false;
            if (this.pendingAction) {
                switch (this.pendingAction.type) {
                    case "collapse_close":
                        this.elements.collapseBootstrapElement.hide();
                        break;
                    case "add_new_map":
                        this.elements.fileInputMap.value = "";
                        this.elements.fileInputMap.click();
                        break;
                }
                this.pendingAction = null;
            }
        });

        this.elements.changesModal.addEventListener("hidden.bs.modal", () => {
            this.pendingAction = null;
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

        this.elements.addNewMapBtn.addEventListener("click", (event) => {
            let request = { canProceed: true, reason: "" };

            this.bus.emit(EVENTS.UI_ADD_NEW_MAP_REQUEST, request);

            if (request.canProceed) {
                if (this.hasUnsavedChanges) {
                    this.pendingAction = { type: "add_new_map" };
                    this.elements.changesModalBootstrapElement.show();
                } else {
                    this.elements.fileInputMap.value = "";
                    this.elements.fileInputMap.click();
                }
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

        this.elements.fovToggle.addEventListener("change", (event) => {
            this.bus.emit(EVENTS.UI_SETTINGS_FOV_TOGGLED, { enabled: event.target.checked });
        });

        this.elements.offMapConnectionsToggle.addEventListener("change", (event) => {
            this.bus.emit(EVENTS.UI_SETTINGS_CONNECTION_OFF_MAP_VISIBILITY_CHANGED, {
                enabled: event.target.checked
            });
        });

        this.elements.allConnectionsWhenNotActiveToggle.addEventListener("change", (event) => {
            this.elements.offMapConnectionsToggle.disabled = !event.target.checked;
            this.bus.emit(EVENTS.UI_SETTINGS_CONNECTION_ALL_VISIBILITY_CHANGED, {
                enabled: event.target.checked
            });
        });

        this.#setupFinalDeleteButton();

        this.#syncFovInputs(this.elements.fovWidthRange, this.elements.fovWidthNumber, "width");
        this.#syncFovInputs(this.elements.fovWidthNumber, this.elements.fovWidthRange, "width");

        this.#syncFovInputs(this.elements.fovHeightRange, this.elements.fovHeightNumber, "height");
        this.#syncFovInputs(this.elements.fovHeightNumber, this.elements.fovHeightRange, "height");

        this.#setupUploadHandler(this.elements.dropZoneMap, this.elements.uploadButtonMap, this.elements.fileInputMap, EVENTS.UI_MAP_FILE_DROPPED);
        this.#setupUploadHandler(this.elements.dropZoneEquirectangular, this.elements.uploadButtonEquirectangular, this.elements.fileInputEquirectangular, EVENTS.UI_EQUIRECTANGULAR_FILE_DROPPED);
    }

    #createCustomSelectOption(value, text) {
        let textSpan = document.createElement("span");
        textSpan.innerText = text;
        textSpan.classList.add("map-name-text");

        let inputField = createElement("input", {
            type: "text",
            class: "form-control form-control-sm map-name-input d-none",
            value: text,
            maxlength: "20",
            "aria-label": "Térkép neve"
        });

        let textContainer = createElement("div", {
            class: "map-name-container"
        }, [textSpan, inputField]);

        let deleteIcon = createSVGIcon(ICONS.TRASH,
            {
                height: "1em",
                width: "1em",
                fill: "currentColor"
            }
        );

        let deleteButton = createElement("button",
            {
                type: "button",
                class: "btn-delete btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
            },
            [deleteIcon]
        );

        let mapId = parseInt(value);

        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation();

            this.#cancelRenameSessions();

            let request = { canProceed: true, reason: "" };
            this.bus.emit(EVENTS.UI_DELETE_MAP_REQUESTED, { request, mapId });

            if (request.canProceed) {
                this.#showDeleteModal({ type: "map", id: mapId, name: textSpan.innerText });
            } else {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
            }
        });

        let renameIcon = createSVGIcon(ICONS.EDIT,
            {
                height: "1em",
                width: "1em",
                fill: "currentColor"
            }
        );

        let renameButton = createElement("button",
            {
                type: "button",
                class: "btn-delete btn uvegbutton-outline btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
            },
            [renameIcon]
        );

        renameButton.addEventListener("click", (event) => {
            event.stopPropagation();

            // exclue mapId so pass it
            this.#cancelRenameSessions(mapId);

            let currentName = textSpan.innerText;

            textSpan.classList.add("d-none");
            inputField.classList.remove("d-none");
            inputField.value = currentName;
            inputField.focus();
            inputField.select();

            deleteButton.disabled = true;
            renameButton.disabled = true;

            let originalValue = currentName;

            // removes event listeners with abort
            let editSessionController = new AbortController();

            const exitEditMode = () => {
                textSpan.classList.remove("d-none");
                inputField.classList.add("d-none");
                deleteButton.disabled = false;
                renameButton.disabled = false;
            };

            const renameContext = {
                mapId,
                textSpan,
                inputField,
                deleteButton,
                renameButton,
                originalValue,
                editSessionController,
                isEditing: true,
                isSubmitting: false,
                exitEditMode
            };

            this.renameContexts[mapId] = renameContext;

            const commitRename = () => {
                let newTitle = inputField.value.trim();
                let mapTitleRegex = /^\w{1,20}$/;

                if (newTitle != originalValue && newTitle.match(mapTitleRegex)) {
                    renameContext.isSubmitting = true;
                    inputField.disabled = true;

                    this.bus.emit(EVENTS.UI_MAP_RENAME_REQUEST, {
                        mapId,
                        newTitle
                    });
                } else {
                    if (newTitle.length == 0) {
                        this.#closeRenameContext(mapId);
                        this.bus.emit(EVENTS.TOAST_SHOW, {
                            msg: "A térkép neve nem lehet üres!",
                            type: "danger"
                        });
                    } else {
                        if (!newTitle.match(mapTitleRegex)) {
                            this.bus.emit(EVENTS.TOAST_SHOW, {
                                msg: "A térkép neve 1-20 karakter lehet, csak betű, szám és aláhúzás használható.",
                                type: "danger"
                            });
                            inputField.select();
                        } else {
                            this.#closeRenameContext(mapId);
                        }
                    }
                }
            };

            inputField.addEventListener("keydown", (e) => {
                if (renameContext.isEditing && !renameContext.isSubmitting && !inputField.disabled) {
                    if (e.key == "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        commitRename();
                    } else {
                        if (e.key == "Escape") {
                            e.preventDefault();
                            e.stopPropagation();
                            this.#closeRenameContext(mapId);
                        }
                    }
                }
            }, { signal: editSessionController.signal });

            inputField.addEventListener("blur", () => {
                if (renameContext.isEditing && !renameContext.isSubmitting && !inputField.disabled) {
                    commitRename();
                    if (renameContext.isEditing && !renameContext.isSubmitting && !inputField.disabled) {
                        this.#closeRenameContext(mapId);
                    }
                }
            }, { signal: editSessionController.signal });

            inputField.addEventListener("click", (e) => {
                e.stopPropagation();
            }, { signal: editSessionController.signal });

            this.elements.mapSelectWrapped.addEventListener("mousedown", (event) => {
                let isInsideOption = event.target.closest(".custom-option");
                let isOnButton = event.target.closest("button");
                if (isInsideOption && isOnButton) {
                    event.preventDefault();
                }
            }, { signal: editSessionController.signal });
        });

        let buttonsDiv = createElement("div", {
            class: "d-flex align-items-center gap-2"
        }, [renameButton, deleteButton]);

        let wrapperDiv = createElement("div", {
            class: "d-flex align-items-center justify-content-between gap-2"
        }, [textContainer, buttonsDiv]);
        return wrapperDiv;
    }

    #setupFinalDeleteButton() {
        this.elements.holdToUnlockFinalDeleteBtn = new HoldToUnlockButton(this.elements.confirmDeleteBtn, 2000);

        this.elements.holdToUnlockFinalDeleteBtn.addEventListener("confirm", (event) => {
            event.detail.originalEvent.target.blur(); // valami aria warning miatt kell
            if (this.deleteContext) {
                if (this.deleteContext.type == "map") {
                    let request = { canProceed: true, reason: "" };
                    this.bus.emit(EVENTS.UI_DELETE_MAP_REQUESTED, { request, mapId: this.deleteContext.id });

                    if (request.canProceed) {
                        this.elements.confirmDeleteBtn.disabled = true;
                        this.bus.emit(EVENTS.UI_DELETE_MAP_CONFIRMED, { mapId: this.deleteContext.id });
                    } else {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
                    }
                } else {
                    if (this.deleteContext.type == "point") {
                        let request = { canProceed: true, reason: "" };
                        this.bus.emit(EVENTS.UI_DELETE_POINT_REQUESTED, { request });

                        if (request.canProceed) {
                            this.elements.confirmDeleteBtn.disabled = true;
                            this.bus.emit(EVENTS.UI_DELETE_POINT_CONFIRMED);
                        } else {
                            this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
                        }
                    }
                }
            }
        });

        this.elements.deleteModal.addEventListener("hidden.bs.modal", (event) => {
            if (event.target == this.elements.deleteModal) {
                this.elements.holdToUnlockFinalDeleteBtn.reset();
                this.deleteContext = null;
                this.elements.confirmDeleteBtn.disabled = false;
            }
        });
        this.elements.deleteModal.addEventListener("show.bs.modal", (event) => {
            if (event.target == this.elements.deleteModal) {
                this.elements.holdToUnlockFinalDeleteBtn.reset();
                this.elements.confirmDeleteBtn.disabled = false;
            }
        });
    }

    #showDeleteModal(context) {
        this.deleteContext = context;

        if (context.type == "map") {
            this.elements.deleteTitle.textContent = "Térkép törlése";
            this.elements.deleteDescription.textContent = `Biztosan törölni szeretnéd ezt a térképet${context.name ? `: ${context.name}` : ""}?`;
            this.#setDeleteWarning("Ez a művelet nem vonható vissza. A térképhez tartozó ", "összes pont, kapcsolat és kép is törlésre kerül", ".");
            this.elements.confirmDeleteBtn.textContent = "Térkép végleges törlése";
        } else {
            if (context.type == "point") {
                this.elements.deleteTitle.textContent = "Pont törlése";
                this.elements.deleteDescription.textContent = "Biztosan törölni szeretnéd ezt a pontot?";
                this.#setDeleteWarning("Ez a művelet nem vonható vissza. A ponthoz tartozó ", "összes kapcsolat és a 360°-os kép is törlésre kerül", ".");
                this.elements.confirmDeleteBtn.textContent = "Pont végleges törlése";
            }
        }

        this.elements.deleteModalBootstrapElement.show();
    }

    #setDeleteWarning(prefix, strongText, suffix) {
        this.elements.deleteWarning.textContent = "";

        if (prefix) {
            this.elements.deleteWarning.appendChild(document.createTextNode(prefix));
        }

        let strong = document.createElement("strong");
        strong.textContent = strongText;
        this.elements.deleteWarning.appendChild(strong);

        if (suffix) {
            this.elements.deleteWarning.appendChild(document.createTextNode(suffix));
        }
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_SWITCHED, ({ mapId }) => {
            this.elements.customMapSelector.setValue(mapId);
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
                icon = iconObject ? createSVGIcon(iconObject, { height: "1em", fill: "currentColor" }) : null;
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
            this.elements.customMapSelector.setValue(loadedMapId);
        });

        this.bus.on(EVENTS.MAP_SAVE_SUCCEEDED, ({ maps, newMapId }) => {
            this.#updateMapSelector(maps);
            this.elements.customMapSelector.setValue(newMapId);
        });

        this.bus.on(EVENTS.MARKER_DELETED, () => {
            this.elements.deleteModalBootstrapElement.hide();
            this.elements.collapseBootstrapElement.hide();
            this.elements.confirmDeleteBtn.disabled = false;
        });

        this.bus.on(EVENTS.MARKER_DELETE_FAILED, () => {
            this.elements.deleteModalBootstrapElement.hide();
            this.elements.confirmDeleteBtn.disabled = false;
        });

        this.bus.on(EVENTS.MAP_DELETED, () => {
            this.elements.deleteModalBootstrapElement.hide();
            this.elements.collapseBootstrapElement.hide();
            this.elements.beallitasokCollapseBootstrapElement.hide();
            this.elements.confirmDeleteBtn.disabled = false;
        });

        this.bus.on(EVENTS.MAP_DELETE_FAILED, () => {
            this.elements.deleteModalBootstrapElement.hide();
            this.elements.confirmDeleteBtn.disabled = false;
        });

        this.bus.on(EVENTS.MAP_SAVE_STARTED, () => this.elements.saveMapButton.disabled = true);

        this.bus.on(EVENTS.MAP_SAVE_AVAILABILITY_CHANGED, ({ canSave }) => this.elements.saveMapButton.disabled = !canSave);

        this.bus.on(EVENTS.POINT_DIRTY_STATE_CHANGED, ({ isDirty }) => {
            this.hasUnsavedChanges = isDirty;
            this.#updateSavePointButtonState();
        });

        this.bus.on(EVENTS.MAP_RENAME_SUCCEEDED, ({ mapId, newTitle }) => this.#handleMapRenameSuccess(mapId, newTitle));

        this.bus.on(EVENTS.MAP_RENAME_FAILED, ({ mapId }) => this.#handleMapRenameFailed(mapId));
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

    #syncFovInputs(source, target, propertyName) {
        source.addEventListener("input", (event) => {
            target.value = event.target.value;
            this.bus.emit(EVENTS.UI_SETTINGS_FOV_SIZE_CHANGED, { [propertyName]: parseInt(event.target.value) });
        });
    }

    #updateMapSelector(maps) {
        this.#cancelRenameSessions();

        let selectedMapId = this.elements.customMapSelector.getValue();
        let mapList = Object.values(maps);

        this.elements.customMapSelector.clearOptions();

        for (const map of mapList) {
            this.elements.customMapSelector.addOption(map.id, map.name);
        }

        if (mapList.length > 0) {
            let exists = mapList.some(map => map.id == selectedMapId);
            this.elements.customMapSelector.setValue(exists ? selectedMapId : mapList[0].id);
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

    #handleMapRenameSuccess(mapId, newTitle) {
        this.elements.customMapSelector.updateOptionText(mapId, newTitle);

        let uiElements = this.renameContexts[mapId];

        if (uiElements) {
            let { textSpan } = uiElements;
            textSpan.innerText = newTitle;
            this.#closeRenameContext(mapId);
        }
    }

    #handleMapRenameFailed(mapId) {
        let uiElements = this.renameContexts[mapId];

        if (uiElements) {
            let { inputField, deleteButton, renameButton } = uiElements;
            inputField.disabled = false;

            let isInlineRenameOpen = !inputField.classList.contains("d-none");
            if (isInlineRenameOpen) {
                deleteButton.disabled = true;
                renameButton.disabled = true;
                uiElements.isSubmitting = false;
                inputField.focus();
                inputField.select();
            } else {
                deleteButton.disabled = false;
                renameButton.disabled = false;

                delete this.renameContexts[mapId];
            }
        }
    }

    #closeRenameContext(mapId) {
        let context = this.renameContexts[mapId];

        if (context) {
            context.isEditing = false;
            context.isSubmitting = false;

            context.inputField.value = context.originalValue;

            context.inputField.disabled = false;

            context.exitEditMode();

            context.editSessionController.abort();

            delete this.renameContexts[mapId];
        }
    }

    #cancelRenameSessions(excludeMapId) {
        let hasClosedRename = false;
        for (const mapId in this.renameContexts) {
            let shouldSkipThisMap = mapId == excludeMapId;

            if (!shouldSkipThisMap) {
                this.#closeRenameContext(mapId);
                hasClosedRename = true;
            }
        }

        if (hasClosedRename) {
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: "Az átnevezés megszakítva!"
            });
        }
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