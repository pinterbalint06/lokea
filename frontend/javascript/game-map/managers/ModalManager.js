import { EVENTS } from "../shared/EventBus.js";
import { Modal } from "../../libs/elements/Modal.js";
import { createElement } from "../../libs/utils/DOMUtils.js";
import { createSVGIcon } from "../../libs/utils/svgUtils.js";
import { ICONS } from "../../libs/icons/icons.js";
import { DragAndDropUploader } from "../../libs/elements/DragAndDropUploader.js";
import { HoldToUnlockButton } from "../../libs/elements/HoldToUnlockButton.js";

export class ModalManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.wrapperElement = document.getElementById("modal-wrapper");
        this.modal = new Modal(this.wrapperElement);

        this.coverUploader = null;
        this.coverUploaderWrapper = null;

        this.#bindModalEvents();
        this.#bindBusEvents();
    }

    #bindModalEvents() {
        this.modal.addEventListener("hidden", () => {
            this.coverUploader = null;
            this.coverUploaderWrapper = null;
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
        const modalBody = createElement("div", { class: "d-flex flex-column" });

        this.coverUploaderWrapper = createElement("div", { class: "dropzone p-4 rounded-3 border-2" });
        this.coverUploader = new DragAndDropUploader(this.coverUploaderWrapper, {
            titleText: "Húzd ide az új borítóképet",
            buttonText: "Kattints ide feltöltéshez",
            accept: "image/*"
        });

        this.coverUploader.addEventListener("fileDropped", (event) => {
            const file = event.detail.file;
            this.modal.hide();
            this.bus.emit(EVENTS.UI_MODAL_CONFIRMED, {
                modalType: "cover_image",
                file: file,
                action: "upload"
            });
        });

        modalBody.appendChild(this.coverUploaderWrapper);

        const divider = createElement("div", { class: "d-flex align-items-center my-4 opacity-50" });
        const hrLeft = createElement("hr", { class: "flex-grow-1 m-0" });
        const dividerText = createElement("span", { class: "mx-3 small text-uppercase fw-semibold font-space-wide" });
        dividerText.innerText = "Vagy";
        const hrRight = createElement("hr", { class: "flex-grow-1 m-0" });

        divider.appendChild(hrLeft);
        divider.appendChild(dividerText);
        divider.appendChild(hrRight);

        modalBody.appendChild(divider);

        const dangerZone = createElement("div", {
            class: "danger-zone p-3 rounded-3 text-center"
        });

        const dangerWarning = createElement("p", { class: "danger-zone-text small mb-3" });
        dangerWarning.innerText = "Ha eltávolítod a borítóképet, a pálya ismét az alapértelmezett borítóképet fogja használni.";
        dangerZone.appendChild(dangerWarning);

        const deleteButton = createElement("button", {
            class: "btn btn-outline-danger w-100 position-relative fw-semibold",
            type: "button"
        });

        deleteButton.innerText = "Borítókép törlése";

        const holdToDelete = new HoldToUnlockButton(deleteButton, 1500);

        holdToDelete.addEventListener("confirm", () => {
            this.modal.hide();
            this.bus.emit(EVENTS.UI_MODAL_CONFIRMED, {
                modalType: "cover_image",
                action: "delete"
            });
        });

        holdToDelete.addEventListener("earlyClick", () => {
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: "A törléshez tartsd lenyomva a gombot legalább 1,5 másodpercig!",
                type: "warning"
            });
        });

        dangerZone.appendChild(deleteButton);
        modalBody.appendChild(dangerZone);

        this.modal.show({
            title: "Borítókép szerkesztése",
            icon: createSVGIcon(ICONS.EDIT, {
                height: "1.2em",
                fill: "currentColor"
            }),
            body: [modalBody],
            cancelText: "Mégse",
            hideConfirmButton: true,
            isStatic: false
        });
    }
}