import { EVENTS } from "../../shared/EventBus.js";
import { createSVGIcon } from "../../../libs/utils/svgUtils.js";
import { showToast, createSpinnerIcon } from "../../shared/utils.js";

export class ToastManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.toasts = {};
        this.toastPlace = document.getElementById("toastPlace");

        this.#bindBusEvents();
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.TOAST_SHOW, ({ id, msg, type, closable = true, iconObject, duration = 3000, autohide = true, spinner = false, callback }) => {
            let icon;
            if (spinner) {
                icon = createSpinnerIcon();
            } else {
                icon = iconObject ? createSVGIcon(iconObject, { height: "1em", fill: "currentColor" }) : null;
            }
            let options = { autohide, delay: duration };
            let toast = showToast(
                this.toastPlace,
                msg,
                type,
                closable,
                options,
                icon,
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
