import { formatDateTime } from "../shared/utils.js";
import { EVENTS } from "../shared/EventBus.js";
import { createElement } from "../../libs/utils/DOMUtils.js";
import i18next from "../../libs/language/i18next.js";

export class LeaderboardManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;
        this.elements = {};
        this.#gatherElements();

        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements.leaderboardList = document.getElementById("leaderboardList");
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.STATE_UPDATED, ({ state }) => {
            this.#render(state.gameMapDetails.topScores);
        });
    }

    #render(topScores) {
        this.elements.leaderboardList.innerHTML = "";

        if (topScores.length > 0) {
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < topScores.length; i++) {
                fragment.appendChild(this.#createLeaderboardItem(i + 1, topScores[i]));
            }
            this.elements.leaderboardList.appendChild(fragment);
        } else {
            this.elements.leaderboardList.appendChild(this.#createEmptyLeaderboard());
        }
    }

    #createLeaderboardItem(topRank, score) {
        const rank = createElement("span", { class: "score-rank" });
        rank.innerText = String(topRank);

        const name = createElement("p", { class: "score-name" });
        name.innerText = score.username;

        const time = createElement("small", { class: "score-time" });
        time.innerText = `${i18next.t("leaderboardManager.achievedAt")} ${formatDateTime(score.score_time)}`;

        const main = createElement("div", { class: "score-main" }, [name, time]);

        const value = createElement("span", { class: "score-value" });
        value.innerText = score.score || 0;

        return createElement("article", { class: "score-item" }, [rank, main, value]);
    }

    #createEmptyLeaderboard() {
        const message = createElement("p", { class: "score-name mb-0" });
        message.textContent = i18next.t("leaderboardManager.noScoresYet");

        return createElement("article", { class: "score-item" }, [message]);
    }
}
