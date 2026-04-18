import { EVENTS } from "../shared/EventBus.js";
import { showToast } from "../shared/utils.js";
import { createSpinnerIcon } from "../../libs/utils.js";

export class ToastManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.toasts = {};
        this.toastPlace = document.getElementById("toastPlace");

        this.#bindBusEvents();
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.TOAST_SHOW, ({ id, msg, type, closable = true, duration = 3000, autohide = true, spinner = false, callback }) => {
            let spinerObject;
            if (spinner) {
                spinerObject = createSpinnerIcon();
            }
            let options = { autohide, delay: duration };
            let toast = showToast(
                this.toastPlace,
                msg,
                type,
                closable,
                options,
                spinerObject,
                () => {
                    if (callback) {
                        callback();
                    }
                    if (id) {
                        delete this.toasts[id];
                    }
                }
            );

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
