import { inputGeneral, formatDate } from "./utils/domUtils.js";
import { getLogs, sortedLogs } from "./fetchs.js";

export async function logsDisplayre() {
    let display = document.getElementById('content');
    let row = document.createElement('div');
    row.classList.add("row", "p-3");

    //kereso
    let col9div = document.createElement('div');
    col9div.classList.add("col-9");

    let fejlec = document.createElement('div');
    fejlec.classList.add("d-flex", "justify-content-between");

    let cim = document.createElement('h2');
    cim.innerText = "Logs";
    cim.classList.add("h2");

    
    fejlec.appendChild(cim);
    col9div.appendChild(fejlec);

    //szures

    let col3div = document.createElement("div");
    col3div.classList.add("col-3");
    let kartya = document.createElement("div");
    kartya.classList.add("card", "bg-light", "p-3");
    let kiscim = document.createElement('h4');
    kiscim.classList.add("h4");
    kiscim.innerText = 'Sort';
    let szuresDiv = document.createElement('div');
    szuresDiv.classList.add("mb-3");

    kartya.appendChild(kiscim);
    kartya.appendChild(szuresDiv);
    col3div.appendChild(kartya);

    //tablazat
    let tablazat = document.createElement('div');
    tablazat.id = "logsDiv";
    tablazat.appendChild(tablazatGeneral(await getLogs()));
    col9div.appendChild(tablazat);

    row.appendChild(col9div);
    row.appendChild(col3div);

    display.appendChild(row);
}

function tablazatGeneral(data) {
    console.log(data);
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
    let adatok = data.logs;
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