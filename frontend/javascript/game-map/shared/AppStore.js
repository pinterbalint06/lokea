import { EVENTS } from "./EventBus.js";

export class AppStore {
    constructor(eventBus, gameMapId) {
        this.bus = eventBus;
        this.state = {
            gameMapId,
            gameMapDetails: {
                title: "",
                creatorName: "-",
                description: "",
                createdAt: null,
                playCount: 0,
                rating: 0,
                topScores: []
            }
        };
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = {
            ...this.state,
            ...newState,
            gameMapDetails: {
                ...this.state.gameMapDetails,
                ...(newState.gameMapDetails || {})
            }
        };

        this.bus.emit(EVENTS.STATE_UPDATED, { state: this.state });
    }
}
