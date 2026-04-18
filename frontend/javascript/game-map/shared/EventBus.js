const APP_EVENTS = {
    APP_INIT: "APP_INIT",
    STATE_UPDATED: "STATE_UPDATED",
    TOAST_SHOW: "TOAST_SHOW",
    TOAST_HIDE_ID: "TOAST_HIDE_ID"
};

export const EVENTS = {
    ...APP_EVENTS
};

export { EventBus } from "../../libs/EventBus.js";
