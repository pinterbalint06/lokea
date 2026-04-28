import { createElement } from "../utils/DOMUtils.js";

export class DegreeInput extends EventTarget {
    #value;
    #min;
    #max;
    #prevValue;

    /**
     * @param {HTMLElement} wrapperElement
     * @param {Object} config
     * @param {number} config.min min value for the degree input default 0
     * @param {number} config.max max value for the degree input default 359.99
     * @param {number} config.value initial value for the degree input default 0
     * */
    constructor(wrapperElement, config = {}) {
        super();
        this.wrapperElement = wrapperElement;
        this.#min = config.min ?? 0;
        this.#max = config.max ?? 359.99;

        const initialValue = config.value ?? 0;
        this.#value = this.#formatToMaxTwoDecimals(initialValue);
        this.#prevValue = this.#value;

        this.wrapperElement.innerHTML = "";
        this.wrapperElement.classList.add("d-flex", "align-items-center", "gap-2", "flex-grow-1");

        this.rangeInput = createElement("input", {
            type: "range",
            class: "form-range glass-range",
            min: this.#min,
            max: this.#max,
            step: 0.01,
            value: this.#value
        });


        this.numberInput = createElement("input", {
            type: "number",
            class: "form-control uvegform p-1 hide-arrows text-center",
            style: "width: 6em;",
            min: this.#min,
            max: this.#max,
            step: 0.01,
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

    #formatToMaxTwoDecimals(val) {
        return Number(parseFloat(val).toFixed(2));
    }

    #bindEvents() {
        this.rangeInput.addEventListener("input", (event) => {
            const newValue = this.#formatToMaxTwoDecimals(event.target.value);

            this.numberInput.value = newValue;
            this.#value = newValue;
            this.dispatchEvent(new CustomEvent("input", { detail: { value: this.#value } }));
        });

        this.rangeInput.addEventListener("change", (event) => {
            const newValue = this.#formatToMaxTwoDecimals(event.target.value);

            this.#value = newValue;
            this.#prevValue = newValue;
            this.dispatchEvent(new CustomEvent("change", { detail: { value: this.#value } }));
        });

        this.numberInput.addEventListener("focus", () => {
            this.#prevValue = this.#formatToMaxTwoDecimals(this.numberInput.value);
        });

        this.numberInput.addEventListener("change", (e) => {
            let newValue = parseFloat(e.target.value);

            if (!isNaN(newValue) && newValue <= this.#max && newValue >= this.#min) {
                newValue = this.#formatToMaxTwoDecimals(newValue);

                this.rangeInput.value = newValue;
                this.numberInput.value = newValue;
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
        if (!isNaN(val) && val >= this.#min && val <= this.#max) {
            const formattedVal = this.#formatToMaxTwoDecimals(val);
            this.#value = formattedVal;
            this.#prevValue = formattedVal;
            this.rangeInput.value = formattedVal;
            this.numberInput.value = formattedVal;
        }
    }
}