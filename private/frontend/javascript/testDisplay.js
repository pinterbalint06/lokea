import { createHTMLelement, gombGeneral } from "./utils/domUtils.js";
import i18next from "./utils/i18next.js";

export function testDisplayre() {
    let display = document.getElementById('content');
    display.innerHTML = "";

    const container = createHTMLelement('div', ['d-flex', 'flex-column', 'align-items-center', 'p-5', 'rounded-4', 'glass', 'mx-auto', 'mt-5']);
    container.style.maxWidth = '450px';

    let text = document.createElement('p');
    text.textContent = i18next.t('admin:testDisplay.title', { defaultValue: 'Válassz a tesztelési nézetek közül:' });
    text.className = 'fs-4 fw-bold mb-4 text-center';
    container.appendChild(text);

    let mapButton = gombGeneral('button', i18next.t('admin:testDisplay.mapViewer', { defaultValue: 'Teszt térképnézegető' }), null, 'blue', null, ['rounded-pill', 'w-100', 'mb-3', 'py-2', 'fw-semibold']);
    mapButton.onclick = () => window.location.href = '/map';
    container.appendChild(mapButton);

    let equiButton = gombGeneral('button', i18next.t('admin:testDisplay.equiViewer', { defaultValue: 'Teszt 360 fokos képnézegető' }), null, 'blue', null, ['rounded-pill', 'w-100', 'mb-3', 'py-2', 'fw-semibold']);
    equiButton.onclick = () => window.location.href = '/equirectangular';
    container.appendChild(equiButton);

    display.appendChild(container);
}