import { formatSecondsToMinutes } from "./timer-conversion.js";
import { createFavoriteButton } from "../libs/elements/favoriteButton.js";
import { loadGameMapCoverImageLowThenHigh } from "../libs/network/progressiveImage.js";

window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload();
});

var loadedURLs = [];
var cardLoadedTimes = 0;

function clearLoadedURLs() {
    for (let url of loadedURLs) {
        window.URL.revokeObjectURL(url);
    }
    loadedURLs = [];
}

document.addEventListener("DOMContentLoaded", function () {
    let selectedButton = document.getElementById('sortByPlays');
    let closeBtn = document.querySelector('.modal-close-btn');
    const settingsForm = document.getElementById('settingsForm');
    initRoundTimeRange();
    closeBtn.addEventListener('click', () => {
        document.getElementById('myModal').classList.remove('active');
    });
    settingsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let gameMapId = document.getElementById('myModal').dataset.gameMapId;
        postGameId(gameMapId);
    });
    setupContinueGameModal();
    checkAndShowContinueModal();
    loadGameMaps('plays');
    document.querySelectorAll('.sortDiv button').forEach(button => {
        button.addEventListener('click', function () {
            cardLoadedTimes = 0;
            document.getElementById('game_maps_container').innerHTML = '';
            loadGameMaps(this.id.replace('sortBy', '').toLowerCase());
            clearLoadedURLs();
            selectedButton.classList.remove('btnPushed');
            selectedButton.removeAttribute('disabled');
            this.classList.add('btnPushed');
            this.disabled = true;
            selectedButton = this;
        });
    });
    document.getElementById('loadMoreBtn').addEventListener('click', function () {
        cardLoadedTimes++;
        loadGameMaps(selectedButton.id.replace('sortBy', '').toLowerCase());
    });
});

async function loadGameMaps(sort) {
    const gameMaps = await fetchURL('/api/choose-game?sort=' + sort + '&offset=' + (cardLoadedTimes * 20));
    let gameMapsContainer = document.getElementById('game_maps_container');
    if (gameMaps?.results && gameMaps.results.length > 0) {
        for (let i = 0; i < gameMaps.results.length; i++) {
            gameMapsContainer.appendChild(createCard(gameMaps.results[i]));
        }
    } else {
        let p = document.createElement('p');
        p.classList.add('text-center');
        p.innerText = 'Nincsenek elérhető játékok.';
        gameMapsContainer.appendChild(p);
    }
}

function createCard(game_map) {
    let game_maps_card = document.createElement('div');
    game_maps_card.classList.add('card', 'glass');
    let game_maps_card_content = document.createElement('div');
    game_maps_card_content.classList.add('card-content');
    let card_name = document.createElement('h3');
    card_name.classList.add('card-title');
    card_name.innerText = game_map.title;
    let card_plays = document.createElement('p');
    card_plays.classList.add('card-desc');
    card_plays.innerText = `Játékok száma: ${game_map.plays}`;
    let card_created = document.createElement('p');
    card_created.classList.add('card-desc');
    card_created.innerText = `Létrehozva: ${(game_map.game_created.split('T')[0]).replaceAll('-', '.')}`;
    game_maps_card_content.appendChild(card_name);
    game_maps_card_content.appendChild(createReview(game_map.rating));
    game_maps_card_content.appendChild(card_plays);
    game_maps_card_content.appendChild(card_created);
    game_maps_card.appendChild(game_maps_card_content);
    game_maps_card.appendChild(createFavoriteButton(game_map.game_maps_id, game_map.is_favorited));
    game_maps_card.addEventListener('click', function () {
        createModal(game_map);
    });
    console.log(game_map.game_maps_id);
    loadCoverImagelowThenHigh(game_maps_card, game_map.game_maps_id);

    return game_maps_card;
}

function createReview(rating) {
    let card_rating = document.createElement('div');
    card_rating.classList.add('stars');
    card_rating.style.setProperty('--rating', rating);
    return card_rating;
}

function createModal(game_map) {
    let modal = document.getElementById('myModal');
    let modalTitle = document.getElementById('modal-title');
    let modalStars = document.getElementById('modal-stars');
    let modalDesc = document.getElementById('modal-desc');
    let maxUniqueRounds = document.getElementById('maxUniqueRounds');
    const pointCount = Number(game_map.point_count);
    const safePointCount = Number.isFinite(pointCount) && pointCount > 0 ? pointCount : 0;
    modal.dataset.gameMapId = game_map.game_maps_id;
    modal.classList.add('active');
    modalTitle.innerText = game_map.title;
    modalStars.style.setProperty('--rating', game_map.rating);
    modalDesc.innerText = game_map.game_description;
    maxUniqueRounds.innerText = safePointCount === 0 ? 'N/A' : `${safePointCount} pont`;
}

function initRoundTimeRange() {
    let timeRange = document.getElementById("times");
    updateTimeValue();
    timeRange.addEventListener("input", updateTimeValue);
}
function updateTimeValue() {
    let timeValue = document.getElementById("timesValue");
    let timeRange = document.getElementById("times");
    let seconds = Number.parseInt(timeRange.value);
    timeValue.value = formatSecondsToMinutes(seconds);
    timeValue.textContent = formatSecondsToMinutes(seconds);
}


async function postGameId(gamemapId) {
    const formData = new FormData(document.getElementById('settingsForm'));
    formData.append('gameMapId', gamemapId);
    try {
        const response = await fetch('/api/choose-game/session', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error('Hiba a játék indításakor: ' + errorData.message);
        }
        window.location.href = '/game';
    } catch (error) {
        console.error('POST hiba:', error);
    }
}

async function fetchURL(url) {
    let re;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Hiba a játék pályák lekérésekor: ' + response.statusText);
        }
        re = await response.json();
    } catch (error) {
        console.error('GET hiba:', error);
    }
    return re;
}

async function loadCoverImagelowThenHigh(card, gmId) {
    try {
        await loadGameMapCoverImageLowThenHigh({
            gameMapId: gmId,
            loadToViewer: async (imgData) => {
                const url = imgData.url;
                imgData.cleanup = () => {};
                loadedURLs.push(url);
                card.style.backgroundImage = `url('${url}')`;
            },
            isCurrent: () => true
        });
    } catch (error) {
        console.error("Error loading map:", error);
    }
}

function setupContinueGameModal() {
    const dismissButton = document.getElementById('dismissContinueBtn');
    const continueButton = document.getElementById('continueGameBtn');

    dismissButton.addEventListener('click', () => {
        document.getElementById('continueGameModal').classList.remove('active');
        finishStartedGameSession();
    });

    continueButton.addEventListener('click', () => {
        window.location.href = '/game';
    });
}

async function checkAndShowContinueModal() {
    const activeGameSession = await fetchURL('/api/choose-game/session');
    if (activeGameSession?.hasActiveSession) {
        const continueModal = document.getElementById('continueGameModal');
        const continueModalDescription = document.getElementById('continue-modal-desc');
        if (activeGameSession.gameTitle) {
            continueModalDescription.innerText = `Van egy futó játékod ezen a pályán: ${activeGameSession.gameTitle}. Szeretnéd folytatni?`;
        }
        continueModal.classList.add('active');
    }
}

async function finishStartedGameSession() {
    try {
        const response = await fetch('/api/game/session', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Hiba a játék befejezésekor: ' + response.statusText);
        }
    } catch (error) {
        console.error('POST hiba:', error);
    }
}
