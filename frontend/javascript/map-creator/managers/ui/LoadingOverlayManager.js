import { EVENTS } from "../../shared/EventBus.js";

export class LoadingOverlayManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.elements = {};

        this.#gatherElements();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements.loadingOverlay = document.getElementById("loading");
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.HIDE_LOADING, () => {
            this.elements.loadingOverlay.classList.add("d-none");
        });
    }
}