import { dashboardDisplayre } from "./dashboardDisplay.js";
import { usersDisplayre } from "./usersDisplay.js";
import { logsDisplayre } from "./logsDisplay.js";
import { settingsDisplayre } from "./settingsDisplay.js";
import { getAdminSettings, getProfilePicture, nyelvSzinkronizalas, kijelentkezes, getUserData } from "./fetchs.js";

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
    document.querySelectorAll('.signoutBtn').forEach(button => {
        button.addEventListener("click", async function () {
            await kijelentkezes();
            window.location.href = "/main";
        });
    });
    document.querySelectorAll('.backToMainBtn').forEach(button => {
        button.addEventListener("click", function () {
            window.location.href = "/main";
        });
    });
    document.getElementById('toggleSidebar').addEventListener('click', function () {
        sidebarvaltoztat();
    });
    let adminCim = document.querySelectorAll('.adminTitle[data-route]');
    adminCim.forEach(element => {
        element.addEventListener("click", async function () {
            aktivEltuntet();
            document.querySelectorAll('.nav-link[data-route="dashboard"]').forEach(link => {
                link.classList.add("active");
            });
            await melyikValaszt(element.dataset.route);
        });
    });

    let navlinkek = document.querySelectorAll(".nav-link[data-route]");
    navlinkek.forEach(element => {
        element.addEventListener("click", async function () {
            let route = this.dataset.route;
            aktivEltuntet();
            let azonosLinkek = document.querySelectorAll(`.nav-link[data-route="${route}"]`);
            azonosLinkek.forEach(link => {
                link.classList.add("active");
            });
            await melyikValaszt(route);
        });
    });
    adminSettings = await getAdminSettings();
    document.body.dataset.bsTheme = (adminSettings.darkmode == 1) ? 'dark' : 'light';
    userData = await getUserData();
    document.getElementById('dropdownUsername').innerText = userData.username;
    let pfp = document.getElementById('dropdownPfp');
    if (userData.filepath == null) {
        pfp.src = "../images/default.png";
    } else {
        objectURL = await getProfilePicture(userData.filepath);
        pfp.src = objectURL;
        await new Promise(res => pfp.onload = res);
        URL.revokeObjectURL(objectURL);
    }
    await dashboardDisplayre(adminSettings.selectedChart);
});

//SIDEBAR

function sidebarvaltoztat() {
    let sidebar = document.getElementById('sidebar');
    let sidebardiv = document.getElementById('sidebardiv');
    let sidebarHead = document.getElementById('sidebarHead');
    let contentdisplay = document.getElementById('contentDisplay');
    let sidebarToogler = document.getElementById('toggleSidebar');
    let titleImage = document.getElementById('sidebarImage');

    sidebar.classList.toggle('collapsed');
    let mik = document.querySelectorAll('.sidebarElementText');
    if (sidebar.classList.contains('collapsed')) {
        mik.forEach(element => {
            element.classList.add("d-none");
        });
        sidebardiv.classList.replace("col-lg-2", "col-lg-1");
        sidebarHead.classList.replace("flex-xl-row", "flex-xl-column");
        contentdisplay.classList.replace("col-lg-10", "col-lg-11");
        sidebarToogler.value = "⇥";
        sidebarToogler.title = "Expand";
        sidebarToogler.classList.add("mt-2", "w-100", "btn-purple");
        titleImage.src = "../images/logo_o.png";
    }
    else {
        mik.forEach(element => {
            element.classList.remove("d-none");
        });
        sidebardiv.classList.replace("col-lg-1", "col-lg-2");
        sidebarHead.classList.replace("flex-xl-column", "flex-xl-row");
        contentdisplay.classList.replace("col-lg-11", "col-lg-10");
        sidebarToogler.value = "☰";
        sidebarToogler.title = "Collapse";
        sidebarToogler.classList.remove("mt-2", "w-100", "btn-purple");
        titleImage.src = "../images/lokea.png";
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
            await usersDisplayre({ modal, objectURL, myRole: userData.role, myUsername: userData.username });
            break;
        case "logs":
            await logsDisplayre();
            break;
        case "settings":
            await settingsDisplayre(adminSettings);
            break;
    }
}


//VARIABLES

let modalElement;
let modal;
let objectURL;
let adminSettings;
let userData;