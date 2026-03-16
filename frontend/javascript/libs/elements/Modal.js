import { createElement } from "../utils/DOMUtils.js";
import { HoldToUnlockButton } from "./HoldToUnlockButton.js";

export class Modal extends EventTarget {
    constructor(wrapperElement) {
        super();
        this.wrapperElement = wrapperElement;
        this.modalElement = null;
        this.bsModal = null;
        this.holdBtnInstance = null;
        this.confirmBtn = null;
        this.titleId = null;
    }

    /**
     * @param {Object} config
     * @param {string} config.title - modal title
     * @param {Node} [config.icon] - optional icon DOM node to show next to the title
     * @param {Node[]} config.body - modal body content DOM node
     * @param {string} [config.confirmText] - confirm button text
     * @param {string} [config.cancelText] - cancel button text
     * @param {boolean} [config.dangerStyle] - if true, apply danger styling (red border/icon)
     * @param {string} [config.confirmBtnClass] - additional class for the confirm button (e.g. 'btn-danger')
     * @param {number|boolean} [config.holdToUnlock] - if a number (ms), use HoldToUnlockButton with that duration
     * @param {boolean} [config.isStatic] - if true, backdrop is static and modal won't close on backdrop click
     */
    show(config) {
        this.destroy();

        this.titleId = `dynamic-modal-title-${Date.now()}`;
        this.modalElement = createElement("div", {
            class: "modal fade",
            tabindex: "-1",
            "aria-hidden": "true",
            "aria-labelledby": this.titleId
        });

        const modalDialog = createElement("div", { class: "modal-dialog modal-dialog-centered" });
        const modalContent = createElement("div", {
            class: config.dangerStyle
                ? "modal-content uveg border-danger border-opacity-25"
                : "modal-content uveg"
        });

        const modalHeader = createElement("div", {
            class: config.dangerStyle
                ? "modal-header border-bottom border-secondary border-opacity-25"
                : "modal-header"
        });

        const titleContainer = createElement("h1", {
            id: this.titleId,
            class: "modal-title fs-5 d-flex align-items-center gap-2"
        });
        if (config.dangerStyle) {
            titleContainer.classList.add("text-danger");
        }

        if (config.icon) {
            const iconWrapper = createElement("span", { class: "d-inline-flex align-items-center" });
            iconWrapper.appendChild(config.icon);
            titleContainer.appendChild(iconWrapper);
        }

        const titleSpan = createElement("span");
        titleSpan.innerText = config.title;
        titleContainer.appendChild(titleSpan);

        const closeBtn = createElement("button", {
            type: "button",
            class: config.dangerStyle ? "btn-close btn-close-white" : "btn-close",
            "data-bs-dismiss": "modal",
            "aria-label": "Close"
        });

        modalHeader.append(titleContainer, closeBtn);

        const modalBody = createElement("div", { class: "modal-body" });
        config.body.forEach(node => modalBody.appendChild(node));

        const modalFooter = createElement("div", {
            class: config.dangerStyle
                ? "modal-footer border-top border-secondary border-opacity-25"
                : "modal-footer"
        });

        const cancelBtn = createElement("button", {
            type: "button",
            class: "btn btn-outline-secondary rounded-pill px-3",
            "data-bs-dismiss": "modal"
        });
        cancelBtn.innerText = config.cancelText || "Mégse";

        const defaultConfirmClass = config.dangerStyle ? "btn-danger" : "btn-primary";
        this.confirmBtn = createElement("button", {
            type: "button",
            class: `btn ${config.confirmBtnClass || defaultConfirmClass} rounded-pill px-3`
        });
        this.confirmBtn.innerText = config.confirmText || "OK";

        const holdDuration = typeof config.holdToUnlock == "number" ? config.holdToUnlock : 0;
        if (holdDuration > 0) {
            this.holdBtnInstance = new HoldToUnlockButton(this.confirmBtn, holdDuration);
            this.holdBtnInstance.addEventListener("confirm", (event) => {
                event.detail.originalEvent.target.blur();
                this.dispatchEvent(new CustomEvent("confirm"));
            });
        } else {
            this.confirmBtn.addEventListener("click", () => {
                this.confirmBtn.blur();
                this.dispatchEvent(new CustomEvent("confirm"));
            });
        }

        modalFooter.append(cancelBtn, this.confirmBtn);
        modalContent.append(modalHeader, modalBody, modalFooter);
        modalDialog.appendChild(modalContent);
        this.modalElement.appendChild(modalDialog);
        this.wrapperElement.appendChild(this.modalElement);

        this.modalElement.addEventListener("hidden.bs.modal", () => {
            this.dispatchEvent(new CustomEvent("hidden"));
            this.destroy();
        }, { once: true });

        this.bsModal = new bootstrap.Modal(this.modalElement, {
            backdrop: config.isStatic ? "static" : true,
            keyboard: !config.isStatic
        });
        this.bsModal.show();
    }

    hide() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }

    disableConfirm() {
        if (this.confirmBtn) {
            this.confirmBtn.disabled = true;
        }
    }

    enableConfirm() {
        if (this.confirmBtn) {
            this.confirmBtn.disabled = false;
        }

        if (this.holdBtnInstance) {
            this.holdBtnInstance.reset();
        }
    }

    destroy() {
        if (this.holdBtnInstance) {
            this.holdBtnInstance.reset();
            this.holdBtnInstance = null;
        }

        if (this.bsModal) {
            this.bsModal.dispose();
            this.bsModal = null;
        }

        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
        }

        this.confirmBtn = null;
        this.titleId = null;
    }
}