import { createHTMLelement, inputGeneral, formatDate, gombGeneral, labelGeneral, lapozasGeneral, createSection, showAlert } from "./utils/domUtils.js";
import { getLogs, sortedLogs, exportLogs } from "./fetchs.js";
import i18n from "./utils/i18next.js";

export async function logsDisplayre() {
    currentPage.page = 1;
    let display = document.getElementById('content');
    display.innerHTML = "";

    let row = createHTMLelement('div', ["row", "p-3", "g-4"]);

    let fejlecDiv = createHTMLelement('div', ["d-flex", "justify-content-between", "align-items-center"]);
    let cim = createHTMLelement('h2', ["h2", "mb-0"], i18n.t('admin:logs.title'));
    fejlecDiv.appendChild(cim);

    let szuresTartalom = szuresek();
    let szuresCol = createHTMLelement('div', []);

    let kartya = createHTMLelement('div', ["card", "bg-light", "p-3", "shadow-sm"]);
    let kiscim = createHTMLelement('h4', ["h4"], i18n.t('admin:common.sort'));

    //tablazat
    let tablazatCol = createHTMLelement('div', []);
    let tablazatTartalom = createHTMLelement('div', [], null, "logsDiv");
    tablazatCol.appendChild(tablazatTartalom);

    let balOldal = createHTMLelement('div', ["col-lg-8"]);
    let jobbOldal = createHTMLelement('div', ["col-lg-4"]);

    const mediaQuery = window.matchMedia('(min-width: 992px)');

    const handleLayoutChange = (e) => {
        row.innerHTML = "";
        szuresCol.innerHTML = "";

        if (e.matches) {
            kartya.innerHTML = "";
            kartya.appendChild(kiscim);
            kartya.appendChild(szuresTartalom);
            szuresCol.appendChild(kartya);

            balOldal.appendChild(fejlecDiv);
            balOldal.appendChild(tablazatCol);
            jobbOldal.appendChild(szuresCol);

            row.appendChild(balOldal);
            row.appendChild(jobbOldal);

            tablazatCol.className = "mt-3";
            szuresCol.className = "";
        } else {
            let accordionContainer = createHTMLelement('div', ['accordion'], null, 'settingsAccordion');
            let { item, body } = createSection('filter', i18n.t('admin:common.sort'), false);

            body.appendChild(szuresTartalom);
            accordionContainer.appendChild(item);
            szuresCol.appendChild(accordionContainer);

            szuresCol.className = "col-12 order-2 my-3";
            tablazatCol.className = "col-12 order-3";

            let fejlecWrap = createHTMLelement('div', ["col-12", "order-1", "mb-2"]);
            fejlecWrap.appendChild(fejlecDiv);

            row.appendChild(fejlecWrap);
            row.appendChild(szuresCol);
            row.appendChild(tablazatCol);
        }
    };

    mediaQuery.addEventListener('change', handleLayoutChange);
    handleLayoutChange(mediaQuery);

    display.appendChild(row);

    let data = await getLogs();
    frissitLogTablazat(data.logs, data.total);
}

function tablazatGeneral(adatok) {
    let tablazat = createHTMLelement('table', ["table", "table-striped", "table-hover", "mt-3"], null, 'logsTable');

    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    let oszlopfok = [i18n.t('admin:logs.user_victim'), i18n.t('admin:logs.activity-one'), i18n.t('admin:logs.happened_at')];

    for (let i = 0; i < oszlopfok.length; i++) {
        let th = createHTMLelement('th', [], oszlopfok[i]);
        tr.appendChild(th);
    }
    thead.appendChild(tr);

    let tbody = createHTMLelement('tbody', ["table-group-divider"]);
    for (let i = 0; i < adatok.length; i++) {
        let tr = document.createElement('tr');
        let log = adatok[i];

        let userCellContent = log.victim ? `${log.username} (${log.victim})` : log.username;

        let sorAdat = [
            userCellContent,
            log.activity,
            formatDate(log.happened_at)
        ];

        sorAdat.forEach(ertek => {
            let td = createHTMLelement('th', [], ertek);
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    }

    tablazat.appendChild(thead);
    tablazat.appendChild(tbody);

    return tablazat;
}

function frissitLogTablazat(data, logCount) {
    let tablePlace = document.getElementById('logsDiv');
    tablePlace.innerHTML = "";
    if (!data || data.length === 0) {
        showAlert('Nincs megjeleníthető naplóbejegyzés!', 'info');
    }
    tablePlace.appendChild(lapozasGeneral(logCount, paginate, currentPage, 15));
    tablePlace.appendChild(tablazatGeneral(data));
}

function szuresek() {
    let szuresDiv = createHTMLelement('div', ["mb-3", "d-flex", "flex-column"]);

    //kereso

    let keresodiv = createHTMLelement('div', ["mb-3"]);

    let inputgroupdiv = createHTMLelement('div', ["input-group"]);

    let keresoInput = inputGeneral("text", i18n.t('admin:logs_sort.sort_by_name'), null, "keresoInput", ["form-control"], false);
    inputgroupdiv.appendChild(keresoInput);
    keresodiv.appendChild(inputgroupdiv);
    szuresDiv.appendChild(keresodiv);

    //activities

    let activityDiv = document.createElement('div');
    let activityDivCim = createHTMLelement('h6', ["h6", "mt-3"], i18n.t('admin:logs.activity-other'));
    let activities = ["Sign up", "Login", "User update", "Password update", "User delete", "Update profile picture", "Delete profile picture"];
    let activitiesName = ["Sign up", "Login", "User update", "Password update", "User delete", "Profile picture update", "Profile picture delete"];
    for (let i = 0; i < activities.length; i++) {
        let formcheck = document.createElement('div');
        formcheck.classList.add("form-check");
        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.classList.add("form-check-input");
        checkbox.id = `activities${activities[i]}`;
        checkbox.name = "sort1";
        checkbox.value = activitiesName[i];
        let label = labelGeneral(`activities${activities[i]}`, i18n.t(`common:common.${activities[i]}`), ["form-check-label"]);
        formcheck.appendChild(checkbox);
        formcheck.appendChild(label);
        activityDiv.appendChild(formcheck);
    }
    szuresDiv.appendChild(activityDivCim);
    szuresDiv.appendChild(activityDiv);

    //roles

    let roleDiv = document.createElement('div');
    let roleDivCim = createHTMLelement('h6', ["h6", "mt-3"], i18n.t('admin:logs_sort.role'));
    let roles = ["Lord", "Admin", "Moderator", "User"];
    let roleValues = ["LORD", "ADMIN", "MOD", "user"];
    for (let i = 0; i < roles.length; i++) {
        let formcheck = document.createElement('div');
        formcheck.classList.add("form-check");
        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.classList.add("form-check-input");
        checkbox.id = `role${roles[i]}`;
        checkbox.name = "sort2";
        checkbox.value = roleValues[i];
        let label = labelGeneral(`role${roles[i]}`, i18n.t(`admin:common.${roles[i].toLowerCase()}`), ["form-check-label"]);
        formcheck.appendChild(checkbox);
        formcheck.appendChild(label);
        roleDiv.appendChild(formcheck);
    }
    szuresDiv.appendChild(roleDivCim);
    szuresDiv.appendChild(roleDiv);

    //dates

    let datesDiv = document.createElement('div');
    let datesHeader = createHTMLelement('div', ["d-flex", "justify-content-between", "align-items-center", "mt-3", "mb-2"]);

    let datesDivCim = createHTMLelement('h6', ["h6", "m-0"], i18n.t('admin:logs_sort.dates'));

    let switchDiv = createHTMLelement('div', ["form-check", "form-switch"]);
    let dateSwitch = document.createElement('input');
    dateSwitch.type = "checkbox";
    dateSwitch.classList.add("form-check-input");
    dateSwitch.id = "dateSwitch";

    switchDiv.appendChild(dateSwitch);
    datesHeader.appendChild(datesDivCim);
    datesHeader.appendChild(switchDiv);
    datesDiv.appendChild(datesHeader);

    let datePicker = document.createElement('div');
    datePicker.id = "datePickersWrapper";
    datePicker.style.opacity = "0.5";

    datePicker.appendChild(createDatePicker(`${i18n.t("common:common.from")}:`, "from"));
    datePicker.appendChild(createDatePicker(`${i18n.t("common:common.to")}:`, "to"));
    datesDiv.appendChild(datePicker);

    dateSwitch.addEventListener("change", function () {
        datePicker.style.opacity = this.checked ? "1" : "0.5";
        let inputs = datePicker.querySelectorAll('input');
        inputs.forEach(i => i.disabled = !this.checked);
    });

    szuresDiv.appendChild(datesDiv);

    //reset gomb

    let resetBtn = gombGeneral("button", i18n.t('common:common.reset'), null, "red", null);
    resetBtn.addEventListener("click", async function () {
        document.getElementById("keresoInput").value = "";
        document.querySelectorAll('input[name="sort1"], input[name="sort2"]').forEach(cb => cb.checked = false);
        document.getElementById("dateSwitch").checked = false;

        const today = new Date().toISOString().split('T')[0];
        document.getElementById("fromDate").value = today;
        document.getElementById("toDate").value = today;

        document.querySelectorAll('#datePickersWrapper input[type="range"]').forEach((slider, idx) => {
            slider.value = idx === 0 ? "32" : "96";
            slider.parentElement.querySelector(".time-display").innerText = idx === 0 ? "08:00" : "23:59";
        });

        let datePickers = document.getElementById("datePickersWrapper");
        datePickers.style.opacity = "0.5";
        datePickers.querySelectorAll('input').forEach(i => i.disabled = true);

        currentPage.page = 1;
        let data = await getLogs();
        frissitLogTablazat(data.logs, data.total);
    });
    szuresDiv.appendChild(resetBtn);

    //szures gomb

    let sortBtn = gombGeneral("button", i18n.t('admin:logs_sort.sort'), null, "green", null, ["text-center", "mt-2"]);
    sortBtn.addEventListener("click", async function () {
        currentPage.page = 1;
        let data = await sortedLogs(getFilterValues());
        frissitLogTablazat(data.logs, data.total);
    })
    szuresDiv.appendChild(sortBtn);

    let exportBtn = gombGeneral("button", i18n.t('admin:logs_sort.export_btn'), "file-text", "blue", null, ["text-center", "mt-2"]);
    exportBtn.addEventListener("click", async function () {
        await exportLogs(getFilterValues());
    });
    szuresDiv.appendChild(exportBtn);

    return szuresDiv;
}

function formatTime(val) {
    let totalMinutes = val * 15;
    let h = Math.floor(totalMinutes / 60);
    let m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getTimeFromSlider(sliderValue) {
    let totalMinutes = sliderValue * 15;
    let time;
    if (totalMinutes >= 1440) {
        time = "23:59:59";
    }
    else {
        let h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
        let m = (totalMinutes % 60).toString().padStart(2, '0');
        time = `${h}:${m}:00`
    }
    return time;
}

function createDatePicker(labelStr, idPrefix) {
    let container = createHTMLelement('div', ["mb-3", "p-2", "border", "rounded", "bg-light"]);

    let label = document.createElement('label');
    label.classList.add("form-label", "small", "fw-bold");
    label.innerText = labelStr;

    let dateInp = inputGeneral('date', null, new Date().toISOString().split('T')[0], `${idPrefix}Date`, ["form-control", "form-control-sm", "mb-2"], true);

    let slider = inputGeneral('range', null, idPrefix === "from" ? "32" : "96", null, ["form-range"], true);
    slider.min = "0";
    slider.max = "96";

    let timeDisplay = createHTMLelement('div', ["text-center", "badge", "bg-primary", "d-block", "time-display"], formatTime(slider.value));
    timeDisplay.style.fontSize = "0.9rem";

    slider.addEventListener("input", function () {
        timeDisplay.innerText = formatTime(slider.value);
    });

    container.appendChild(label);
    container.appendChild(dateInp);
    container.appendChild(slider);
    container.appendChild(timeDisplay);
    return container;
}

async function paginate() {
    let data = await sortedLogs(getFilterValues());
    frissitLogTablazat(data.logs, data.total);
}

function getFilterValues() {
    let isDateEnabled = document.getElementById("dateSwitch").checked;
    let periodFrom = null;
    let periodTo = null;

    if (isDateEnabled) {
        let fromDateValue = document.getElementById("fromDate").value;
        let fromSliderValue = document.querySelector("#fromDate + input[type='range']").value;
        periodFrom = fromDateValue ? `${fromDateValue} ${getTimeFromSlider(fromSliderValue)}` : null;

        let toDateValue = document.getElementById("toDate").value;
        let toSliderValue = document.querySelector("#toDate + input[type='range']").value;
        periodTo = toDateValue ? `${toDateValue} ${getTimeFromSlider(toSliderValue)}` : null;
    }



    return {
        username: document.getElementById("keresoInput").value,
        periodFrom,
        periodTo,
        roles: Array.from(document.querySelectorAll('input[name="sort2"]:checked')).map(cb => cb.value),
        activities: Array.from(document.querySelectorAll('input[name="sort1"]:checked')).map(cb => cb.value),
        page: currentPage.page
    };
}

let currentPage = { page: 1 };