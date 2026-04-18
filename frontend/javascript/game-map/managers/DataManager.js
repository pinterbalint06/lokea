import { EVENTS } from "../shared/EventBus.js";
import { fetchGameMapDetails } from "../shared/api.js";

export class DataManager {
    constructor(eventBus, appStore) {
        this.eventBus = eventBus;
        this.appStore = appStore;

        this.eventBus.on(EVENTS.APP_INIT, ({ gameMapId }) => {
            this.#init(gameMapId);
        });
    }

    async #init(gameMapId) {
        try {
            const gameMapDetails = await fetchGameMapDetails(gameMapId);
            this.appStore.setState({
                gameMapDetails: {
                    title: gameMapDetails.title,
                    creatorName: gameMapDetails.creator_name,
                    description: gameMapDetails.game_description,
                    createdAt: gameMapDetails.game_created,
                    playCount: gameMapDetails.plays,
                    rating: gameMapDetails.rating,
                    isOwner: gameMapDetails.is_owner,
                    topScores: gameMapDetails.top_scores
                }
            });
        } catch (error) {
            this.eventBus.emit(EVENTS.TOAST_SHOW, {
                msg: error.message || "Nem sikerült betölteni a pálya adatait.",
                type: "danger"
            });
        }
    }
}
