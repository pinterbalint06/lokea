import { EVENTS } from "../shared/EventBus.js";
import { getEditMapUrlFromLocation } from "../shared/utils.js";
import { updateGameMapDetails, deleteGameMap } from "../shared/api.js";
import {
    DETAILS_ALLOWED_PATTERN,
    TITLE_MIN_LENGTH,
    TITLE_MAX_LENGTH,
    DESCRIPTION_MIN_LENGTH,
    DESCRIPTION_MAX_LENGTH
} from "../shared/constants.js";

export class EditManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;
        this.elements = {};
        this.isEditing = false;
        this.originalTitle = "";
        this.originalDescription = "";
        this.wasEditing = false;

        this.isSavingDetails = false;
        this.saveAbortController = null;

        this.#gatherElements();
        this.#bindUIEvents();
        this.#bindBusEvents();

        this.elements.editDeleteDiv.classList.remove("d-none");
        this.elements.editCoverImageButton.classList.remove("d-none");

        this.#updateUI(this.store.getState().gameMapDetails);
    }

    #gatherElements() {
        this.elements.editMapButton = document.getElementById("editMapButton");
        this.elements.enterEditModeBtn = document.getElementById("enterEditModeBtn");
        this.elements.editCoverImageButton = document.getElementById("editCoverImageButton");
        this.elements.saveDetailsBtn = document.getElementById("saveDetailsBtn");
        this.elements.cancelDetailsBtn = document.getElementById("cancelDetailsBtn");
        this.elements.detailsEditActions = document.getElementById("detailsEditActions");
        this.elements.titleDisplay = document.getElementById("titleDisplay");
        this.elements.titleInput = document.getElementById("titleInput");
        this.elements.descriptionDisplay = document.getElementById("descriptionDisplay");
        this.elements.descriptionInput = document.getElementById("descriptionInput");
        this.elements.editDeleteDiv = document.getElementById("editDeleteDiv");
        this.elements.deleteGameMapButton = document.getElementById("deleteGameMapButton");
    }

    #bindUIEvents() {
        this.elements.editMapButton.addEventListener("click", (event) => {
            window.location.href = getEditMapUrlFromLocation(window.location.href);
        });

        this.elements.enterEditModeBtn.addEventListener("click", () => {
            this.#enterEditMode();
        });

        this.elements.editCoverImageButton.addEventListener("click", () => {
            this.bus.emit(EVENTS.UI_MODAL_REQUESTED, { modalType: "cover_image" });
        });

        this.elements.deleteGameMapButton.addEventListener("click", () => {
            const state = this.store.getState();
            this.bus.emit(EVENTS.UI_MODAL_REQUESTED, { modalType: "delete_game_map", gameMapId: state.gameMapId, gameMapName: state.gameMapDetails.title });
        });

        this.elements.cancelDetailsBtn.addEventListener("click", () => {
            this.#exitEditMode();
        });

        this.elements.titleInput.addEventListener("keyup", (event) => {
            if (event.key == "Escape") {
                event.preventDefault();
                this.#exitEditMode();
            }
        });

        this.elements.descriptionInput.addEventListener("keyup", (event) => {
            if (event.key == "Escape") {
                event.preventDefault();
                this.#exitEditMode();
            }
        });

        this.elements.saveDetailsBtn.addEventListener("click", () => {
            this.#handleSaveDetails();
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.STATE_UPDATED, ({ state }) => {
            this.#updateUI(state.gameMapDetails);
        });

        this.bus.on(EVENTS.UI_MODAL_CONFIRMED, async ({ modalType }) => {
            if (modalType == "delete_game_map") {
                if (!this.isSavingDetails) {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Pálya törlése folyamatban...", type: "info", autohide: false, spinner: true });
                    try {
                        await deleteGameMap(this.store.getState().gameMapId);
                        window.location.href = "/game-maps";
                    } catch (error) {
                        this.bus.emit(EVENTS.TOAST_SHOW, { msg: error.message || "Nem sikerült törölni a pályát!", type: "danger" });
                    }
                } else {
                    this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Nem lehet törölni a pályát, amíg a részletek mentése folyamatban van!", type: "danger" });
                }
            }
        });
    }

    #updateUI(gameMapDetails) {
        const enabled = this.isEditing;

        this.elements.titleDisplay.classList.toggle("d-none", enabled);
        this.elements.descriptionDisplay.classList.toggle("d-none", enabled);
        this.elements.titleInput.classList.toggle("d-none", !enabled);
        this.elements.descriptionInput.classList.toggle("d-none", !enabled);
        this.elements.detailsEditActions.classList.toggle("d-none", !enabled);
        this.elements.enterEditModeBtn.classList.toggle("d-none", enabled);
        this.elements.enterEditModeBtn.disabled = enabled;
        this.elements.saveDetailsBtn.classList.toggle("d-none", !enabled);
        this.elements.saveDetailsBtn.disabled = this.isSavingDetails;
        this.elements.cancelDetailsBtn.disabled = this.isSavingDetails;

        if (!enabled) {
            this.elements.titleInput.value = gameMapDetails.title;
            this.elements.descriptionInput.value = gameMapDetails.description;
        }

        if (enabled && !this.wasEditing) {
            this.elements.titleInput.value = gameMapDetails.title;
            this.elements.descriptionInput.value = gameMapDetails.description;
            this.elements.titleInput.focus();
            this.elements.titleInput.select();
        }

        this.wasEditing = enabled;
    }

    #enterEditMode() {
        const isAllowed = !this.isEditing;

        if (isAllowed) {
            const state = this.store.getState();

            this.isEditing = true;
            this.originalTitle = state.gameMapDetails.title;
            this.originalDescription = state.gameMapDetails.description;

            this.#updateUI(state.gameMapDetails);
        }
    }

    #exitEditMode() {
        const isCancelling = this.isEditing;

        if (isCancelling) {
            const state = this.store.getState();

            this.isEditing = false;
            this.#updateUI(state.gameMapDetails);
        }
    }

    async #handleSaveDetails() {
        const canStartSave = this.isEditing && !this.isSavingDetails;

        if (canStartSave) {
            const gameMapId = this.store.getState().gameMapId;
            const titleValue = this.elements.titleInput.value.trim();
            const descriptionValue = this.elements.descriptionInput.value.trim();
            const dataToSend = this.#checkChanged(titleValue, descriptionValue);
            const validationResult = this.#validateData(dataToSend);
            const hasChanges = Object.keys(dataToSend).length > 0;

            if (hasChanges) {
                if (validationResult.isValid) {
                    this.isSavingDetails = true;
                    this.#updateUI(this.store.getState().gameMapDetails);

                    if (this.saveAbortController) {
                        this.saveAbortController.abort();
                    }

                    this.saveAbortController = new AbortController();
                    const loadingToastId = Math.random().toString();

                    this.bus.emit(EVENTS.TOAST_SHOW, {
                        msg: "Pályaadatok mentése",
                        type: "info",
                        id: loadingToastId,
                        autohide: false,
                        spinner: true
                    });

                    try {
                        await updateGameMapDetails(gameMapId, dataToSend, this.saveAbortController.signal);

                        const detailsUpdate = {};

                        if (dataToSend.title != undefined) {
                            detailsUpdate.title = dataToSend.title;
                            this.originalTitle = dataToSend.title;
                        }

                        if (dataToSend.description != undefined) {
                            detailsUpdate.description = dataToSend.description;
                            this.originalDescription = dataToSend.description;
                        }

                        this.isEditing = false;
                        this.store.setState({
                            gameMapDetails: detailsUpdate
                        });

                        this.bus.emit(EVENTS.TOAST_SHOW, {
                            msg: "A pálya adatai sikeresen frissítve.",
                            type: "success"
                        });
                    } catch (error) {
                        if (error.name != "AbortError") {
                            this.bus.emit(EVENTS.TOAST_SHOW, {
                                msg: error.message || "Nem sikerült frissíteni a pálya adatait.",
                                type: "danger"
                            });
                        }
                    } finally {
                        this.isSavingDetails = false;
                        this.saveAbortController = null;
                        this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: loadingToastId });
                        this.#updateUI(this.store.getState().gameMapDetails);
                    }
                } else {
                    this.bus.emit(EVENTS.TOAST_SHOW, {
                        msg: validationResult.message,
                        type: "danger"
                    });
                }
            } else {
                this.#exitEditMode();
            }
        } else {
            if (this.isEditing) {
                this.bus.emit(EVENTS.TOAST_SHOW, {
                    msg: "Már folyamatban van az adatok mentése, kérlek várj!",
                    type: "danger"
                });
            }
        }
    }

    #checkChanged(titleValue, descriptionValue) {
        const data = {};

        if (titleValue != this.originalTitle) {
            data.title = titleValue;
        }

        if (descriptionValue != this.originalDescription) {
            data.description = descriptionValue;
        }

        return data;
    }

    #validateData(data) {
        let isValid = true;
        let message = "";
        const hasTitle = data.title != undefined;
        const hasDescription = data.description != undefined;

        if (hasTitle && isValid) {
            const title = data.title;

            if (title.length < TITLE_MIN_LENGTH) {
                isValid = false;
                message = "A pálya címének legalább 3 karakter hosszúnak kell lennie!";
            }

            if (title.length > TITLE_MAX_LENGTH && isValid) {
                isValid = false;
                message = "A pálya címe maximum 50 karakter hosszú lehet!";
            }

            if (!DETAILS_ALLOWED_PATTERN.test(title) && isValid) {
                isValid = false;
                message = "A pálya címe csak betűket, számokat, szóközöket, kötőjeleket és alulvonásokat tartalmazhat!";
            }
        }

        if (hasDescription && isValid) {
            const description = data.description;

            if (description.length < DESCRIPTION_MIN_LENGTH) {
                isValid = false;
                message = "A pálya leírásának legalább 3 karakter hosszúnak kell lennie!";
            }

            if (description.length > DESCRIPTION_MAX_LENGTH && isValid) {
                isValid = false;
                message = "A pálya leírása maximum 255 karakter hosszú lehet!";
            }

            if (!DETAILS_ALLOWED_PATTERN.test(description) && isValid) {
                isValid = false;
                message = "A pálya leírása csak betűket, számokat, szóközöket, kötőjeleket és alulvonásokat tartalmazhat!";
            }
        }

        return { isValid, message };
    }
}
