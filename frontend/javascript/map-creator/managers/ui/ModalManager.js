import { Modal } from "../../../libs/elements/Modal.js";
import { createElement } from "../../../libs/utils/DOMUtils.js";
import { ICONS } from "../../../libs/icons/icons.js";
import { createSVGIcon } from "../../../libs/utils/svgUtils.js";
import { EVENTS } from "../../shared/EventBus.js";
import i18next from "../../../libs/language/i18next.js";

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
        p.innerText = i18next.t("game:markerEditor.discardConfirm");

        this.modal.show({
            title: i18next.t("game:markerEditor.discardTitle"),
            body: [p],
            confirmText: i18next.t("game:markerEditor.discardBtn"),
            cancelText: i18next.t("game:gamePage.cancel"),
            confirmBtnClass: "btn-danger",
            dangerStyle: false,
            isStatic: false
        });
    }

    #showDeleteMapModal(mapId, mapName) {
        this.currentContext = { type: "delete_map", id: mapId };

        let desc = createElement("p");
        desc.innerText = mapName
            ? i18next.t("game-maps:modalManager.confirmDeleteMapNamed", { name: mapName })
            : i18next.t("game-maps:modalManager.confirmDeleteMap");

        let warningIcon = createSVGIcon(ICONS.WARNING, {
            height: "1.2em",
            fill: "currentColor"
        });

        let warning = createElement("p", { class: "text-muted small mb-0" });
        warning.innerText = i18next.t("game-maps:modalManager.cannotBeUndoneMap");

        this.modal.show({
            title: i18next.t("game-maps:modalManager.deleteMapTitle"),
            icon: warningIcon,
            body: [desc, warning],
            confirmText: i18next.t("game-maps:modalManager.permanentlyDeleteMap"),
            confirmBtnClass: "btn-danger",
            dangerStyle: true,
            holdToUnlock: 2000,
            isStatic: true,
            onEarlyClick: () => {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game-maps:modalManager.holdToConfirm"), type: "warning" });
            }
        });
    }

    #showDeletePointModal() {
        this.currentContext = { type: "delete_point" };

        let desc = createElement("p");
        desc.innerText = i18next.t("game-maps:modalManager.confirmDeletePoint");

        let warningIcon = createSVGIcon(ICONS.WARNING, {
            height: "1.2em",
            fill: "currentColor"
        });

        let warning = createElement("p", { class: "text-muted small mb-0" });
        warning.innerText = i18next.t("game-maps:modalManager.cannotBeUndonePoint");

        this.modal.show({
            title: i18next.t("game-maps:modalManager.deletePointTitle"),
            icon: warningIcon,
            body: [desc, warning],
            confirmText: i18next.t("game-maps:modalManager.permanentlyDeletePoint"),
            confirmBtnClass: "btn-danger",
            dangerStyle: true,
            holdToUnlock: 2000,
            isStatic: true,
            onEarlyClick: () => {
                this.bus.emit(EVENTS.TOAST_SHOW, { msg: i18next.t("game-maps:modalManager.holdToConfirm"), type: "warning" });
            }
        });
    }
}
