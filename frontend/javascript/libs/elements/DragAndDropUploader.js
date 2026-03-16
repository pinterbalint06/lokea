import { createElement } from "../utils/DOMUtils.js";
import { ICONS } from "../icons/icons.js";
import { createSVGIcon } from "../utils/svgUtils.js";

export class DragAndDropUploader extends EventTarget {
    /**
    * creates a drag-and-drop upload inside the provided wrapper.
    *
    * @param {HTMLElement} wrapperElement element in which the uploader is created.
    * @param {Object} config
    * @param {string} config.titleText title shown above the upload button
    * @param {string} config.buttonText text inside the upload button
    * @param {string} config.accept value for the hidden file input accept attribute.
     */
    constructor(wrapperElement, config) {
        super();

        this.wrapperElement = wrapperElement;
        this.wrapperElement.classList.add("text-center", "dropzone", "border-dashed", "rounded-3");

        let fragment = new DocumentFragment();

        const iconWrapper = createElement("div", { class: "mb-3" });
        const icon = createSVGIcon(
            ICONS.UPLOAD_CLOUD,
            {
                height: "3em",
                fill: "white"
            }
        );
        iconWrapper.appendChild(icon);

        const title = createElement("h4");
        title.innerText = config.titleText;

        const separator = createElement("p", { class: "text-muted" });
        separator.innerText = "vagy";

        this.uploadBtn = createElement("button", {
            type: "button",
            class: "btn uvegbutton rounded-pill"
        });
        this.uploadBtn.innerText = config.buttonText;

        this.fileInput = createElement("input", {
            type: "file",
            hidden: true,
            accept: config.accept
        });

        fragment.appendChild(iconWrapper);
        fragment.appendChild(title);
        fragment.appendChild(separator);
        fragment.appendChild(this.uploadBtn);
        fragment.appendChild(this.fileInput);

        this.wrapperElement.appendChild(fragment);

        this.#bindUIEvents();
    }

    #bindUIEvents() {
        this.uploadBtn.addEventListener("click", () => this.fileInput.click());

        this.fileInput.addEventListener("change", (event) => {
            if (event.target.files.length > 0) {
                this.dispatchEvent(new CustomEvent("fileDropped", {
                    detail: { file: event.target.files[0] }
                }));
            }

            event.target.value = "";
        });

        this.wrapperElement.addEventListener("dragover", (event) => {
            event.preventDefault();

            let draggedFiles = [...event.dataTransfer.items].filter(item => item.kind == "file");

            if (draggedFiles.length > 0) {
                event.dataTransfer.dropEffect = "copy";
                this.wrapperElement.classList.add("dropfocus");
            } else {
                event.dataTransfer.dropEffect = "none";
            }
        });

        this.wrapperElement.addEventListener("dragleave", (event) => {
            event.preventDefault();
            this.wrapperElement.classList.remove("dropfocus");
        });

        this.wrapperElement.addEventListener("drop", (event) => {
            event.preventDefault();
            this.wrapperElement.classList.remove("dropfocus");

            let file = event.dataTransfer.files[0];

            if (file) {
                this.dispatchEvent(new CustomEvent("fileDropped", {
                    detail: { file }
                }));
            }
        });
    }

    openFileDialog() {
        this.fileInput.value = "";
        this.fileInput.click();
    }
}
