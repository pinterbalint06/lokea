import { dashboardDisplayre } from "./dashboardDisplay.js";
import { usersDisplayre } from "./usersDisplay.js";
import { logsDisplayre } from "./logsDisplay.js";
import { settingsDisplayre } from "./settingsDisplay.js";
import { getAdminSettings, nyelvSzinkronizalas, kijelentkezes } from "./fetchs.js";

document.addEventListener("DOMContentLoaded", async function () {
    await nyelvSzinkronizalas();
    modalElement = document.getElementById('modalView');
    modalElement.addEventListener('hidden.bs.modal', function () {
        if (objectURL) {
            URL.revokeObjectURL(objectURL);
            objectURL = null;
        }
    });
    modal = new bootstrap.Modal(modalElement);
    document.getElementById('signoutBtn').addEventListener("click", async function () {
        await kijelentkezes();
    });
    document.getElementById('leaveAdminBtn').addEventListener("click", function () {
        window.location.href = "/main";
    });
    document.getElementById('toggleSidebar').addEventListener('click', function () {
        sidebarvaltoztat();
    });
    let navlinkek = document.querySelectorAll(".nav-link[data-route]");
    navlinkek.forEach(element => {
        element.addEventListener("click", async function () {
            aktivEltuntet();
            this.classList.add("active");
            await melyikValaszt(element.dataset.route);
        })
    })
    adminSettings = await getAdminSettings();
    console.log(adminSettings)
    document.body.dataset.bsTheme = (adminSettings.darkmode == 1) ? 'dark' : 'light';
    await dashboardDisplayre(adminSettings.selectedChart);
});

//SIDEBAR

function sidebarvaltoztat() {
    let sidebar = document.getElementById('sidebar');
    let sidebardiv = document.getElementById('sidebardiv');
    let contentdisplay = document.getElementById('contentDisplay');
    let ertek = document.getElementById('toggleSidebar');

    sidebar.classList.toggle('collapsed');
    let mik = document.querySelectorAll('.sidebarElementText');
    if (sidebar.classList.contains('collapsed')) {
        mik.forEach(element => {
            element.classList.add("d-none")
        });
        sidebardiv.classList.replace("col-2", "col-1");
        contentdisplay.classList.replace("col-10", "col-11");
        ertek.value = "⇥";
        ertek.title = "Expand";
    }
    else {
        mik.forEach(element => {
            element.classList.remove("d-none");
        });
        sidebardiv.classList.replace("col-1", "col-2");
        contentdisplay.classList.replace("col-11", "col-10");
        ertek.value = "☰";
        ertek.title = "Collapse";
    }
}

function aktivEltuntet() {
    let aktivok = document.querySelectorAll('.active');
    aktivok.forEach(element => {
        element.classList.remove("active");
    })
}

//HTML DOM

async function melyikValaszt(melyik) {
    let display = document.getElementById('content');
    display.innerHTML = "";
    switch (melyik) {
        case "dashboard":
            await dashboardDisplayre(adminSettings.selectedChart);
            break;
        case "users":
            await usersDisplayre({ modal, objectURL });
            break;
        case "files":
            display.appendChild(await filesDisplayre());
            break;
        case "transactions":
            display.appendChild(await transactionsDisplayre());
            break;
        case "logs":
            await logsDisplayre();
            break;
        case "settings":
            await settingsDisplayre(adminSettings);
            break;
        case "devlog":
            display.appendChild(await devlogDisplayre());
            break;
        case "ttools":
            display.appendChild(await testToolsDisplayre());
            break;
        case "fflags":
            display.appendChild(await featureFlagsDisplayre());
            break;
    }
}

async function filesDisplayre() {
    let h1 = document.createElement('h1');
    h1.classList.add("h2", "m-5", "text-center");
    h1.innerText = "404 Egyenlőre nincs itt semmi... de itt lenne a files";
    return h1;
}

async function transactionsDisplayre() {
    let h1 = document.createElement('h1');
    h1.classList.add("h2", "m-5", "text-center");
    h1.innerText = "404 Egyenlőre nincs itt semmi... de itt lenne a tranzakciok";
    return h1;
}

async function devlogDisplayre() {
    let h1 = document.createElement('h1');
    h1.classList.add("h2", "m-5", "text-center");
    h1.innerText = "404 Egyenlőre nincs itt semmi... de itt lenne a devlog";
    return h1;
}

async function testToolsDisplayre() {
    let h1 = document.createElement('h1');
    h1.classList.add("h2", "m-5", "text-center");
    h1.innerText = "404 Egyenlőre nincs itt semmi... de itt lenne a testtools";
    return h1;
}

async function featureFlagsDisplayre() {
    let h1 = document.createElement('h1');
    h1.classList.add("h2", "m-5", "text-center");
    h1.innerText = "404 Egyenlőre nincs itt semmi... de itt lenne a featureflags";
    return h1;
}

//VARIABLES

let modalElement;
let modal;
let objectURL;
let adminSettings;