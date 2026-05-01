import { formatDateTime } from "../shared/utils.js";
import { EVENTS } from "../shared/EventBus.js";
import { createFavoriteButton } from "../../libs/elements/favoriteButton.js";

export class DetailsManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.elements = {};
        this.#gatherElements();
        this.#bindBusEvents();
    }

    #gatherElements() {
        this.elements.titleDisplay = document.getElementById("titleDisplay");
        this.elements.creatorValue = document.getElementById("creatorValue");
        this.elements.descriptionDisplay = document.getElementById("descriptionDisplay");
        this.elements.createdAtValue = document.getElementById("createdAtValue");
        this.elements.playsValue = document.getElementById("playsValue");
        this.elements.displayRatingValue = document.getElementById("displayRatingValue");
        this.elements.displayRatingStars = document.getElementById("displayRatingStars");
        this.elements.coverImageWrapper = document.getElementById("coverImageWrapper");
    }

    #updateUI(state) {
        const gameMapDetails = state.gameMapDetails;
        this.elements.titleDisplay.innerText = gameMapDetails.title;
        this.elements.creatorValue.innerText = gameMapDetails.creatorName;
        this.elements.descriptionDisplay.innerText = gameMapDetails.description;
        this.elements.createdAtValue.innerText = formatDateTime(gameMapDetails.createdAt);
        this.elements.playsValue.innerText = gameMapDetails.playCount;
        this.elements.displayRatingValue.innerText = gameMapDetails.rating;
        this.elements.displayRatingStars.style.setProperty("--rating", gameMapDetails.rating);

        let existingBtn = this.elements.coverImageWrapper.querySelector('.card-favorite-btn');
        if (existingBtn) {
            existingBtn.remove();
        }
        if (gameMapDetails.isFavorite != undefined && state.gameMapId) {
            const favoriteBtn = createFavoriteButton(state.gameMapId, gameMapDetails.isFavorite);
            this.elements.coverImageWrapper.appendChild(favoriteBtn);
        }
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.STATE_UPDATED, ({ state }) => {
            this.#updateUI(state);
        });
    }
}
