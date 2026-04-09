import {createHTMLelement} from "./utils/domUtils.js";

export async function dashboardDisplayre() {
    let display = document.getElementById('content');
    display.innerHTML = "";

    let staticData = {
        stats: {
            total: 15420,
            active: 842,
            online: 45
        },
        logs: [
            "Rendszer sikeresen elindult",
            "Új adminisztrátor bejelentkezve: Admin_01",
            "Adatbázis mentés elkészült",
            "Biztonsági frissítés telepítve",
            "Szerver válaszidő: 14ms"
        ]
    };

    let mainRow = createHTMLelement('div', ['row', 'g-4']);

    mainRow.appendChild(createChartBox());

    let rightCol = createHTMLelement('div', ['col-lg-4']);
    let rightStack = createHTMLelement('div', ['d-flex', 'flex-column', 'gap-4']);
    
    rightStack.appendChild(createKpi(staticData.stats));
    rightStack.appendChild(createLogs(staticData.logs));
    
    rightCol.appendChild(rightStack);
    mainRow.appendChild(rightCol);

    display.appendChild(mainRow);

    let chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
        chartContainer.innerHTML = "";
        let chartImg = createHTMLelement('img', ['img-fluid', 'rounded']);
        chartImg.src = '/api/admin/chart';
        chartImg.style.maxHeight = "400px";
        chartContainer.appendChild(chartImg);
    }
}

function createKpi(stats) {
    let card = createHTMLelement('div', ['card', 'p-4', 'shadow-sm', 'border-0']);
    card.appendChild(createHTMLelement('h6', ['text-muted', 'text-uppercase', 'small', 'fw-bold', 'mb-3'], 'Játékos adatok'));

    let list = createHTMLelement('div', ['d-flex', 'flex-column', 'gap-2']);

    const items = [
        { label: 'Regisztrált', val: stats.total, color: 'text-primary', bg: 'bg-primary-subtle' },
        { label: 'Aktív', val: stats.active, color: 'text-info', bg: 'bg-info-subtle' },
        { label: 'Online', val: stats.online, color: 'text-success', bg: 'bg-success-subtle' }
    ];

    items.forEach(item => {
        let row = createHTMLelement('div', ['d-flex', 'justify-content-between', 'align-items-center', 'p-2', 'rounded', item.bg]);
        row.appendChild(createHTMLelement('span', ['small', 'fw-bold'], item.label));
        row.appendChild(createHTMLelement('span', ['badge', item.bg, item.color, 'border'], item.val.toLocaleString()));
        list.appendChild(row);
    });

    card.appendChild(list);
    return card;
}

function createChartBox() {
    let col = createHTMLelement('div', ['col-lg-8']);
    let card = createHTMLelement('div', ['card', 'p-4', 'shadow-sm', 'h-100', 'border-0']);
    card.appendChild(createHTMLelement('h6', ['text-muted', 'text-uppercase', 'small', 'fw-bold', 'mb-3'], 'Heti aktivitás'));

    let chartContainer = createHTMLelement('div', ['d-flex', 'justify-content-center', 'align-items-center', 'bg-light', 'rounded', 'h-100'], "Diagram betöltése...", "chart-container");
    chartContainer.style.minHeight = "450px";

    card.appendChild(chartContainer);
    col.appendChild(card);
    return col;
}

function createLogs(logArray) {
    let card = createHTMLelement('div', ['card', 'p-4', 'shadow-sm', 'border-0']);
    card.appendChild(createHTMLelement('h6', ['text-muted', 'text-uppercase', 'small', 'fw-bold', 'mb-2'], 'Rendszer Log'));

    let shell = createHTMLelement('div', ['bg-dark', 'text-success', 'p-3', 'rounded']);
    shell.style.height = "215px";
    shell.style.overflowY = "auto";
    shell.style.fontFamily = "'Courier New', monospace";
    shell.style.fontSize = "0.75rem";

    logArray.forEach(msg => {
        let line = createHTMLelement('div', ['mb-1', 'border-bottom', 'border-secondary', 'pb-1']);
        line.style.opacity = "0.8";
        line.appendChild(createHTMLelement('span', ['text-info'], new Date().toLocaleTimeString()));
        line.append(msg);
        shell.appendChild(line);
    });

    card.appendChild(shell);
    return card;
}