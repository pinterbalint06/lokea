import { EVENTS } from "../shared/EventBus.js";
import { Modal } from "../../libs/elements/Modal.js";
import { createElement } from "../../libs/utils/DOMUtils.js";
import { createSVGIcon } from "../../libs/utils/svgUtils.js";
import { ICONS } from "../../libs/icons/icons.js";
import { DragAndDropUploader } from "../../libs/elements/DragAndDropUploader.js";

export class ModalManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;
        this.wrapperElement = document.getElementById("modal-wrapper");
        this.modal = new Modal(this.wrapperElement);

        this.currentContext = null;

        this.coverUploader = null;
        this.coverUploaderWrapper = null;

        this.#bindModalEvents();
        this.#bindBusEvents();
    }

    #bindModalEvents() {
        this.modal.addEventListener("hidden", () => {
            this.coverUploader = null;
            this.coverUploaderWrapper = null;
            this.currentContext = null;
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.UI_MODAL_REQUESTED, ({ modalType }) => {
            if (modalType == "cover_image") {
                this.#showCoverImageModal();
            }
        });
    }

    #showCoverImageModal() {
        this.currentContext = {
            type: "cover_image",
            file: null
        };

        this.coverUploaderWrapper = createElement("div", { class: "dropzone p-3" });
        this.coverUploader = new DragAndDropUploader(this.coverUploaderWrapper, {
            titleText: "Húzd ide a borítóképet",
            buttonText: "Kattints ide feltöltéshez",
            accept: "image/*"
        });

        this.coverUploader.addEventListener("fileDropped", (event) => {
            const file = event.detail.file;
            this.modal.hide();
            this.bus.emit(EVENTS.UI_MODAL_CONFIRMED, {
                modalType: "cover_image",
                file: file
            });
        });

        this.modal.show({
            title: "Borítókép szerkesztése",
            icon: createSVGIcon(ICONS.EDIT, {
                height: "1.2em",
                fill: "currentColor"
            }),
            body: [this.coverUploaderWrapper],
            cancelText: "Mégse",
            hideConfirmButton: true,
            isStatic: false
        });
    }
}