import { CONSTANTS } from "../../shared/constants.js";

export class BreakpointManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;

        this.#bindEvents();
    }

    #bindEvents() {
        window.addEventListener("resize", () => {
            this.#checkBreakpont();
        });
    }

    #checkBreakpont() {
        const isMobile = window.innerWidth <= CONSTANTS.MOBILE_BREAKPOINT;
        const currentState = this.store.getState().isMobile;

        if (isMobile != currentState) {
            this.store.setState({ isMobile });
        }
    }
}
