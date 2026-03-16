import { EVENTS } from "../../events/EventBus.js";

export class ToolbarManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.elements = {};

        this.state = {
            isMobile: window.innerWidth <= 992,
            isMarkerPlacing: false,
            isMarkerEditorCollapseOpen: false,
            isSettingsCollapseOpen: false
        };

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

        window.addEventListener("resize", () => {
            this.state.isMobile = window.innerWidth <= 992;
            this.#updateVisibility();
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.MARKER_PLACING_STARTED, () => {
            this.state.isMarkerPlacing = true;
            this.#updateVisibility();
        });

        this.bus.on(EVENTS.MARKER_PLACING_CANCELLED, () => {
            this.state.isMarkerPlacing = false;
            this.#updateVisibility();
        });

        this.bus.on(EVENTS.UI_MARKER_EDITOR_OPENED, () => {
            this.state.isMarkerEditorCollapseOpen = true;
            this.#updateVisibility();
        });

        this.bus.on(EVENTS.UI_MARKER_EDITOR_CLOSED, () => {
            this.state.isMarkerEditorCollapseOpen = false;
            this.#updateVisibility();
        });

        this.bus.on(EVENTS.UI_SETTINGS_OPENED, () => {
            this.state.isSettingsCollapseOpen = true;
            this.#updateVisibility();
        });

        this.bus.on(EVENTS.UI_SETTINGS_CLOSED, () => {
            this.state.isSettingsCollapseOpen = false;
            this.#updateVisibility();
        });

        this.bus.on(EVENTS.MAP_DELETED, () => {
            this.state.isMarkerEditorCollapseOpen = false;
            this.state.isSettingsCollapseOpen = false;
            this.#updateVisibility();
        });

        this.bus.on(EVENTS.MAPS_LOADED, ({ maps }) => {
            let hasMaps = Object.keys(maps).length > 0;
            if (hasMaps) {
                this.elements.saveMapButton.disabled = true;
            }
        });

        this.bus.on(EVENTS.MAP_SAVE_STARTED, () => {
            this.elements.saveMapButton.disabled = true;
        });

        this.bus.on(EVENTS.MAP_SAVE_AVAILABILITY_CHANGED, ({ canSave }) => {
            this.elements.saveMapButton.disabled = !canSave;
        });
    }

    #updateVisibility() {
        let shouldHideInMobileView = this.state.isMobile
            && (this.state.isMarkerPlacing || this.state.isMarkerEditorCollapseOpen || this.state.isSettingsCollapseOpen);
        let shouldHideInDesktopView = !this.state.isMobile
            && (this.state.isMarkerPlacing || this.state.isMarkerEditorCollapseOpen);

        if (shouldHideInMobileView || shouldHideInDesktopView) {
            this.elements.floatingButtonDiv.classList.add("d-none");
        } else {
            this.elements.floatingButtonDiv.classList.remove("d-none");
        }
    }
}