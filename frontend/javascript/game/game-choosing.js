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
    closeBtn.addEventListener('click', () => {
        document.getElementById('myModal').classList.remove('active');
    });
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
    modal.classList.add('active');
    modalTitle.innerText = game_map.title;
    modalStars.style.setProperty('--rating', game_map.rating);
    modalDesc.innerText = game_map.game_description;
}

//TODO: játék indítása modalból
