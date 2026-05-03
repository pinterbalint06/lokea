import { EVENTS } from "../shared/EventBus.js";
import { formatSecondsToMinutes } from "../../libs/utils/timer-conversion.js";
import { startGameSession } from "../shared/api.js";
import { ContinueGameModal } from "../../libs/elements/ContinueGameModal.js";
import { fetchActiveGameSession, finishGameSession } from "../../libs/network/gameSession.js";

export class GameStartManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;
        this.elements = {};
        this.isStarting = false;

        this.#gatherElements();
        this.#bindUIEvents();
    }

    #gatherElements() {
        this.elements.startPanel = document.getElementById("gameStartPanel");
        this.elements.startForm = document.getElementById("gameStartForm");
        this.elements.roundsInput = document.getElementById("gameStartRounds");
        this.elements.difficultySelect = document.getElementById("gameStartDifficulty");
        this.elements.roundTimeInput = document.getElementById("gameStartTime");
        this.elements.roundTimeDisplay = document.getElementById("gameStartTimeValue");
        this.elements.startButton = document.getElementById("startGameButton");
        this.elements.cancelButton = document.getElementById("cancelStartButton");
        this.elements.playButton = document.getElementById("playMapButton");
        this.elements.modalWrapper = document.getElementById("modal-wrapper");
        this.continueGameModal = new ContinueGameModal(this.elements.modalWrapper);
    }

    #bindUIEvents() {
        this.#updateTimeDisplay();
        this.elements.roundTimeInput.addEventListener("input", () => this.#updateTimeDisplay());

        this.elements.startForm.addEventListener("submit", (event) => this.#handleStartSubmit(event));

        this.elements.cancelButton.addEventListener("click", () => this.#hideStartForm());

        this.elements.playButton.addEventListener("click", () => this.#handlePlayClick());
    }

    #updateTimeDisplay() {
        const seconds = parseInt(this.elements.roundTimeInput.value);
        this.elements.roundTimeDisplay.innerText = formatSecondsToMinutes(seconds);
    }

    #showStartForm() {
        this.elements.startPanel.classList.add("active");
    }

    #hideStartForm() {
        this.elements.startPanel.classList.remove("active");
    }

    async #handlePlayClick() {
        let shouldOpenForm = true;

        try {
            const activeGameSession = await fetchActiveGameSession();

            if (activeGameSession?.hasActiveSession) {
                this.continueGameModal.show(
                    activeGameSession.gameTitle,
                    () => {
                        window.location.href = "/game";
                    },
                    async () => {
                        try {
                            await finishGameSession();
                            this.#showStartForm();
                        } catch (error) {
                            this.bus.emit(EVENTS.TOAST_SHOW, {
                                msg: error.message || "A játék befejezése nem sikerült.",
                                type: "danger"
                            });
                        }
                    }
                );
                shouldOpenForm = false;
            }
        } catch {

        }

        if (shouldOpenForm) {
            this.#showStartForm();
        }
    }

    async #handleStartSubmit(event) {
        event.preventDefault();

        if (!this.isStarting) {
            this.isStarting = true;

            try {
                const state = this.store.getState();
                const gameMapId = state.gameMapId;

                if (!gameMapId) {
                    throw new Error("Nincs érvényes pálya kiválasztva.");
                }

                const formData = new FormData(this.elements.startForm);
                formData.append("gameMapId", gameMapId);

                await startGameSession(formData);

                this.isStarting = false;
                window.location.href = "/game";
            } catch (error) {
                this.isStarting = false;
                this.bus.emit(EVENTS.TOAST_SHOW, {
                    msg: error.message || "A játék indítása nem sikerült.",
                    type: "danger"
                });
            }
        }
    }
}
