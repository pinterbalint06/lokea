import { formatSecondsToMinutes } from "./timer-conversion.js";
import { createFavoriteButton } from "../libs/elements/favoriteButton.js";
import { loadGameMapCoverImageLowThenHigh } from "../libs/network/progressiveImage.js";
import { showToast } from "../libs/utils.js";
import { translatePage, nyelvSzinkronizalas} from "../libs/i18next/translation.js";

window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload();
});

var loadedURLs = [];
var cardLoadedTimes = 0;
var activeTab = 'all';
var selectedButton = null;

function clearLoadedURLs() {
    for (let url of loadedURLs) {
        window.URL.revokeObjectURL(url);
    }
    loadedURLs = [];
}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await nyelvSzinkronizalas() || 'hu';
        translatePage();
    } catch (error) {
        console.error("Hiba a nyelvi adatok betöltésekor:", error);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') === 'mine' ? 'mine' : 'all';
    const sortButtonMap = { created: 'sortByCreated', rating: 'sortByRating', plays: 'sortByPlays', favorites: 'sortByFavorites' };
    const initialSort = sortButtonMap[urlParams.get('sort')] ? urlParams.get('sort') : 'plays';

    selectedButton = document.getElementById(sortButtonMap[initialSort]);
    if (initialSort !== 'plays') {
        document.getElementById('sortByPlays').classList.remove('btnPushed');
        selectedButton.classList.add('btnPushed');
        selectedButton.disabled = true;
    }

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
    switchTab(initialTab);

    document.getElementById('tabAll').addEventListener('click', () => switchTab('all'));
    document.getElementById('tabMine').addEventListener('click', () => switchTab('mine'));

    document.querySelectorAll('.sortDiv button').forEach(button => {
        button.addEventListener('click', function () {
            cardLoadedTimes = 0;
            const container = document.getElementById('game_maps_container');
            container.innerHTML = '';
            if (activeTab === 'mine') container.appendChild(createNewGameCard());
            loadGameMaps(this.id.replace('sortBy', '').toLowerCase(), activeTab === 'mine' ? 'mine' : null);
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
        loadGameMaps(selectedButton.id.replace('sortBy', '').toLowerCase(), activeTab === 'mine' ? 'mine' : null);
    });
});

function switchTab(tab) {
    activeTab = tab;
    cardLoadedTimes = 0;
    clearLoadedURLs();
    const container = document.getElementById('game_maps_container');
    container.innerHTML = '';
    document.getElementById('tabAll').classList.toggle('btnPushed', tab === 'all');
    document.getElementById('tabAll').disabled = tab === 'all';
    document.getElementById('tabMine').classList.toggle('btnPushed', tab === 'mine');
    document.getElementById('tabMine').disabled = tab === 'mine';
    if (tab === 'mine') container.appendChild(createNewGameCard());
    loadGameMaps(selectedButton.id.replace('sortBy', '').toLowerCase(), tab === 'mine' ? 'mine' : null);
}

async function loadGameMaps(sort, filter = null) {
    try {
        let url = '/api/choose-game?sort=' + sort + '&offset=' + (cardLoadedTimes * 20);
        if (filter) url += '&filter=' + filter;
        let gameMaps = await fetchURL(url);
        let gameMapsContainer = document.getElementById('game_maps_container');
        if (gameMaps.results && gameMaps.results.length > 0) {
            for (let i = 0; i < gameMaps.results.length; i++) {
                gameMapsContainer.appendChild(createCard(gameMaps.results[i]));
            }
        } else if (filter !== 'mine') {
            let p = document.createElement('p');
            p.classList.add('text-center');
            p.innerText = 'Nincsenek elérhető játékok.';
            gameMapsContainer.appendChild(p);
        }
    } catch {
        showToast(document.getElementById('toastPlace'), 'A pályák betöltése nem sikerült.', 'danger', true);
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
    loadCoverImageLowThenHigh(game_maps_card, game_map.game_maps_id);

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
            throw new Error(errorData.message);
        }
        window.location.href = '/game';
    } catch (error) {
        showToast(document.getElementById('toastPlace'), 'A játék indítása nem sikerült: ' + error.message, 'danger', true);
    }
}

async function fetchURL(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}

async function loadCoverImageLowThenHigh(card, gmId) {
    let currentUrl = null;
    try {
        await loadGameMapCoverImageLowThenHigh({
            gameMapId: gmId,
            loadToViewer: async (imgData) => {
                imgData.cleanup = () => { };
                if (currentUrl) {
                    loadedURLs.splice(loadedURLs.indexOf(currentUrl), 1);
                    window.URL.revokeObjectURL(currentUrl);
                }
                currentUrl = imgData.url;
                loadedURLs.push(currentUrl);
                card.style.backgroundImage = `url('${currentUrl}')`;
            },
            isCurrent: () => true
        });
    } catch {
        showToast(document.getElementById('toastPlace'), 'A borítókép betöltése nem sikerült.', 'danger', true);
    }
}

function createNewGameCard() {
    let card = document.createElement('div');
    card.classList.add('card', 'glass', 'create-card');
    let content = document.createElement('div');
    content.classList.add('card-content', 'create-card-content');
    let icon = document.createElement('span');
    icon.classList.add('create-icon');
    icon.textContent = '+';
    let title = document.createElement('h3');
    title.classList.add('card-title');
    title.textContent = 'Új játék létrehozása';
    content.appendChild(icon);
    content.appendChild(title);
    card.appendChild(content);
    card.addEventListener('click', handleCreateCardClick);
    return card;
}

var isCreating = false;

async function handleCreateCardClick() {
    if (isCreating) return;
    isCreating = true;
    try {
        const response = await fetch('/api/game-maps', { method: 'POST' });
        if (!response.ok) throw new Error();
        const { gameMapID } = await response.json();
        window.location.href = '/game-maps/' + gameMapID;
    } catch {
        isCreating = false;
        showToast(document.getElementById('toastPlace'), 'Az új játék létrehozása nem sikerült.', 'danger', true);
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
    try {
        const activeGameSession = await fetchURL('/api/choose-game/session');
        if (activeGameSession?.hasActiveSession) {
            const continueModal = document.getElementById('continueGameModal');
            const continueModalDescription = document.getElementById('continue-modal-desc');
            if (activeGameSession.gameTitle) {
                continueModalDescription.innerText = `Van egy futó játékod ezen a pályán: ${activeGameSession.gameTitle}. Szeretnéd folytatni?`;
            }
            continueModal.classList.add('active');
        }
    } catch {

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
            throw new Error(response.statusText);
        }
    } catch {
        showToast(document.getElementById('toastPlace'), 'A játék befejezése nem sikerült.', 'danger', true);
    }
}
