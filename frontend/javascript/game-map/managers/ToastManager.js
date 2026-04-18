import { EVENTS } from "../shared/EventBus.js";
import { showToast } from "../shared/utils.js";

export class ToastManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.toasts = {};
        this.elements = {};
        this.#gatherElements();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements.toastPlace = document.getElementById("toastPlace");
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.TOAST_SHOW, ({ id, msg, type, closable = true, duration = 3000, autohide = true }) => {
            let options = { autohide, delay: duration };
            let toast = showToast(this.elements.toastPlace, msg, type, closable, options, () => {
                if (id) {
                    delete this.toasts[id];
                }
            });

            if (id) {
                this.toasts[id] = toast;
            }
        });

        this.bus.on(EVENTS.TOAST_HIDE_ID, ({ id }) => {
            if (this.toasts[id]) {
                this.toasts[id].hide();
                delete this.toasts[id];
            }
        });
    }
}
