export function createFavoriteButton(game_map_id, isFavorited = false) {
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

    if (isFavorited) favoriteBtn.classList.add('active');

    favoriteBtn.addEventListener('click', async function (e) {
        e.stopPropagation();
        this.disabled = true;
        const wasActive = this.classList.contains('active');
        this.classList.toggle('active');
        try {
            const response = await fetch(`/api/game-maps/${game_map_id}/favorite`, {
                method: wasActive ? 'DELETE' : 'POST'
            });
            if (!response.ok) {
                this.classList.toggle('active');
            }
        } catch {
            this.classList.toggle('active');
        } finally {
            this.disabled = false;
        }
    });
    return favoriteBtn;
}
