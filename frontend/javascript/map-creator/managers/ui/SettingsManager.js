import { EVENTS } from "../../events/EventBus.js";

export class SettingsManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.elements = {};
        this.#gatherElements();
        this.#bindUIEvents();
    }

    #gatherElements() {
        this.elements = {
            fovToggle: document.getElementById("fovToggle"),
            fovWidthRange: document.getElementById("fovWidthRange"),
            fovWidthNumber: document.getElementById("fovWidthNumber"),
            fovHeightRange: document.getElementById("fovHeightRange"),
            fovHeightNumber: document.getElementById("fovHeightNumber"),
            offMapConnectionsToggle: document.getElementById("offMapConnectionsToggle"),
            allConnectionsWhenNotActiveToggle: document.getElementById("allConnectionsWhenNotActiveToggle")
        };
    }

    #bindUIEvents() {
        this.elements.fovToggle.addEventListener("change", (event) => {
            this.bus.emit(EVENTS.UI_SETTINGS_FOV_TOGGLED, { enabled: event.target.checked });
        });

        this.elements.offMapConnectionsToggle.addEventListener("change", (event) => {
            this.bus.emit(EVENTS.UI_SETTINGS_CONNECTION_OFF_MAP_VISIBILITY_CHANGED, {
                enabled: event.target.checked
            });
        });

        this.elements.allConnectionsWhenNotActiveToggle.addEventListener("change", (event) => {
            this.elements.offMapConnectionsToggle.disabled = !event.target.checked;
            this.bus.emit(EVENTS.UI_SETTINGS_CONNECTION_ALL_VISIBILITY_CHANGED, {
                enabled: event.target.checked
            });
        });

        this.#syncFovInputs(this.elements.fovWidthRange, this.elements.fovWidthNumber, "width");
        this.#syncFovInputs(this.elements.fovWidthNumber, this.elements.fovWidthRange, "width");

        this.#syncFovInputs(this.elements.fovHeightRange, this.elements.fovHeightNumber, "height");
        this.#syncFovInputs(this.elements.fovHeightNumber, this.elements.fovHeightRange, "height");
    }

    #syncFovInputs(source, target, propertyName) {
        source.addEventListener("input", (event) => {
            target.value = source.value;
            this.bus.emit(EVENTS.UI_SETTINGS_FOV_SIZE_CHANGED, { [propertyName]: parseInt(event.target.value) });
        });
    }
}
