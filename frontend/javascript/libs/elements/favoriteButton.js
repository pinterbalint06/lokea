export function createFavoriteButton(game_map_id) {
    let favoriteBtn = document.createElement('button');
    favoriteBtn.classList.add('card-favorite-btn');
    favoriteBtn.title = 'Kedvencekhez adás';

    let favSvgOutline = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let favUseOutline = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    favUseOutline.setAttribute('href', '../images/icons/game-lobby-icons.svg#heart');
    favSvgOutline.appendChild(favUseOutline);
    favSvgOutline.classList.add('heart-outline');

    let favSvgSolid = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let favUseSolid = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    favUseSolid.setAttribute('href', '../images/icons/game-lobby-icons.svg#heart-solid');
    favSvgSolid.appendChild(favUseSolid);
    favSvgSolid.classList.add('heart-solid');

    favoriteBtn.appendChild(favSvgOutline);
    favoriteBtn.appendChild(favSvgSolid);
    favoriteBtn.addEventListener('click', async function (e) {
        e.stopPropagation();
        this.classList.toggle('active');
        favorited(game_map_id);
    });
    return favoriteBtn;
}
