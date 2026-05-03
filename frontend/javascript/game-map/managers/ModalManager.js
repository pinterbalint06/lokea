import { EVENTS } from "../shared/EventBus.js";
import { Modal } from "../../libs/elements/Modal.js";
import { createElement } from "../../libs/utils/DOMUtils.js";
import { createSVGIcon } from "../../libs/utils/svgUtils.js";
import { ICONS } from "../../libs/icons/icons.js";
import { DragAndDropUploader } from "../../libs/elements/DragAndDropUploader.js";
import { HoldToUnlockButton } from "../../libs/elements/HoldToUnlockButton.js";
import i18next from "../../libs/language/i18next.js";

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
        this.bus.on(EVENTS.UI_MODAL_REQUESTED, ({ modalType, gameMapId, gameMapName }) => {
            if (modalType == "cover_image") {
                this.#showCoverImageModal();
            } else {
                if (modalType == "delete_game_map") {
                    this.#showDeleteGameMapModal(gameMapId, gameMapName);
                }
            }
        });
    }

    #showCoverImageModal() {
        const modalBody = createElement("div", { class: "d-flex flex-column" });

        this.coverUploaderWrapper = createElement("div", { class: "dropzone p-4 rounded-3 border-2" });
        this.coverUploader = new DragAndDropUploader(this.coverUploaderWrapper, {
            titleText: i18next.t("game-maps:modalManager.dragCoverImage", { defaultValue: "Húzd ide az új borítóképet" }),
            buttonText: i18next.t("game-maps:modalManager.clickToUpload", { defaultValue: "Kattints ide feltöltéshez" }),
            separatorText: i18next.t("game-maps:dragAndDropUploader.or", { defaultValue: "Vagy" }),
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
        dividerText.innerText = i18next.t("game-maps:modalManager.or", { defaultValue: "Vagy" });
        const hrRight = createElement("hr", { class: "flex-grow-1 m-0" });

        divider.appendChild(hrLeft);
        divider.appendChild(dividerText);
        divider.appendChild(hrRight);

        modalBody.appendChild(divider);

        const dangerZone = createElement("div", {
            class: "danger-zone p-3 rounded-3 text-center"
        });

        const dangerWarning = createElement("p", { class: "danger-zone-text small mb-3" });
        dangerWarning.innerText = i18next.t("game-maps:modalManager.deleteWarning", { defaultValue: "Ha eltávolítod a borítóképet, a pálya ismét az alapértelmezett borítóképet fogja használni." });
        dangerZone.appendChild(dangerWarning);

        const deleteButton = createElement("button", {
            class: "btn btn-outline-danger w-100 position-relative fw-semibold",
            type: "button"
        });

        deleteButton.innerText = i18next.t("game-maps:modalManager.deleteCoverImage", { defaultValue: "Borítókép törlése" });

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
                msg: i18next.t("game-maps:modalManager.holdToDelete", { defaultValue: "A törléshez tartsd lenyomva a gombot legalább 1,5 másodpercig!" }),
                type: "warning"
            });
        });

        dangerZone.appendChild(deleteButton);
        modalBody.appendChild(dangerZone);

        this.modal.show({
            title: i18next.t("game-maps:modalManager.editCoverImage", { defaultValue: "Borítókép szerkesztése" }),
            icon: createSVGIcon(ICONS.EDIT, {
                height: "1.2em",
                fill: "currentColor"
            }),
            body: [modalBody],
            cancelText: i18next.t("game-maps:modalManager.cancel", { defaultValue: "Mégse" }),
            hideConfirmButton: true,
            isStatic: false
        });
    }

    #showDeleteGameMapModal(gameMapId, gameMapName) {
        let desc = createElement("p");
        desc.innerText = gameMapName ? i18next.t("game-maps:modalManager.confirmDeleteMapNamed", { name: gameMapName, defaultValue: `Biztosan törölni szeretnéd ezt a pályát: ${gameMapName}?` }) : i18next.t("game-maps:modalManager.confirmDeleteMap", { defaultValue: "Biztosan törölni szeretnéd ezt a pályát?" });

        let warningIcon = createSVGIcon(ICONS.WARNING, {
            height: "1.2em",
            fill: "currentColor"
        });

        let warning = createElement("p", { class: "text-muted small mb-0" });
        warning.appendChild(document.createTextNode(i18next.t("game-maps:modalManager.cannotBeUndone", { defaultValue: "Ez a művelet nem vonható vissza. A pályához tartozó " })));
        let strong = createElement("strong");
        strong.innerText = i18next.t("game-maps:modalManager.allDataWillBeDeleted", { defaultValue: "összes térkép, pont, kapcsolat és kép is törlésre kerül" });
        warning.appendChild(strong);
        warning.appendChild(document.createTextNode("."));

        this.modal.show({
            title: i18next.t("game-maps:modalManager.deleteMapTitle", { defaultValue: "Pálya törlése" }),
            icon: warningIcon,
            body: [desc, warning],
            confirmText: i18next.t("game-maps:modalManager.permanentlyDeleteMap", { defaultValue: "Pálya végleges törlése" }),
            confirmBtnClass: "btn-danger",
            dangerStyle: true,
            holdToUnlock: 3000,
            isStatic: true,
            onEarlyClick: () => {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game-maps:modalManager.holdToConfirm", { defaultValue: "Tartsd lenyomva a gombot a megerősítéshez" }), type: "warning" });
            }
        });

        this.modal.addEventListener("confirm", () => {
            this.bus.emit(EVENTS.UI_MODAL_CONFIRMED, { modalType: "delete_game_map" });
            this.modal.hide();
        }, { once: true });
    }
}