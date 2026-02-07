document.addEventListener("DOMContentLoaded", function () {
    loadGame_Maps();
});

async function loadGame_Maps() {
    const gameMaps = await fetchURL('http://127.0.0.1:3000/api/game_maps');
    let gameMapsContainer = document.getElementById('game_maps_container');
    gameMapsContainer.innerHTML = '';
    for (let i = 0; i < gameMaps.results.length; i++) {
        gameMapsContainer.appendChild(await createCard(gameMaps.results[i]));
    }
}

async function fetchURL(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Hiba a játék pályák lekérésekor: ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error('Hiba a játék pályák betöltésekor:', error);
    }
}


async function createCard(game_map) {
    let game_maps_card = document.createElement('div');
    const image = await getCoverImage(game_map.cover_image_id);
    game_maps_card.classList.add('card');
    game_maps_card.style.backgroundImage = "url('" + image + "')";
    let game_maps_card_content = document.createElement('div');
    game_maps_card_content.classList.add('card-content');
    let card_name = document.createElement('h3');
    card_name.innerText = game_map.title;
    let card_rating = document.createElement('p');
    card_rating.innerText = `Értékelés: ${game_map.rating}`; //ratinget megcsinálni api-ból kapott adat alapján
    let card_plays = document.createElement('p');
    card_plays.innerText = `Játékok száma: ${game_map.plays}`;
    let card_created = document.createElement('p');
    card_created.innerText = `Létrehozva: ${(game_map.game_created.split('T')[0]).replaceAll('-', '.')}`;
    game_maps_card_content.appendChild(card_name);
    game_maps_card_content.appendChild(card_rating);
    game_maps_card_content.appendChild(card_plays);
    game_maps_card_content.appendChild(card_created);
    game_maps_card.appendChild(game_maps_card_content);
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