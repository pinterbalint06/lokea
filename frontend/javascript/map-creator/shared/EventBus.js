const APP_EVENTS = {
    APP_INIT: "APP_INIT",
    HIDE_LOADING: "HIDE_LOADING",
    STATE_UPDATED: "STATE_UPDATED",
    TOAST_SHOW: "TOAST_SHOW",
    TOAST_HIDE_ID: "TOAST_HIDE_ID"
};

const MAP_EVENTS = {
    MAPS_LOADED: "MAPS_LOADED",
    MAP_LOADED: "MAP_LOADED",
    NEW_MAP_LOADED: "NEW_MAP_LOADED",
    MAP_SWITCHED: "MAP_SWITCHED",
    MAP_CLICKED: "MAP_CLICKED",
    MAP_SAVE_SUCCEEDED: "MAP_SAVE_SUCCEEDED",
    MAP_RENAME_SUCCEEDED: "MAP_RENAME_SUCCEEDED",
    MAP_RENAME_FAILED: "MAP_RENAME_FAILED",
    MAP_DELETED: "MAP_DELETED",
    MAP_DELETE_FAILED: "MAP_DELETE_FAILED"
};

const MARKER_EVENTS = {
    POINTS_LOADED: "POINTS_LOADED",
    MARKER_CLICKED: "MARKER_CLICKED",
    MARKER_SELECTED: "MARKER_SELECTED",
    NEW_MARKER_PLACED: "NEW_MARKER_PLACED",
    MARKER_MOVED: "MARKER_MOVED",
    POINT_SAVED: "POINT_SAVED",
    MARKER_DELETED: "MARKER_DELETED",
    MARKER_DELETE_FAILED: "MARKER_DELETE_FAILED"
};

const CONNECTION_EVENTS = {
    CONNECTIONS_LOADED: "CONNECTIONS_LOADED",
    NEW_CONNECTION_ADDED: "NEW_CONNECTION_ADDED",
    CONNECTION_LIST_UI_UPDATE: "CONNECTION_LIST_UI_UPDATE"
};

const EQUIRECTANGULAR_EVENTS = {
    EQUIRECTANGULAR_IMAGE_LOADED: "EQUIRECTANGULAR_IMAGE_LOADED"
};

const UI_MAP_FILE_EVENTS = {
    UI_SWITCH_MAP_REQUEST: "UI_SWITCH_MAP_REQUEST",
    UI_MAP_FILE_DROPPED: "UI_MAP_FILE_DROPPED",
    UI_SAVE_MAP_CLICKED: "UI_SAVE_MAP_CLICKED",
    UI_MAP_RENAME_REQUEST: "UI_MAP_RENAME_REQUEST",
    UI_EQUIRECTANGULAR_FILE_DROPPED: "UI_EQUIRECTANGULAR_FILE_DROPPED",
    UI_EQUIRECTANGULAR_FULLSCREEN_REQUEST: "UI_EQUIRECTANGULAR_FULLSCREEN_REQUEST"
};

const UI_MARKER_EDITOR_EVENTS = {
    UI_MARKER_EDITOR_OPENING: "UI_MARKER_EDITOR_OPENING",
    UI_MARKER_EDITOR_CLOSING: "UI_MARKER_EDITOR_CLOSING",
    UI_MARKER_EDITOR_CLOSED: "UI_MARKER_EDITOR_CLOSED",
    UI_MARKER_EDITOR_CLOSE_REQUESTED: "UI_MARKER_EDITOR_CLOSE_REQUESTED",
    UI_MARKER_PLACEMENT_REQUESTED: "UI_MARKER_PLACEMENT_REQUESTED",
    UI_COORDINATE_CHANGED: "UI_COORDINATE_CHANGED",
    UI_NORTH_DIRECTION_CHANGED: "UI_NORTH_DIRECTION_CHANGED",
    UI_POINT_SAVE_REQUESTED: "UI_POINT_SAVE_REQUESTED",
    UI_POINT_CENTER_VIEW: "UI_POINT_CENTER_VIEW"
};

const UI_CONNECTION_EVENTS = {
    UI_CONNECTION_CREATE_REQUEST: "UI_CONNECTION_CREATE_REQUEST",
    UI_CONNECTION_DIRECTION_UPDATE: "UI_CONNECTION_DIRECTION_UPDATE",
    UI_CONNECTION_DELETE_REQUEST: "UI_CONNECTION_DELETE_REQUEST",
    UI_CONNECTION_HIGHLIGHT: "UI_CONNECTION_HIGHLIGHT",
    UI_CONNECTION_CENTER_VIEW: "UI_CONNECTION_CENTER_VIEW"
};

const UI_SETTINGS_EVENTS = {
    UI_SETTINGS_OPEN_REQUESTED: "UI_SETTINGS_OPEN_REQUESTED",
    UI_SETTINGS_CLOSE_REQUESTED: "UI_SETTINGS_CLOSE_REQUESTED",
    UI_SETTINGS_FOV_TOGGLED: "UI_SETTINGS_FOV_TOGGLED",
    UI_SETTINGS_FOV_SIZE_CHANGED: "UI_SETTINGS_FOV_SIZE_CHANGED",
    UI_SETTINGS_CONNECTION_OFF_MAP_VISIBILITY_CHANGED: "UI_SETTINGS_CONNECTION_OFF_MAP_VISIBILITY_CHANGED",
    UI_SETTINGS_CONNECTION_ALL_VISIBILITY_CHANGED: "UI_SETTINGS_CONNECTION_ALL_VISIBILITY_CHANGED"
};

const UI_MODAL_EVENTS = {
    UI_MODAL_REQUESTED: "UI_MODAL_REQUESTED",
    UI_MODAL_CONFIRMED: "UI_MODAL_CONFIRMED",
    UI_MODAL_HIDDEN: "UI_MODAL_HIDDEN"
};

const UI_EVENTS = {
    ...UI_MAP_FILE_EVENTS,
    ...UI_MARKER_EDITOR_EVENTS,
    ...UI_CONNECTION_EVENTS,
    ...UI_SETTINGS_EVENTS,
    ...UI_MODAL_EVENTS
}

export const EVENTS = {
    ...APP_EVENTS,
    ...MAP_EVENTS,
    ...MARKER_EVENTS,
    ...CONNECTION_EVENTS,
    ...EQUIRECTANGULAR_EVENTS,
    ...UI_EVENTS
};

export class EventBus extends EventTarget {
    constructor() {
        super();
        this.listeners = {}; // { "event": [ { original: Function, wrapped: Function }, ... ] }
    }

    emit(eventName, detail = {}) {
        this.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    on(eventName, listener) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        const isAlreadyListening = this.listeners[eventName].some(listene => listene.original === listener);
        if (!isAlreadyListening) {
            const wrapped = (event) => listener(event.detail);
            this.listeners[eventName].push({ original: listener, wrapped });
            this.addEventListener(eventName, wrapped);
        }
    }

    off(eventName, listener) {
        if (this.listeners[eventName]) {
            const index = this.listeners[eventName].findIndex(listene => listene.original === listener);

            if (index != -1) {
                const { wrapped } = this.listeners[eventName][index];

                this.removeEventListener(eventName, wrapped);

                this.listeners[eventName].splice(index, 1);

                if (this.listeners[eventName].length == 0) {
                    delete this.listeners[eventName];
                }
            }
        }
    }
}
