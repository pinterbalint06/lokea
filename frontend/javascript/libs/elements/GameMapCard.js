import { createFavoriteButton } from "./favoriteButton.js";
import { loadGameMapCoverImageLowThenHigh } from "../network/progressiveImage.js";
import i18next from "../language/i18next.js";
import { createHTMLelement, showAlert } from "../utils/DOMutils.js";

let loadedURLs = [];

function cleanupURLs(url) {
    if (url != null && url != undefined) {
        const idx = loadedURLs.indexOf(url);
        if (idx !== -1) {
            loadedURLs.splice(idx, 1);
        }
        try {
            window.URL.revokeObjectURL(url);
        } catch (e) {
        }
    }
}

function createReview(rating) {
    let cardRating = createHTMLelement("div", ["stars"]);
    cardRating.style.setProperty("--rating", rating);
    return cardRating;
}

async function loadCoverImage(card, gmId) {
    let currentUrl = null;
    try {
        await loadGameMapCoverImageLowThenHigh({
            gameMapId: gmId,
            loadToViewer: async (imgData) => {
                imgData.cleanup = () => { };
                if (currentUrl !== null) {
                    cleanupURLs(currentUrl);
                }
                currentUrl = imgData.url;
                loadedURLs.push(currentUrl);
                card.style.backgroundImage = `url("${currentUrl}")`;
            },
            isCurrent: () => true
        });
    } catch (error) {
        showAlert(i18next.t("game-maps:choosing.errors.loadingCover", { defaultValue: "A borítókép betöltése nem sikerült." }), "danger");
    }
}

export function createGameMapCard(gameMap) {
    let card = createHTMLelement("div", ["card", "glass"]);
    let content = createHTMLelement("div", ["card-content"]);

    let title = createHTMLelement("h3", ["card-title"], gameMap.title);
    let plays = createHTMLelement("p", ["card-desc"], i18next.t("game-maps:choosing.playsCount", { count: gameMap.plays, defaultValue: `Játékok száma: ${gameMap.plays}` }));
    plays.dataset.i18n = "game-maps:choosing.playsCount";
    plays.dataset.count = gameMap.plays;

    let dateString = "";
    if (gameMap.game_created != undefined && gameMap.game_created != null) {
        dateString = gameMap.game_created.split("T")[0].replaceAll("-", ".");
    }
    let created = createHTMLelement("p", ["card-desc"], i18next.t("game-maps:choosing.createdAt", { date: dateString, defaultValue: `Létrehozva: ${dateString}` }));
    created.dataset.i18n = "game-maps:choosing.createdAt";
    created.dataset.date = dateString;


    content.appendChild(title);
    content.appendChild(createReview(gameMap.rating));
    content.appendChild(plays);
    content.appendChild(created);

    card.appendChild(content);

    card.appendChild(createFavoriteButton(gameMap.game_maps_id, gameMap.is_favorited));
    card.addEventListener("click", function () {
        window.location.href = `/game-maps/${gameMap.game_maps_id}`;
    });
    card.style.cursor = "pointer";

    loadCoverImage(card, gameMap.game_maps_id);

    return card;
}
