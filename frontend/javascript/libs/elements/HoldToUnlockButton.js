export class HoldToUnlockButton extends EventTarget {
    #button;

    #timer;
    #isUnlocked;
    #unlockedDuringPress;

    #clickCount
    #clickTimeout;

    constructor(button, duration = 2000) {
        super();
        this.#button = button;
        this.duration = duration;

        this.#button.classList.add("btn-hold-to-unlock");
        this.#button.style.setProperty("--hold-duration", `${this.duration}ms`);

        this.#timer = null;
        this.#isUnlocked = false;
        this.#unlockedDuringPress = false;

        this.#clickCount = 0;
        this.#clickTimeout = null;

        this.#bindUIEvents();
    }

    #bindUIEvents() {
        let startHold = (event) => {
            // not right click
            if (!(event.pointerType == "mouse" && event.button != 0)) {
                if (!this.#isUnlocked) {
                    clearTimeout(this.#timer);
                    this.#button.classList.add("filling");
                    this.#timer = setTimeout(() => this.#unlock(), this.duration);
                }
            }
        };

        let stopHold = () => {
            if (!this.#isUnlocked) {
                clearTimeout(this.#timer);
                this.#button.classList.remove("filling");
            }
        };

        this.#button.addEventListener("pointerdown", startHold);
        this.#button.addEventListener("pointerup", stopHold);
        this.#button.addEventListener("pointerleave", stopHold);
        this.#button.addEventListener("pointercancel", stopHold);

        this.#button.addEventListener("click", (event) => {
            if (this.#isUnlocked) {
                if (this.#unlockedDuringPress) {
                    this.#unlockedDuringPress = false;
                } else {
                    let confirmEvent = new CustomEvent("confirm", {
                        detail: { originalEvent: event }
                    });
                    this.dispatchEvent(confirmEvent);
                    this.reset();
                }
            } else {
                event.preventDefault();
                event.stopPropagation();

                this.#clickCount++;
                clearTimeout(this.#clickTimeout);

                if (this.#clickCount >= 2) {
                    let earlyClickEvent = new Event("earlyClick");
                    this.dispatchEvent(earlyClickEvent);
                    this.#clickCount = 0;
                } else {
                    this.#clickTimeout = setTimeout(() => {
                        this.#clickCount = 0;
                    }, 2000);
                }
            }
        });
    }

    #unlock() {
        this.#isUnlocked = true;
        this.#unlockedDuringPress = true;
        this.#button.classList.remove("filling");
        this.#button.classList.add("unlocked");
        this.#clickCount = 0;
    }

    reset() {
        clearTimeout(this.#timer);
        this.#isUnlocked = false;
        this.#unlockedDuringPress = false;
        this.#button.classList.remove("filling", "unlocked");
        this.#clickCount = 0;
    }
}