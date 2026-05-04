import { createFavoriteButton } from "../libs/elements/favoriteButton.js";
import { showAlert } from "../libs/utils/DOMutils.js";
import { ContinueGameModal } from "../libs/elements/ContinueGameModal.js";
import { fetchActiveGameSession, finishGameSession } from "../libs/network/gameSession.js";
import { createGameMapCard } from "../libs/elements/GameMapCard.js";

window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload();
});

var loadedURLs = [];
var cardLoadedTimes = 0;
var activeTab = 'all';
var selectedButton = null;
let continueGameModal = null;

function clearLoadedURLs() {
    for (let url of loadedURLs) {
        window.URL.revokeObjectURL(url);
    }
    loadedURLs = [];
}

document.addEventListener("DOMContentLoaded", function () {
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

    continueGameModal = new ContinueGameModal();
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
        let url = '/api/lobby?sort=' + sort + '&offset=' + (cardLoadedTimes * 20);
        if (filter) url += '&filter=' + filter;
        let gameMaps = await fetchURL(url);
        let gameMapsContainer = document.getElementById('game_maps_container');
        if (gameMaps.results && gameMaps.results.length > 0) {
            for (let i = 0; i < gameMaps.results.length; i++) {
                gameMapsContainer.appendChild(createGameMapCard(gameMaps.results[i]));
            }
            cardLoadedTimes++;
        } else if (filter !== 'mine') {
            showToast(document.getElementById('toastPlace'), 'Nincsenek további elérhető játékok.', 'info', true);
        }
    } catch {
        showAlert('A pályák betöltése nem sikerült.', 'danger');
    }
}


async function fetchURL(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
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

let isCreating = false;

async function handleCreateCardClick() {
    if (!isCreating) {
        isCreating = true;
        try {
            const response = await fetch('/api/game-maps', { method: 'POST' });
            if (!response.ok) throw new Error();
            const { gameMapID } = await response.json();
            window.location.href = '/game-maps/' + gameMapID;
        } catch {
            isCreating = false;
            showAlert('Az új játék létrehozása nem sikerült.', 'danger');
        }
    }
}

async function checkAndShowContinueModal() {
    try {
        const activeGameSession = await fetchActiveGameSession();
        if (activeGameSession?.hasActiveSession) {
            continueGameModal.show(
                activeGameSession.gameTitle,
                () => {
                    window.location.href = '/game';
                },
                async () => {
                    try {
                        await finishGameSession();
                    } catch {
                        showAlert('A játék befejezése nem sikerült.', 'danger');
                    }
                }
            );
        }
    } catch {

    }
}
