import { EVENTS } from "../../events/EventBus.js";
import { createSVGIcon } from "../../../libs/utils/svgUtils.js";
import { CustomSelect } from "../../../libs/elements/CustomSelect.js";
import { createElement } from "../../../libs/utils/DOMUtils.js";
import { ICONS } from "../../../libs/icons/icons.js";

export class MapSelectorManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.elements = {};
        this.renameContexts = {};

        this.#gatherElements();
        this.#bindUIEvents();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements.mapSelectWrapped = document.getElementById("customSelect");
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
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_SWITCHED, ({ mapId }) => {
            this.elements.customMapSelector.setValue(mapId);
        });

        this.bus.on(EVENTS.MAPS_LOADED, ({ maps }) => this.#updateMapSelector(maps));

        this.bus.on(EVENTS.NEW_MAP_LOADED, ({ maps, loadedMapId }) => {
            this.#updateMapSelector(maps);
            this.elements.customMapSelector.setValue(loadedMapId);
        });

        this.bus.on(EVENTS.MAP_SAVE_SUCCEEDED, ({ maps, newMapId }) => {
            this.#updateMapSelector(maps);
            this.elements.customMapSelector.setValue(newMapId);
        });

        this.bus.on(EVENTS.MAP_RENAME_SUCCEEDED, ({ mapId, newTitle }) => this.#handleMapRenameSuccess(mapId, newTitle));

        this.bus.on(EVENTS.MAP_RENAME_FAILED, ({ mapId }) => this.#handleMapRenameFailed(mapId));
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
                this.bus.emit(EVENTS.UI_SHOW_MAP_DELETE_MODAL, {
                    mapId,
                    mapName: textSpan.innerText
                });
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

            // exclude mapId so pass it
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

            const previousRenameContext = this.renameContexts[mapId];
            if (previousRenameContext) {
                previousRenameContext.editSessionController.abort();
            }

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
}
