import { EVENTS } from "./EventBus.js";
import { CONSTANTS } from "./constants.js";

export class AppStore {
    constructor(eventBus, gameMapId) {
        this.bus = eventBus;

        this.state = {
            gameMapId,
            activeMapId: null,
            currentMapPointCount: 0,

            isConnecting: false,
            isPlacingMarker: false,
            canSaveMap: false,

            activePoint: {
                id: null,
                mapId: null,
                northDirection: 0,
                isDirty: {
                    position: false,
                    northDirection: false,
                    connections: false
                },
                pendingEquirectangularFile: null
            },

            isOpen: {
                markerEditor: false,
                settings: false
            },

            isBusy: {
                map: false,
                point: false,
                connection: false,
                equirectangular: false
            },

            settings: {
                fovEnabled: true,
                fovWidth: 100,
                fovHeight: 100,
                showOffMapConnections: true,
                showAllConnections: true
            },

            isMobile: window.innerWidth <= CONSTANTS.MOBILE_BREAKPOINT,
        };
    }

    getState() {
        return this.state;
    }

    doesActivePointHaveUnsavedChanges() {
        const { activePoint } = this.state;
        return activePoint.pendingEquirectangularFile || activePoint.isDirty.position || activePoint.isDirty.northDirection || activePoint.isDirty.connections;
    }

    isAppLocked() {
        return this.state.isBusy.map || this.state.isBusy.point || this.state.isBusy.connection || false;
    }

    setState(newState) {
        this.state = {
            ...this.state,
            ...newState,
            isBusy: { ...this.state.isBusy, ...(newState.isBusy || {}) },
            settings: { ...this.state.settings, ...(newState.settings || {}) },
            isOpen: { ...this.state.isOpen, ...(newState.isOpen || {}) },
            activePoint: {
                ...this.state.activePoint,
                ...(newState.activePoint || {}),
                isDirty: { ...this.state.activePoint.isDirty, ...(newState.activePoint?.isDirty || {}) }
            }
        };

        this.bus.emit(EVENTS.STATE_UPDATED, { state: this.state });
    }
}
