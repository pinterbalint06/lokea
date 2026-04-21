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
    const gameMaps = await fetchURL('http://127.0.0.1:3000/api/game_maps?sort=' + sort + '&offset=' + (cardLoadedTimes * 20));
    console.log(gameMaps.results);
    let gameMapsContainer = document.getElementById('game_maps_container');
    if (gameMaps.success) {
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
    game_maps_card.addEventListener('click', function () {
        createModal(game_map);
    });

    loadCardBackground(game_maps_card, game_map.cover_image_id);

    return game_maps_card;
}

async function loadCardBackground(card, cover_image_id) {
    const image = await getCoverImage(cover_image_id);
    loadedURLs.push(image);
    card.style.backgroundImage = "url('" + image + "')";
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
    console.log(game_map);
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


function formatSecondsToMinutes(seconds) {
    let minutesPart = Math.floor(seconds / 60).toString().padStart(2, "0");
    let secondsPart = (seconds % 60).toString().padStart(2, "0");
    return `${minutesPart}:${secondsPart}`;
}

async function postGameId(gamemapId) {
    const formData = new FormData(document.getElementById('settingsForm'));
    formData.append('gameMapId', gamemapId);
    try {
        const response = await fetch('http://127.0.0.1:3000/api/post_game_id', {
            method: 'POST',
            body: formData 
        });
        if (!response.ok) {
            throw new Error('Hiba a játék indításakor: ' + response.message);
        }
        window.location.href = 'game';
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
        re = { success: false };
    }
    return re;
}

async function getCoverImage(cover_image_id) {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/get_cover_image/' + cover_image_id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            return url;
        }
    } catch (error) {
        console.error('GET hiba:', error);
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
        window.location.href = 'game';
    });
}

async function checkAndShowContinueModal() {
    const activeGameSession = await fetchURL('http://127.0.0.1:3000/api/active_game_session');
    if (activeGameSession.success && activeGameSession.hasActiveSession) {
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
        const response = await fetch('http://127.0.0.1:3000/api/finish_game_session', {
            method: 'POST',
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
