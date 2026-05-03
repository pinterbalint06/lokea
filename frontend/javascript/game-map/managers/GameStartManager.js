import { EVENTS } from "../shared/EventBus.js";
import { formatSecondsToMinutes } from "../../libs/utils/timer-conversion.js";
import { startGameSession } from "../shared/api.js";

export class GameStartManager {
    constructor(eventBus, appStore) {
        this.eventBus = eventBus;
        this.appStore = appStore;
        this.isStarting = false;

        this.#initializeFormElements();
        this.#bindFormEvents();
    }

    #initializeFormElements() {
        this.startPanel = document.getElementById("gameStartPanel");
        this.startForm = document.getElementById("gameStartForm");
        this.roundsInput = document.getElementById("gameStartRounds");
        this.difficultySelect = document.getElementById("gameStartDifficulty");
        this.roundTimeInput = document.getElementById("gameStartTime");
        this.roundTimeDisplay = document.getElementById("gameStartTimeValue");
        this.startButton = document.getElementById("startGameButton");
        this.cancelButton = document.getElementById("cancelStartButton");
    }

    #bindFormEvents() {
        this.#updateTimeDisplay();
        this.roundTimeInput.addEventListener("input", () => this.#updateTimeDisplay());

        this.startForm.addEventListener("submit", (event) => this.#handleFormSubmit(event));

        this.cancelButton.addEventListener("click", () => this.#closeForm());

        const playButton = document.getElementById("playMapButton");
        if (playButton) {
            playButton.addEventListener("click", () => this.#openForm());
        }
    }

    #updateTimeDisplay() {
        const seconds = parseInt(this.roundTimeInput.value);
        this.roundTimeDisplay.innerText = formatSecondsToMinutes(seconds);
    }

    #openForm() {
        this.startPanel.classList.add("active");
    }

    #closeForm() {
        this.startPanel.classList.remove("active");
    }

    async #handleFormSubmit(event) {
        event.preventDefault();

        if (!this.isStarting) {
            this.isStarting = true;

            try {
                const state = this.appStore.getState();
                const gameMapId = state.gameMapId;

                if (!gameMapId) {
                    throw new Error("Nincs érvényes pálya kiválasztva.");
                }

                const formData = new FormData(this.startForm);
                formData.append("gameMapId", gameMapId);

                await startGameSession(formData);

                this.isStarting = false;
                window.location.href = "/game";
            } catch (error) {
                this.isStarting = false;
                this.eventBus.emit(EVENTS.TOAST_SHOW, {
                    msg: error.message || "A játék indítása nem sikerült.",
                    type: "danger"
                });
            }
        }
    }
}
