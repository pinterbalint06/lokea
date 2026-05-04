import { EVENTS } from "../shared/EventBus.js";
import { fetchGameMapDetails, fetchGameMapFavoriteStatus } from "../shared/api.js";
import i18next from "../../libs/language/i18next.js";

export class DataManager {
    constructor(eventBus, appStore) {
        this.eventBus = eventBus;
        this.appStore = appStore;

        this.eventBus.on(EVENTS.APP_INIT, ({ gameMapId }) => {
            this.#fetchDetails(gameMapId);
        });

        this.eventBus.on(EVENTS.COMMENT_UPDATED, () => {
            const state = this.appStore.getState();
            if (state.gameMapId) {
                this.#fetchDetails(state.gameMapId);
            }
        });
    }

    async #fetchDetails(gameMapId) {
        try {
            const [gameMapDetails, isFavorite] = await Promise.all([
                fetchGameMapDetails(gameMapId),
                fetchGameMapFavoriteStatus(gameMapId).catch(() => false)
            ]);

            this.appStore.setState({
                gameMapDetails: {
                    title: gameMapDetails.title,
                    creatorName: gameMapDetails.creator_name,
                    description: gameMapDetails.game_description,
                    createdAt: gameMapDetails.game_created,
                    playCount: gameMapDetails.plays,
                    rating: gameMapDetails.rating,
                    isOwner: gameMapDetails.is_owner,
                    topScores: gameMapDetails.top_scores,
                    isFavorite: isFavorite
                }
            });
        } catch (error) {
            this.eventBus.emit(EVENTS.TOAST_SHOW, {
                msg: error.message || i18next.t("game-maps:dataManager.loadError"),
                type: "danger"
            });
        }
    }
}
