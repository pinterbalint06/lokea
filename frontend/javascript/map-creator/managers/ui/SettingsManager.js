import { EVENTS } from "../../events/EventBus.js";

export class SettingsManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.elements = {};
        this.#gatherElements();
        this.#bindUIEvents();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements = {
            fovToggle: document.getElementById("fovToggle"),
            fovWidthRange: document.getElementById("fovWidthRange"),
            fovWidthNumber: document.getElementById("fovWidthNumber"),
            fovHeightRange: document.getElementById("fovHeightRange"),
            fovHeightNumber: document.getElementById("fovHeightNumber"),
            offMapConnectionsToggle: document.getElementById("offMapConnectionsToggle"),
            allConnectionsWhenNotActiveToggle: document.getElementById("allConnectionsWhenNotActiveToggle"),
            beallitasokCollapseElement: document.getElementById("beallitasokCollapse"),
            closeBeallitasok: document.getElementById("closeBeallitasok")
        };

        this.elements.beallitasokCollapseBootstrapElement = new bootstrap.Collapse(
            this.elements.beallitasokCollapseElement,
            {
                toggle: false
            }
        );

        this.#updateCollapseDirection();
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

        this.elements.beallitasokCollapseElement.addEventListener("show.bs.collapse", (event) => {
            if (event.target == this.elements.beallitasokCollapseElement) {
                this.bus.emit(EVENTS.UI_SETTINGS_OPENED);
                if (window.innerWidth <= 992) {
                    this.bus.emit(EVENTS.UI_MARKER_EDITOR_CLOSE_REQUESTED);
                }
            }
        });

        this.elements.beallitasokCollapseElement.addEventListener("hidden.bs.collapse", (event) => {
            if (event.target == this.elements.beallitasokCollapseElement) {
                this.bus.emit(EVENTS.UI_SETTINGS_CLOSED);
            }
        });

        this.elements.closeBeallitasok.addEventListener("click", () => {
            this.elements.beallitasokCollapseBootstrapElement.hide();
        });

        this.#syncFovInputs(this.elements.fovWidthRange, this.elements.fovWidthNumber, "width");
        this.#syncFovInputs(this.elements.fovWidthNumber, this.elements.fovWidthRange, "width");

        this.#syncFovInputs(this.elements.fovHeightRange, this.elements.fovHeightNumber, "height");
        this.#syncFovInputs(this.elements.fovHeightNumber, this.elements.fovHeightRange, "height");

        window.addEventListener("resize", () => {
            this.#updateCollapseDirection();
        });
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.UI_SETTINGS_OPEN_REQUESTED, () => {
            this.elements.beallitasokCollapseBootstrapElement.show();
        });

        this.bus.on(EVENTS.UI_SETTINGS_CLOSE_REQUESTED, () => {
            this.elements.beallitasokCollapseBootstrapElement.hide();
        });

        this.bus.on(EVENTS.MAP_DELETED, () => {
            this.elements.beallitasokCollapseBootstrapElement.hide();
        });
    }

    #syncFovInputs(source, target, propertyName) {
        source.addEventListener("input", (event) => {
            target.value = source.value;
            this.bus.emit(EVENTS.UI_SETTINGS_FOV_SIZE_CHANGED, { [propertyName]: parseInt(event.target.value) });
        });
    }

    #updateCollapseDirection() {
        if (window.innerWidth <= 992) {
            this.elements.beallitasokCollapseElement.classList.remove("collapse-horizontal");
        } else {
            this.elements.beallitasokCollapseElement.classList.add("collapse-horizontal");
        }
    }
}
