import { Modal } from "../../libs/elements/Modal.js";
import { createElement } from "../../libs/utils/DOMUtils.js";
import { ICONS } from "../../libs/icons/icons.js";
import { createSVGIcon } from "../../libs/utils/svgUtils.js";
import { EVENTS } from "../events/EventBus.js";

export class ModalManager {
    constructor(eventBus) {
        this.bus = eventBus;
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
                        this.bus.emit(EVENTS.UI_DISCARD_CHANGES_CONFIRMED);
                        this.modal.hide();
                        break;
                    }
                    case "delete_map": {
                        let request = { canProceed: true, reason: "" };
                        let mapId = context.id;

                        this.bus.emit(EVENTS.UI_DELETE_MAP_REQUESTED, { request: request, mapId: mapId });

                        if (request.canProceed) {
                            this.modal.disableConfirm();
                            this.bus.emit(EVENTS.UI_DELETE_MAP_CONFIRMED, { mapId: mapId });
                        } else {
                            this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
                            this.modal.enableConfirm();
                        }
                        break;
                    }
                    case "delete_point": {
                        let request = { canProceed: true, reason: "" };
                        this.bus.emit(EVENTS.UI_DELETE_POINT_REQUESTED, { request: request });

                        if (request.canProceed) {
                            this.modal.disableConfirm();
                            this.bus.emit(EVENTS.UI_DELETE_POINT_CONFIRMED);
                        } else {
                            this.bus.emit(EVENTS.TOAST_SHOW, { msg: request.reason, type: "danger" });
                            this.modal.enableConfirm();
                        }
                        break;
                    }
                    default: {
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
        this.bus.on(EVENTS.UI_SHOW_DISCARD_MODAL, () => {
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
        });

        this.bus.on(EVENTS.UI_SHOW_MAP_DELETE_MODAL, ({ mapId, mapName }) => {
            this.currentContext = { type: "delete_map", id: mapId };

            let desc = createElement("p");
            desc.innerText = `Biztosan törölni szeretnéd ezt a térképet${mapName ? `: ${mapName}` : ""}?`;

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
                isStatic: true
            });
        });

        this.bus.on(EVENTS.UI_SHOW_POINT_DELETE_MODAL, () => {
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
                isStatic: true
            });
        });

        this.bus.on(EVENTS.MARKER_DELETED, () => this.modal.hide());
        this.bus.on(EVENTS.MARKER_DELETE_FAILED, () => this.modal.enableConfirm());
        this.bus.on(EVENTS.MAP_DELETED, () => this.modal.hide());
        this.bus.on(EVENTS.MAP_DELETE_FAILED, () => this.modal.enableConfirm());
    }
}