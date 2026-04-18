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

        const isAlreadyListening = this.listeners[eventName].some((entry) => entry.original === listener);
        if (!isAlreadyListening) {
            const wrapped = (event) => listener(event.detail);
            this.listeners[eventName].push({ original: listener, wrapped });
            this.addEventListener(eventName, wrapped);
        }
    }

    off(eventName, listener) {
        if (this.listeners[eventName]) {
            const index = this.listeners[eventName].findIndex((entry) => entry.original === listener);
            if (index !== -1) {
                const wrapped = this.listeners[eventName][index].wrapped;
                this.removeEventListener(eventName, wrapped);
                this.listeners[eventName].splice(index, 1);
                if (this.listeners[eventName].length === 0) {
                    delete this.listeners[eventName];
                }
            }
        }
    }
}
