document.addEventListener("DOMContentLoaded", function () {
    let selectedButton = document.getElementById('sortByCreated');
    let closeBtn = document.querySelector('.modal-close-btn');
        closeBtn.addEventListener('click', () => {
            document.getElementById('myModal').classList.remove('active');
        });
    loadGame_Maps('created');
    document.getElementById('sortByCreated').addEventListener('click', function () {
        loadGame_Maps('created');
        selectedButton.classList.remove('btnPushed');
        this.classList.add('btnPushed');
        selectedButton = this;
    });
    document.getElementById('sortByRating').addEventListener('click', function () {
        loadGame_Maps('rating');
        selectedButton.classList.remove('btnPushed');
        this.classList.add('btnPushed');
        selectedButton = this;
    });
    document.getElementById('sortByPlays').addEventListener('click', function () {
        loadGame_Maps('plays');
        selectedButton.classList.remove('btnPushed');
        this.classList.add('btnPushed');
        selectedButton = this;
    });
    document.getElementById('sortByFavorites').addEventListener('click', function () {
        loadGame_Maps('favorites');
        selectedButton.classList.remove('btnPushed');
        this.classList.add('btnPushed');
        selectedButton = this;
    });
});

async function loadGame_Maps(sort) {
    const gameMaps = await fetchURL('http://127.0.0.1:3000/api/game_maps_by_' + sort);
    let gameMapsContainer = document.getElementById('game_maps_container');
    gameMapsContainer.innerHTML = '';
    if (gameMaps.success) {
        for (let i = 0; i < gameMaps.results.length; i++) {
            gameMapsContainer.appendChild(await createCard(gameMaps.results[i]));
        }
    } else {
        let p = document.createElement('p');
        p.classList.add('text-center');
        p.innerText = 'Nincsenek elérhető játékok.';
        gameMapsContainer.appendChild(p);
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
    }}


    async function createCard(game_map) {
        let game_maps_card = document.createElement('div');
        const image = await getCoverImage(game_map.cover_image_id);
        game_maps_card.classList.add('card', 'glass');
        game_maps_card.style.backgroundImage = "url('" + image + "')";
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
        return game_maps_card;
    }

    async function getCoverImage(cover_image_id) {
        const c_image_id = {
            image_id: cover_image_id
        };
        try {
            const response = await fetch('http://127.0.0.1:3000/api/get_cover_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(c_image_id)
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                return url;
            }
        } catch (error) {
            console.error('POST hiba:', error);
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