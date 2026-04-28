import { createSVGIcon } from "../utils/svgUtils.js";
import { ICONS } from "../icons/icons.js";
import { createElement } from "../utils/DOMUtils.js";

export class CustomSelect extends EventTarget {
    #selectedValue;
    #options;
    #documentClickListener;
    #optionBuilder;
    #isOpen;

    constructor(wrapperElement, optionBuilder = null) {
        super();

        this.#selectedValue = null;
        this.#options = {};
        this.wrapperElement = wrapperElement;
        this.#isOpen = false;
        let fragment = new DocumentFragment();

        if (typeof optionBuilder == "function") {
            this.#optionBuilder = optionBuilder;
        } else {
            this.#optionBuilder = (value, text) => {
                let textSpan = document.createElement("span");
                textSpan.innerText = text;
                return textSpan;
            }
        }

        this.triggerText = createElement("span");
        this.chevronIcon = createSVGIcon(ICONS.CHEVRON, {
            height: "1.2em",
            fill: "white",
            transition: "transform 0.3s ease"
        });
        this.chevronIcon.classList.add("custom-select-chevron");

        this.triggerButton = createElement("button",
            {
                class: "btn btn-sm border-0 bg-transparent fw-bold text-white d-flex align-items-center gap-2 p-0 shadow-none"
            },
            [this.triggerText, this.chevronIcon]
        );

        this.optionsContainer = createElement("div", {
            class: "custom-options-container custom-scrollbar"
        });

        this.dropdown = createElement("div",
            {
                class: "custom-select-menu uveg position-absolute rounded-3 shadow opacity-0 pointer-events-none transition-all"
            },
            [this.optionsContainer]
        );

        this.#bindUIEvents();


        fragment.appendChild(this.triggerButton);
        fragment.appendChild(this.dropdown);

        this.wrapperElement.appendChild(fragment);
    }

    #bindUIEvents() {
        this.triggerButton.addEventListener("click", () => {
            this.#isOpen ? this.close() : this.open();
        });

        this.optionsContainer.addEventListener("click", (event) => {
            let optionDiv = event.target.closest(".custom-option");
            if (optionDiv) {
                let optionDataValue = optionDiv.getAttribute("data-value");
                let textValue = this.#options[optionDataValue];

                if (textValue != undefined && optionDataValue != this.#selectedValue) {
                    let changeEvent = new CustomEvent("change", {
                        detail: { value: optionDataValue },
                        cancelable: true
                    });

                    let isAllowed = this.dispatchEvent(changeEvent);

                    if (isAllowed) {
                        this.triggerText.innerText = textValue;
                        this.#selectedValue = optionDataValue;
                    }
                }

                this.close();
            }
        });

        this.#documentClickListener = (event) => {
            if (this.#isOpen && !this.wrapperElement.contains(event.target)) {
                this.close();
            }
        };

        document.addEventListener("click", this.#documentClickListener);
    }

    // Public functions

    destroy() {
        document.removeEventListener("click", this.#documentClickListener);
        this.wrapperElement.innerHTML = "";
    }

    close() {
        this.#isOpen = false;
        this.dropdown.classList.add("opacity-0", "pointer-events-none");
        this.dropdown.classList.remove("show");
        this.chevronIcon.classList.remove("open");
    }

    open() {
        this.#isOpen = true;
        this.dropdown.classList.remove("opacity-0", "pointer-events-none");
        this.dropdown.classList.add("show");
        this.chevronIcon.classList.add("open");
    }

    isOpened() {
        return this.#isOpen;
    }

    clearOptions() {
        this.#options = {};
        this.#selectedValue = null;
        this.triggerText.innerText = "";
        this.optionsContainer.innerHTML = "";
    }

    addOption(value, text) {
        this.#options[value] = text;
        const optionDiv = createElement("div",
            {
                class: "custom-option",
                "data-value": value
            },
            [this.#optionBuilder(value, text)]
        );
        this.optionsContainer.appendChild(optionDiv);
    }

    getValue() {
        return this.#selectedValue;
    }

    setValue(value) {
        let chosenOptionValue = this.#options[value];

        if (chosenOptionValue != undefined) {
            this.#selectedValue = value;

            const option = this.optionsContainer.querySelector(`.custom-option[data-value="${value}"]`);
            if (option) {
                let currentSelected = this.optionsContainer.querySelectorAll(".custom-option.selected");

                for (const selectedOption of currentSelected) {
                    selectedOption.classList.remove("selected");
                }

                option.classList.add("selected");
                this.triggerText.innerText = chosenOptionValue;
            }
        }
    }

    updateOptionText(value, text) {
        if (this.#options[value] != undefined) {
            this.#options[value] = text;

            if (this.#selectedValue == value) {
                this.triggerText.innerText = text;
            }
        }
    }
}
