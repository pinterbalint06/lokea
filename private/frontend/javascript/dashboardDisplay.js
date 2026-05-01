import { createHTMLelement, formatTime } from "./utils/domUtils.js";
import { getDashboardInfo, getUserData } from "./fetchs.js";
import { initSocket } from "/javascript/libs/utils/socketio.js";
import i18next from "./utils/i18next.js";

export async function dashboardDisplayre(selectedChart) {
    let display = document.getElementById('content');
    display.innerHTML = "";

    let data = await getDashboardInfo();
    let userData = await getUserData();

    let fejlecDiv = createHTMLelement('div', ['mb-4', 'mt-4']);
    let cim = createHTMLelement('h2', ['h2', 'mb-1'], i18next.t('admin:dashboard.title'));
    let udvozlet = createHTMLelement('p', ['text-muted', 'fs-5', 'mb-0'], i18next.t('admin:dashboard.welcome', { username: userData.username }));
    fejlecDiv.appendChild(cim);
    fejlecDiv.appendChild(udvozlet);
    display.appendChild(fejlecDiv);

    let mainRow = createHTMLelement('div', ['row', 'g-4']);
    let rightCol = createHTMLelement('div', ['col-lg-4', 'd-flex', 'flex-column', 'gap-4']);

    let kpi = createKpi(data.playerCount, data.activePlayerCount, cachedOnlineCount);
    let chart = createChartBox();
    let logs = createLogs(data.logsPreview);

    if (activeMediaQuery && activeLayoutHandler) {
        activeMediaQuery.removeEventListener('change', activeLayoutHandler);
    }

    const mediaQuery = window.matchMedia('(min-width: 992px)');
    const handleLayoutChange = (e) => {
        if (e.matches) {
            kpi.className = "card p-4 shadow-sm border-0";
            chart.className = "col-lg-8";
            logs.className = "card p-4 shadow-sm border-0";

            rightCol.appendChild(kpi);
            rightCol.appendChild(logs);

            mainRow.innerHTML = "";
            mainRow.appendChild(chart);
            mainRow.appendChild(rightCol);
        } else {
            kpi.className = "col-12 mt-5";
            chart.className = "col-12";
            logs.className = "col-12";

            mainRow.innerHTML = "";
            mainRow.appendChild(kpi);
            mainRow.appendChild(chart);
            mainRow.appendChild(logs);
        }
    }
    mediaQuery.addEventListener('change', handleLayoutChange);
    activeMediaQuery = mediaQuery;
    activeLayoutHandler = handleLayoutChange;
    handleLayoutChange(mediaQuery);

    display.appendChild(mainRow);

    let chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
        chartContainer.innerHTML = "";
        let chartImg = createHTMLelement('img', ['img-fluid', 'rounded']);
        chartImg.src = `/api/admin/charts/${selectedChart}`;
        chartImg.style.maxHeight = "400px";
        chartContainer.appendChild(chartImg);
    }

    if (onlineCheckTimeout) {
        clearTimeout(onlineCheckTimeout);
    }
    checkOnlineCount();

    await initSocket();
}

function createKpi(playerCount, activePlayerCount, onlineCount) {
    let card = createHTMLelement('div', ['card', 'p-4', 'shadow-sm', 'border-0']);
    card.appendChild(createHTMLelement('h6', ['text-muted', 'text-uppercase', 'small', 'fw-bold', 'mb-3'], i18next.t('admin:dashboard.player_data')));

    let list = createHTMLelement('div', ['d-flex', 'flex-column', 'gap-2']);

    const items = [
        { label: i18next.t('admin:dashboard.registered_players'), val: playerCount, color: 'text-primary', bg: 'bg-primary-subtle' },
        { label: i18next.t('admin:dashboard.active_players'), val: activePlayerCount, color: 'text-info', bg: 'bg-info-subtle' }
    ];

    items.forEach(item => {
        let row = createHTMLelement('div', ['d-flex', 'justify-content-between', 'align-items-center', 'p-2', 'rounded', item.bg]);
        row.appendChild(createHTMLelement('span', ['small', 'fw-bold'], item.label));
        row.appendChild(createHTMLelement('span', ['badge', item.bg, item.color, 'border'], item.val.toLocaleString()));
        list.appendChild(row);
    });
    let row = createHTMLelement('div', ['d-flex', 'justify-content-between', 'align-items-center', 'p-2', 'rounded', 'bg-success-subtle']);
    row.appendChild(createHTMLelement('span', ['small', 'fw-bold'], i18next.t('admin:dashboard.online_players')));
    row.appendChild(createHTMLelement('span', ['badge', 'bg-success-subtle', 'text-success', 'border'], onlineCount, "onlinePlayerCounter"));
    list.appendChild(row);


    card.appendChild(list);
    return card;
}

function checkOnlineCount() {
    let onlineSpan = document.getElementById('onlinePlayerCounter');
    if (onlineSpan) {
        cachedOnlineCount = onlineSpan.innerText;
        onlineCheckTimeout = setTimeout(checkOnlineCount, 1000);
    }
}

function createChartBox() {
    let col = createHTMLelement('div', ['col-lg-8']);
    let card = createHTMLelement('div', ['card', 'p-4', 'shadow-sm', 'h-100', 'border-0']);
    card.appendChild(createHTMLelement('h6', ['text-muted', 'text-uppercase', 'small', 'fw-bold', 'mb-3'], i18next.t('admin:dashboard.weekly_activity')));

    let chartContainer = createHTMLelement('div', ['d-flex', 'justify-content-center', 'align-items-center', 'bg-light', 'rounded', 'h-100'], i18next.t('admin:dashboard.loading_chart'), "chart-container");

    card.appendChild(chartContainer);
    col.appendChild(card);
    return col;
}

function createLogs(logArray) {
    let card = createHTMLelement('div', ['card', 'p-4', 'shadow-sm', 'border-0']);
    card.appendChild(createHTMLelement('h6', ['text-muted', 'text-uppercase', 'small', 'fw-bold', 'mb-2'], i18next.t('admin:dashboard.system_log')));

    let shell = createHTMLelement('div', ['bg-dark', 'text-success', 'p-3', 'rounded', 'dashboardShell']);
    for (let i = 0; i < logArray.length; i++) {
        let line = createHTMLelement('div', ['mb-1', 'border-bottom', 'border-secondary', 'pb-1']);
        line.style.opacity = "0.8";
        line.appendChild(createHTMLelement('span', ['text-info'], formatTime(logArray[i].happened_at)));
        let victimText = logArray[i].victim ? ` (${logArray[i].victim})` : "";
        line.append(` - ${logArray[i].username}${victimText}: ${logArray[i].activity}`);
        shell.appendChild(line);
    }

    card.appendChild(shell);
    return card;
}

let cachedOnlineCount = "0";
let onlineCheckTimeout = null;
let activeMediaQuery = null;
let activeLayoutHandler = null;