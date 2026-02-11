document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('signoutBtn').addEventListener("click", async function () {
        kijelentkezes();
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
});

async function kijelentkezes() {
    try {
        let response = await fetch("/api/signout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let data = await response.json();
        if (data.success) {
            window.location.href = '/login_page';
        }
        else {
            console.log("baj a kijelentkezésben, baj: " + data.error);
        }

    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

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

async function melyikValaszt(melyik) {
    let display = document.getElementById('content');
    display.innerHTML = "";
    switch (melyik) {
        case "dashboard":
            display.appendChild(dashboardDisplayre());
            break;
        case "users":
            display.appendChild(await usersDisplayre());
            break;
        case "files":
            display.appendChild(await filesDisplayre());
            break;
        case "transactions":
            display.appendChild(await transactionsDisplayre());
            break;
        case "logs":
            display.appendChild(await logsDisplayre());
            break;
        case "settings":
            display.appendChild(await settingsDisplayre());
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

function dashboardDisplayre() {
    let h1 = document.createElement('h1');
    h1.classList.add("h2", "m-5", "text-center");
    h1.innerText = "404 Egyenlőre nincs itt semmi... tenyleg nincs";
    return h1;
}

async function usersDisplayre() {
    let row = document.createElement('div');
    row.classList.add("row", "p-3");

    //kereso
    let col9div = document.createElement('div');
    col9div.classList.add("col-9");

    let fejlec = document.createElement('div');
    fejlec.classList.add("d-flex", "justify-content-between");

    let cim = document.createElement('h2');
    cim.innerText = "Users";
    cim.classList.add("h2");

    let keresodiv = document.createElement('div');
    keresodiv.classList.add("mb-3");

    let inputgroupdiv = document.createElement('div');
    inputgroupdiv.classList.add("input-group");

    let keresoInput = document.createElement('input');
    keresoInput.type = "text";
    keresoInput.id = 'keresoInput';
    keresoInput.classList.add("form-control");
    keresoInput.placeholder = "Keresés...";
    keresoInput.addEventListener("input", async function () {
        tablazatGeneral(await sortedUser(), tablazat);
    })

    let keresoSelect = document.createElement('select');
    keresoSelect.classList.add("form-select");
    keresoSelect.id = 'keresoSelect';
    keresoSelect.addEventListener("change", async function () {
        tablazatGeneral(await sortedUser(), tablazat);
    })

    let option = document.createElement('option');
    option.value = 'user_id';
    option.selected = true;
    option.innerText = 'ID';
    keresoSelect.appendChild(option);

    option = document.createElement('option');
    option.value = 'username';
    option.innerText = 'Username';
    keresoSelect.appendChild(option);

    option = document.createElement('option');
    option.value = 'email';
    option.innerText = 'E-mail';
    keresoSelect.appendChild(option);

    inputgroupdiv.appendChild(keresoInput);
    inputgroupdiv.appendChild(keresoSelect);
    keresodiv.append(inputgroupdiv);
    fejlec.appendChild(cim);
    fejlec.appendChild(keresodiv);
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

    let statusDiv = document.createElement('div');
    let statusDivCim = document.createElement('h6');
    statusDivCim.classList.add("h6");
    statusDivCim.innerText = "User status";
    let statuszok = ["Any", "Active", "Deleted"];
    for (let i = 0; i < statuszok.length; i++) {
        let formcheck = document.createElement('div');
        formcheck.classList.add("form-check");
        let radioButton = document.createElement('input');
        radioButton.type = "radio"
        radioButton.classList.add("form-check-input");
        radioButton.id = `status${statuszok[i]}`;
        radioButton.name = "sort1";
        if (i === 0) {
            radioButton.checked = true;
        }
        radioButton.addEventListener("change", async function () {
            tablazatGeneral(await sortedUser(), tablazat);
        })
        let label = document.createElement('label');
        label.setAttribute("for", `status${statuszok[i]}`);
        label.classList.add("form-check-label");
        label.innerText = statuszok[i];
        formcheck.appendChild(radioButton);
        formcheck.appendChild(label);
        statusDiv.appendChild(formcheck);
    }
    szuresDiv.appendChild(statusDivCim);
    szuresDiv.appendChild(statusDiv);

    let roleDiv = document.createElement('div');
    let roleDivCim = document.createElement('h6');
    roleDivCim.classList.add("h6");
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
        checkbox.addEventListener("change", async function () {
            tablazatGeneral(await sortedUser(), tablazat);
        })
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

    kartya.appendChild(kiscim);
    kartya.appendChild(szuresDiv);
    col3div.appendChild(kartya);

    //tablazat
    let tablazat = document.createElement('div');
    tablazat.id = "usersTableDiv";
    col9div.appendChild(tablazat);
    tablazatGeneral(await osszesUser(), tablazat);

    row.appendChild(col9div);
    row.appendChild(col3div);

    return row;
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

async function logsDisplayre() {
    let h1 = document.createElement('h1');
    h1.classList.add("h2", "m-5", "text-center");
    h1.innerText = "404 Egyenlőre nincs itt semmi... de itt lenne a logs";
    return h1;
}

async function settingsDisplayre() {
    let h1 = document.createElement('h1');
    h1.classList.add("h2", "m-5", "text-center");
    h1.innerText = "404 Egyenlőre nincs itt semmi... de itt lenne a settings";
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

async function osszesUser() {
    let response = await fetch("/api/admin/users");
    let data = await response.json();
    return data;
}

async function getUser(id) {
    let response = await fetch(`/api/admin/user?id=${id}`);
    let data = await response.json();
    return data;
}

async function sortedUser() {
    let kereso = document.getElementById('keresoInput').value;
    let selectOption = document.getElementById('keresoSelect').value;
    let selectedStatus = document.querySelector('input[name="sort1"]:checked').id;
    let selectedRoles = Array.from(
        document.querySelectorAll('input[name="sort2"]:checked')
    ).map(cb => cb.id);
    let response = await fetch("/api/admin/sortedUsers", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mireKeresek: selectOption,
            mit: kereso,
            status: selectedStatus,
            adminChecked: selectedRoles.includes("roleAdmin"),
            modChecked: selectedRoles.includes("roleModerator"),
            userChecked: selectedRoles.includes("roleUser")
        })
    });
    let data = await response.json();
    return data;
}

async function userToInactive(id) {
    let response = await fetch("/api/admin/userToInactive", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: id
        })
    });
    let mitadokvissza;
    if (response.status == 204) {
        mitadokvissza = "Sikerült a törlés";
        let tablazat = document.getElementById('usersTableDiv');
        tablazatGeneral(await sortedUser(), tablazat);
    }
    else {
        mitadokvissza = (await response.json()).message;
    }
    return mitadokvissza;
}

function tablazatGeneral(data, kontener) {
    kontener.innerHTML = "";
    let tablazat = document.createElement('table');
    tablazat.id = 'usersTable';
    tablazat.classList.add("table", "table-striped", "table-hover");

    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    let oszlopfok = ["Active", "ID", "Username", "E-mail", "Role", "Actions"];

    for (let i = 0; i < oszlopfok.length; i++) {
        let th = document.createElement("th");
        th.innerText = oszlopfok[i];
        tr.appendChild(th);
    }
    thead.appendChild(tr);

    let tbody = document.createElement('tbody');
    tbody.classList.add("table-group-divider");
    let adatok = data.users;
    for (let i = 0; i < adatok.length; i++) {
        let tr = document.createElement('tr');
        let ertekek = Object.values(adatok[i]);
        for (let j = 0; j < ertekek.length; j++) {
            let td = document.createElement('td');
            if (j == 0) {
                let circle = document.createElement('span');
                circle.style.display = "inline-block";
                circle.style.width = "12px";
                circle.style.height = "12px";
                circle.style.borderRadius = "50%";
                circle.style.backgroundColor = ertekek[j] === null ? "green" : "red";
                td.appendChild(circle);
            } else {
                td.innerText = ertekek[j];
            }
            tr.appendChild(td);
        }
        let td = document.createElement('td');
        let modositoGombokDiv = document.createElement('div');
        modositoGombokDiv.classList.add("d-flex", "justify-content-evenly");
        let editGomb = document.createElement('input');
        editGomb.type = 'button';
        editGomb.value = 'Szerkesztés';
        editGomb.classList.add("btn", "btn-info");
        editGomb.addEventListener("click", async function () {
            currentData = await getUser(adatok[i].user_id);
            modalView("Felhasználó módosítása", "edit", editUsersToModal(currentData.users[0]));
            let modalElement = document.getElementById('modalView');
            let modal = new bootstrap.Modal(modalElement);
            modal.show();
        })
        let torloGomb = document.createElement('input');
        torloGomb.type = 'button';
        torloGomb.value = 'Törlés';
        torloGomb.classList.add("btn", "btn-danger");
        torloGomb.addEventListener("click", async function () {
            alert(await userToInactive(adatok[i].user_id));
        });
        modositoGombokDiv.appendChild(editGomb);
        modositoGombokDiv.appendChild(torloGomb);
        td.appendChild(modositoGombokDiv);
        tr.appendChild(td);
        tbody.appendChild(tr);
    }

    tablazat.appendChild(thead);
    tablazat.appendChild(tbody);

    kontener.appendChild(tablazat);
}

function modalView(title, type, content) {
    document.getElementById('modalTitle').innerText = title;
    let modalSize = document.getElementById('modalSize');
    modalSize.className = "";
    let footertext = document.getElementById('footerText');
    footertext.innerHTML = "";
    footertext.className = "";
    let footerButtons = document.getElementById('footerButtons');
    footerButtons.innerHTML = "";
    let button;
    switch (type) {
        case "edit":
            modalSize.classList.add("modal-dialog", "modal-xl");

            footertext.innerHTML = "Kilépés után a változtatásokat nem lehet visszavonni!";
            footertext.classList.add("text-danger");

            button = document.createElement('button');
            button.type = 'reset';
            button.innerText = "Változtatások visszavonása";
            button.classList.add("btn", "btn-danger");
            button.form = 'editUserForm';
            footerButtons.appendChild(button);

            button = document.createElement('button');
            button.innerText = "Mentés";
            button.classList.add("btn", "btn-primary");
            button.addEventListener('submit', async function () {

            })
            footerButtons.appendChild(button);

            break;
        case "information":
            modalSize.classList.add("modal-dialog", "modal-sm");

            button = document.createElement('button');
            button.type = 'button';
            button.innerText = "OK";
            button.classList.add("btn", "btn-primary");
            footerButtons.appendChild(button);
            break;
    }

    let hova = document.getElementById('modalContent');
    hova.innerHTML = "";
    hova.appendChild(content);
}

function editUsersToModal(data) {
    console.log(data);
    let user_id = data.user_id;
    let username = data.username;
    let email = data.email;
    let role = data.role;
    let is_2fa = data.is_2fa;
    let container = document.createElement("div");
    container.classList.add("container-fluid");

    let row = document.createElement("div");
    row.classList.add("row");

    /* BAL OLDAL */
    let colLeft = document.createElement("div");
    colLeft.classList.add("col-4");

    let pfp = document.createElement("img");
    // pfp.src = "default.png";
    pfp.alt = "Profile picture";
    pfp.title = "Profile picture";
    pfp.classList.add("img-fluid", "img-thumbnail", "rounded-circle", "h-75"
    );

    let pfpTitle = document.createElement("h6");
    pfpTitle.textContent = username;

    colLeft.appendChild(pfp);
    colLeft.appendChild(pfpTitle);

    /* JOBB OLDAL */
    let colRight = document.createElement("div");
    colRight.classList.add("col-8");

    let form = document.createElement("form");
    form.id = 'editUserForm';

    let formGroup = document.createElement("div");
    formGroup.classList.add("form-group");

    /* INPUTOK */
    let idDiv = document.createElement("div");
    let idP = document.createElement("p");
    idP.textContent = "ID";
    let idInput = document.createElement("input");
    idInput.type = "number";
    idInput.id = "editIdInput";
    idInput.disabled = true;
    idInput.value = user_id;
    idInput.classList.add("form-control");

    idDiv.appendChild(idP);
    idDiv.appendChild(idInput);

    let userDiv = document.createElement("div");
    let userP = document.createElement("p");
    userP.textContent = "Username";
    let userInput = document.createElement("input");
    userInput.type = "text";
    userInput.id = "editUsernameInput";
    userInput.value = username;
    userInput.classList.add("form-control");

    userDiv.appendChild(userP);
    userDiv.appendChild(userInput);

    let emailDiv = document.createElement("div");
    let emailP = document.createElement("p");
    emailP.textContent = "E-mail address";
    let emailInput = document.createElement("input");
    emailInput.type = "text";
    emailInput.id = "editEmailInput";
    emailInput.value = email;
    emailInput.classList.add("form-control");

    emailDiv.appendChild(emailP);
    emailDiv.appendChild(emailInput);

    let roleDiv = document.createElement("div");
    let roleP = document.createElement("p");
    roleP.textContent = "Roles:";
    let select = document.createElement("select");
    select.classList.add("form-select");
    let opt1 = document.createElement("option");
    opt1.value = "1";
    opt1.textContent = "User";
    let opt2 = document.createElement("option");
    opt2.value = "2";
    opt2.textContent = "Moderator";
    let opt3 = document.createElement("option");
    opt3.value = "3";
    opt3.textContent = "Admin";
    opt3.disabled = true;
    switch (role) {
        case "ADMIN":
            opt3.selected = true;
            opt2.disabled = true;
            opt1.disabled = true;
            break;
        case "MOD":
            opt2.selected = true;
            break;
        case "user":
            opt1.selected = true;
    }

    select.appendChild(opt1);
    select.appendChild(opt2);
    select.appendChild(opt3);
    roleDiv.appendChild(roleP);
    roleDiv.appendChild(select);

    let switchDiv = document.createElement("div");
    switchDiv.classList.add("form-check", "form-switch", "mt-3");
    let switchInput = document.createElement("input");
    switchInput.type = "checkbox";
    switchInput.role = "switch";
    switchInput.id = "edit2faInput";
    if (is_2fa) {
        switchInput.checked = true;
    }
    switchInput.classList.add("form-check-input");
    let switchLabel = document.createElement("label");
    switchLabel.htmlFor = "edit2faInput";
    switchLabel.textContent = "Two-factor authentication";
    switchLabel.classList.add("form-check-label");

    switchDiv.appendChild(switchInput);
    switchDiv.appendChild(switchLabel);

    /* ÖSSZEÉPITÉS */
    formGroup.appendChild(idDiv);
    formGroup.appendChild(userDiv);
    formGroup.appendChild(emailDiv);
    formGroup.appendChild(roleDiv);
    formGroup.appendChild(switchDiv);

    form.appendChild(formGroup);
    colRight.appendChild(form);

    row.appendChild(colLeft);
    row.appendChild(colRight);
    container.appendChild(row);

    return container;
}

function infoToModal(text) {
    let content = document.createElement('p');
    content.classList.add('text-center');
    content.innerText = text;

    return text;
}

let currentData = {};






