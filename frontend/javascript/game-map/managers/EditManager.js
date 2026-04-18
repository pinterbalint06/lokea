import { EVENTS } from "../shared/EventBus.js";
import { getEditMapUrlFromLocation } from "../shared/utils.js";

export class EditManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;
        this.elements = {};
        this.isEditing = false;
        this.originalTitle = "";
        this.originalDescription = "";
        this.wasEditing = false;

        this.#gatherElements();
        this.elements.editDeleteDiv.classList.remove("d-none");
        this.#bindUIEvents();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements.editMapButton = document.getElementById("editMapButton");
        this.elements.enterEditModeBtn = document.getElementById("enterEditModeBtn");
        this.elements.saveDetailsBtn = document.getElementById("saveDetailsBtn");
        this.elements.cancelDetailsBtn = document.getElementById("cancelDetailsBtn");
        this.elements.detailsEditActions = document.getElementById("detailsEditActions");
        this.elements.titleDisplay = document.getElementById("titleDisplay");
        this.elements.titleInput = document.getElementById("titleInput");
        this.elements.descriptionDisplay = document.getElementById("descriptionDisplay");
        this.elements.descriptionInput = document.getElementById("descriptionInput");
        this.elements.editDeleteDiv = document.getElementById("editDeleteDiv");
    }

    #bindUIEvents() {
        this.elements.editMapButton.addEventListener("click", (event) => {
            window.location.href = getEditMapUrlFromLocation(window.location.href);
        });
        this.elements.enterEditModeBtn.addEventListener("click", () => {
            this.#enterEditMode();
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
            this.isEditing = false;
            this.store.setState({
                gameMapDetails: {
                    title: this.elements.titleInput.value,
                    description: this.elements.descriptionInput.value
                }
            });
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.STATE_UPDATED, ({ state }) => {
            this.#updateUI(state.gameMapDetails);
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

        this.elements.titleInput.value = gameMapDetails.title;
        this.elements.descriptionInput.value = gameMapDetails.description;

        if (enabled && !this.wasEditing) {
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
}
