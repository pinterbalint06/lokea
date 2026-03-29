import { inputGeneral, formatDate, gombGeneral } from "./utils/domUtils.js";
import { getLogs, sortedLogs } from "./fetchs.js";

export async function logsDisplayre() {
    let display = document.getElementById('content');
    let row = document.createElement('div');
    row.classList.add("row", "p-3");

    let col9div = document.createElement('div');
    col9div.classList.add("col-9");

    let fejlec = document.createElement('div');
    fejlec.classList.add("d-flex", "justify-content-between");

    let cim = document.createElement('h2');
    cim.innerText = "Logs";
    cim.classList.add("h2");


    fejlec.appendChild(cim);
    col9div.appendChild(fejlec);

    //tablazat
    let tablazat = document.createElement('div');
    tablazat.id = "logsDiv";
    tablazat.appendChild(tablazatGeneral((await getLogs()).logs));
    col9div.appendChild(tablazat);

    //szures

    let col3div = document.createElement("div");
    col3div.classList.add("col-3");
    let kartya = document.createElement("div");
    kartya.classList.add("card", "bg-light", "p-3");
    let kiscim = document.createElement('h4');
    kiscim.classList.add("h4");
    kiscim.innerText = 'Sort';
    let szuresDiv = szuresek();

    kartya.appendChild(kiscim);
    kartya.appendChild(szuresDiv);
    col3div.appendChild(kartya);

    row.appendChild(col9div);
    row.appendChild(col3div);

    display.appendChild(row);
}

function tablazatGeneral(adatok) {
    //todo - ha ures a data, ird ki hogy nincs talalat
    let tablazat = document.createElement('table');
    tablazat.id = 'logsTable';
    tablazat.classList.add("table", "table-striped", "table-hover");

    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    let oszlopfok = ["User (victim)", "Activity", "Happened at"];

    for (let i = 0; i < oszlopfok.length; i++) {
        let th = document.createElement("th");
        th.innerText = oszlopfok[i];
        tr.appendChild(th);
    }
    thead.appendChild(tr);

    let tbody = document.createElement('tbody');
    tbody.classList.add("table-group-divider");
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
            let td = document.createElement('td');
            td.innerText = ertek;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    }

    tablazat.appendChild(thead);
    tablazat.appendChild(tbody);

    return tablazat;
}

function frissitLogTablazat(data) {
    let tablePlace = document.getElementById('logsDiv');
    tablePlace.innerHTML = "";
    tablePlace.appendChild(tablazatGeneral(data));
}

function szuresek() {
    let szuresDiv = document.createElement('div');
    szuresDiv.classList.add("mb-3", "d-flex", "flex-column");

    //kereso

    let keresodiv = document.createElement('div');
    keresodiv.classList.add("mb-3");

    let inputgroupdiv = document.createElement('div');
    inputgroupdiv.classList.add("input-group");

    let keresoInput = inputGeneral("text", "Sort by name...", null, "keresoInput", ["form-control"], false);
    inputgroupdiv.appendChild(keresoInput);
    keresodiv.appendChild(inputgroupdiv);
    szuresDiv.appendChild(keresodiv);

    //activities

    let activityDiv = document.createElement('div');
    let activityDivCim = document.createElement('h6');
    activityDivCim.classList.add("h6", "mt-3");
    activityDivCim.innerText = "Activities";
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
        let label = document.createElement('label');
        label.setAttribute("for", `activities${activities[i]}`);
        label.classList.add("form-check-label");
        label.innerText = activities[i];
        formcheck.appendChild(checkbox);
        formcheck.appendChild(label);
        activityDiv.appendChild(formcheck);
    }
    szuresDiv.appendChild(activityDivCim);
    szuresDiv.appendChild(activityDiv);

    //roles

    let roleDiv = document.createElement('div');
    let roleDivCim = document.createElement('h6');
    roleDivCim.classList.add("h6", "mt-3");
    roleDivCim.innerText = "Role";
    let roleok = ["Admin", "Moderator", "User"];
    for (let i = 0; i < roleok.length; i++) {
        let formcheck = document.createElement('div');
        formcheck.classList.add("form-check");
        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.classList.add("form-check-input");
        checkbox.id = `role${roleok[i]}`;
        checkbox.name = "sort2";
        let label = document.createElement('label');
        label.setAttribute("for", `role${roleok[i]}`);
        label.classList.add("form-check-label");
        label.innerText = roleok[i];
        formcheck.appendChild(checkbox);
        formcheck.appendChild(label);
        roleDiv.appendChild(formcheck);
    }
    szuresDiv.appendChild(roleDivCim);
    szuresDiv.appendChild(roleDiv);

    //dates

    let datesDiv = document.createElement('div');
    let datesDivCim = document.createElement('h6');
    datesDivCim.classList.add("h6", "mt-3");
    datesDivCim.innerText = "Dates";
    datesDiv.appendChild(datesDivCim);

    datesDiv.appendChild(createDatePicker("From:", "from"));
    datesDiv.appendChild(createDatePicker("To:", "to"));
    szuresDiv.appendChild(datesDiv);

    //todo - reset gomb

    //gomb

    let sortBtn = gombGeneral("button", "Sort", null, "green", null);
    sortBtn.classList.add("text-center");
    sortBtn.addEventListener("click", async function () {
        let username = document.getElementById("keresoInput").value;
        let activities = Array.from(document.querySelectorAll('input[name="sort1"]:checked'))
            .map(cb => cb.value);
        let roles = Array.from(document.querySelectorAll('input[name="sort2"]:checked'))
            .map(cb => cb.nextElementSibling.innerText);

        let fromDateVal = document.getElementById("fromDate").value;
        let fromSliderVal = document.querySelector("#fromDate + input[type='range']").value;
        let periodFrom = fromDateVal ? `${fromDateVal} ${getTimeFromSlider(fromSliderVal)}` : null;

        let toDateVal = document.getElementById("toDate").value;
        let toSliderVal = document.querySelector("#toDate + input[type='range']").value;
        let periodTo = toDateVal ? `${toDateVal} ${getTimeFromSlider(toSliderVal)}` : null;

        const variables = {
            username,
            periodFrom,
            periodTo,
            roles,
            activities
        };

        frissitLogTablazat(await sortedLogs(variables));
    })
    szuresDiv.appendChild(sortBtn);

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
    let container = document.createElement('div');
    container.classList.add("mb-3", "p-2", "border", "rounded", "bg-light");

    let label = document.createElement('label');
    label.classList.add("form-label", "small", "fw-bold");
    label.innerText = labelStr;

    let dateInp = document.createElement('input');
    dateInp.type = "date";
    dateInp.id = `${idPrefix}Date`;
    dateInp.classList.add("form-control", "form-control-sm", "mb-2");
    dateInp.value = new Date().toISOString().split('T')[0];

    let slider = document.createElement('input');
    slider.type = "range";
    slider.min = "0";
    slider.max = "96";
    slider.value = idPrefix === "from" ? "32" : "68";
    slider.classList.add("form-range");

    let timeDisplay = document.createElement('div');
    timeDisplay.classList.add("text-center", "badge", "bg-primary", "d-block");
    timeDisplay.style.fontSize = "0.9rem";
    timeDisplay.innerText = formatTime(slider.value);

    slider.addEventListener("input", function () {
        timeDisplay.innerText = formatTime(slider.value);
    });

    container.appendChild(label);
    container.appendChild(dateInp);
    container.appendChild(slider);
    container.appendChild(timeDisplay);
    return container;
}