import { Modal } from "../../../libs/elements/Modal.js";
import { createElement } from "../../../libs/utils/DOMUtils.js";
import { ICONS } from "../../../libs/icons/icons.js";
import { createSVGIcon } from "../../../libs/utils/svgUtils.js";
import { EVENTS } from "../../shared/EventBus.js";

export class ModalManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;
        this.wrapperElement = document.getElementById("modal-wrapper");
        this.modal = new Modal(this.wrapperElement);
        this.currentContext = null;

        this.#bindBusEvents();
        this.#bindModalEvents();
    }

    #bindModalEvents() {
        this.modal.addEventListener("confirm", () => {
            let context = this.currentContext;
            if (context) {
                switch (context.type) {
                    case "discard": {
                        this.bus.emit(EVENTS.UI_MODAL_CONFIRMED, { modalType: "discard" });
                        this.modal.hide();
                        break;
                    }
                    case "delete_map": {
                        let mapId = context.id;

                        const lockReason = this.store.getState().isBusy.map;
                        if (!lockReason) {
                            this.modal.disableConfirm();
                            this.bus.emit(EVENTS.UI_MODAL_CONFIRMED, { modalType: "delete_map", mapId });
                        } else {
                            this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
                            this.modal.enableConfirm();
                        }
                        break;
                    }
                    case "delete_point": {
                        const lockReason = this.store.getState().isBusy.point;
                        if (!lockReason) {
                            this.modal.disableConfirm();
                            this.bus.emit(EVENTS.UI_MODAL_CONFIRMED, { modalType: "delete_point" });
                        } else {
                            this.bus.emit(EVENTS.TOAST_SHOW, { msg: lockReason, type: "danger" });
                            this.modal.enableConfirm();
                        }
                        break;
                    }
                }
            }
        });

        this.modal.addEventListener("hidden", () => {
            this.currentContext = null;
            this.bus.emit(EVENTS.UI_MODAL_HIDDEN);
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.UI_MODAL_REQUESTED, ({ modalType, mapId, mapName }) => {
            switch (modalType) {
                case "discard": {
                    this.#showDiscardChangesModal();
                    break;
                }
                case "delete_map": {
                    this.#showDeleteMapModal(mapId, mapName);
                    break;
                }
                case "delete_point": {
                    this.#showDeletePointModal();
                    break;
                }
            }
        });

        this.bus.on(EVENTS.MARKER_DELETED, () => this.modal.hide());
        this.bus.on(EVENTS.MARKER_DELETE_FAILED, () => this.modal.enableConfirm());

        this.bus.on(EVENTS.MAP_DELETED, () => this.modal.hide());
        this.bus.on(EVENTS.MAP_DELETE_FAILED, () => this.modal.enableConfirm());
    }

    #showDiscardChangesModal() {
        this.currentContext = { type: "discard" };

        let p = createElement("p");
        p.innerText = "Biztos vagy benne, hogy elveted a változtatásokat?";

        this.modal.show({
            title: "Változtatások elvetése",
            body: [p],
            confirmText: "Elvetem a változtatásokat",
            cancelText: "Mégse",
            confirmBtnClass: "btn-danger",
            dangerStyle: false,
            isStatic: false
        });
    }

    #showDeleteMapModal(mapId, mapName) {
        this.currentContext = { type: "delete_map", id: mapId };

        let desc = createElement("p");
        desc.innerText = `Biztosan törölni szeretnéd ezt a térképet ${mapName ? `: ${mapName}` : ""}?`;

        let warningIcon = createSVGIcon(ICONS.WARNING, {
            height: "1.2em",
            fill: "currentColor"
        });

        let warning = createElement("p", { class: "text-muted small mb-0" });
        warning.appendChild(document.createTextNode("Ez a művelet nem vonható vissza. A térképhez tartozó "));
        let strong = createElement("strong");
        strong.innerText = "összes pont, kapcsolat és kép is törlésre kerül";
        warning.appendChild(strong);
        warning.appendChild(document.createTextNode("."));

        this.modal.show({
            title: "Térkép törlése",
            icon: warningIcon,
            body: [desc, warning],
            confirmText: "Térkép végleges törlése",
            confirmBtnClass: "btn-danger",
            dangerStyle: true,
            holdToUnlock: 2000,
            isStatic: true,
            onEarlyClick: () => {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Tartsd lenyomva a gombot a megerősítéshez" });
            }
        });
    }

    #showDeletePointModal() {
        this.currentContext = { type: "delete_point" };

        let desc = createElement("p");
        desc.innerText = "Biztosan törölni szeretnéd ezt a pontot?";

        let warningIcon = createSVGIcon(ICONS.WARNING, {
            height: "1.2em",
            fill: "currentColor"
        });

        let warning = createElement("p", { class: "text-muted small mb-0" });
        warning.appendChild(document.createTextNode("Ez a művelet nem vonható vissza. A ponthoz tartozó "));
        let strong = createElement("strong");
        strong.innerText = "összes kapcsolat és a 360°-os kép is törlésre kerül";
        warning.appendChild(strong);
        warning.appendChild(document.createTextNode("."));

        this.modal.show({
            title: "Pont törlése",
            icon: warningIcon,
            body: [desc, warning],
            confirmText: "Pont végleges törlése",
            confirmBtnClass: "btn-danger",
            dangerStyle: true,
            holdToUnlock: 2000,
            isStatic: true,
            onEarlyClick: () => {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Tartsd lenyomva a gombot a megerősítéshez" });
            }
        });
    }
}
