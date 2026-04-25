import { EVENTS } from "../../shared/EventBus.js";

export class ToolbarManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;
        this.elements = {};

        this.#gatherElements();
        this.#bindUIEvents();
        this.#bindBusEvents();
        this.#updateVisibility();
    }

    #gatherElements() {
        this.elements = {
            saveMapButton: document.getElementById("saveMapButton"),
            settingsButton: document.getElementById("settingsBtn"),
            addNewMarkerButton: document.getElementById("plusBtn"),
            floatingButtonDiv: document.getElementById("floatingButtonDiv")
        };
    }

    #bindUIEvents() {
        this.elements.saveMapButton.addEventListener("click", () => {
            this.bus.emit(EVENTS.UI_SAVE_MAP_CLICKED);
        });

        this.elements.settingsButton.addEventListener("click", () => {
            this.bus.emit(EVENTS.UI_SETTINGS_OPEN_REQUESTED);
        });

        this.elements.addNewMarkerButton.addEventListener("click", () => {
            this.bus.emit(EVENTS.UI_MARKER_PLACEMENT_REQUESTED);
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MAP_DELETED, () => {
            this.#updateVisibility();
        });

        this.bus.on(EVENTS.MAPS_LOADED, ({ maps }) => {
            let hasMaps = Object.keys(maps).length > 0;
            if (hasMaps) {
                this.elements.saveMapButton.disabled = true;
            }
        });

        this.bus.on(EVENTS.STATE_UPDATED, () => {
            this.#updateVisibility();
        });
    }

    #updateVisibility() {
        const state = this.store.getState();

        const isMobile = state.isMobile;

        const shouldHideInMobileView = isMobile
            && (state.isPlacingMarker || state.isOpen.markerEditor || state.isOpen.settings);
        const shouldHideInDesktopView = !isMobile
            && (state.isPlacingMarker || state.isOpen.markerEditor);

        if (shouldHideInMobileView || shouldHideInDesktopView) {
            this.elements.floatingButtonDiv.classList.add("d-none");
        } else {
            this.elements.floatingButtonDiv.classList.remove("d-none");
        }


        const hasMaps = state.activeMapId != null;
        this.elements.saveMapButton.disabled = !state.canSaveMap || state.isBusy.map || !hasMaps;

        this.elements.addNewMarkerButton.disabled = state.isBusy.point;
        this.elements.settingsButton.disabled = state.isBusy.point;
    }
}
