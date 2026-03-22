import { createElement } from "../utils/DOMUtils.js";

export class DegreeInput extends EventTarget {
    #value;
    #min;
    #max;
    #prevValue;

    /**
     * @param {HTMLElement} wrapperElement
     * @param {Object} config
     * @param {string} config.min min value for the degree input default 0
     * @param {string} config.max max value for the degree input default 359
     * @param {string} config.value initial value for the degree input default 0
     * 
     */
    constructor(wrapperElement, config = {}) {
        super();
        this.wrapperElement = wrapperElement;
        this.#min = config.min ?? 0;
        this.#max = config.max ?? 359;
        this.#value = config.value ?? 0;
        this.#prevValue = this.#value;

        this.wrapperElement.innerHTML = "";
        this.wrapperElement.classList.add("d-flex", "align-items-center", "gap-2", "flex-grow-1");

        this.rangeInput = createElement("input", {
            type: "range",
            class: "form-range glass-range",
            min: this.#min,
            max: this.#max,
            step: 1,
            value: this.#value
        });


        this.numberInput = createElement("input", {
            type: "number",
            class: "form-control uvegform p-1 hide-arrows text-center",
            style: "width: 4em;",
            min: this.#min,
            max: this.#max,
            value: this.#value
        });

        const degreeWrapper = createElement(
            "div",
            { class: "degreeWrapper" },
            [this.numberInput]
        );

        this.wrapperElement.appendChild(this.rangeInput);
        this.wrapperElement.appendChild(degreeWrapper);

        this.#bindEvents();
    }

    #bindEvents() {
        this.rangeInput.addEventListener("input", (event) => {
            const newValue = parseInt(event.target.value);

            this.numberInput.value = newValue;

            this.#value = newValue;
            this.dispatchEvent(new CustomEvent("input", { detail: { value: this.#value } }));
        });

        this.rangeInput.addEventListener("change", (event) => {
            const newValue = parseInt(event.target.value);

            this.#value = newValue;
            this.#prevValue = newValue;
            this.dispatchEvent(new CustomEvent("change", { detail: { value: this.#value } }));
        });

        this.numberInput.addEventListener("focus", () => {
            this.#prevValue = parseInt(this.numberInput.value);
        });

        this.numberInput.addEventListener("change", (e) => {
            const newValue = parseInt(e.target.value);

            if (!isNaN(newValue) && newValue <= this.#min && newValue >= this.#max) {
                this.rangeInput.value = newValue;
                this.#value = newValue;
                this.#prevValue = newValue;
                this.dispatchEvent(new CustomEvent("change", { detail: { value: this.#value } }));
            } else {
                this.numberInput.value = this.#prevValue;
                this.dispatchEvent(new CustomEvent("error", {
                    detail: { message: `A szögnek ${this.#min} és ${this.#max} között kell lennie!` }
                }));
            }
        });
    }

    getValue() {
        return this.#value;
    }

    setValue(val) {
        if (Number.isInteger(val) && val >= this.#min && val <= this.#max) {
            this.#value = val;
            this.#prevValue = val;
            this.rangeInput.value = val;
            this.numberInput.value = val;
        }
    }
}