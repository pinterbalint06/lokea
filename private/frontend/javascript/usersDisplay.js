import { osszesUser, getUser, sortedUser, getProfilePicture, newUser, userUpdate, userToInactive, uploadProfilePic, deleteProfilePicture } from "./fetchs.js";
import { gombGeneral, inputGeneral} from "./utils/domUtils.js";

export async function usersDisplayre(variables) {
    let display = document.getElementById('content');
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

    let newUserGomb = gombGeneral("button", "Create new user", "user-plus", "green", null);
    newUserGomb.addEventListener("click", async function () {
        modalView("Új felhasználó létrehozása", "new", newUserToModal(), variables);

        variables.modal.show();
    });

    let keresodiv = document.createElement('div');
    keresodiv.classList.add("mb-3");

    let inputgroupdiv = document.createElement('div');
    inputgroupdiv.classList.add("input-group");

    let keresoInput = inputGeneral("text", "Keresés...", null, "keresoInput", ["form-control"], false);
    keresoInput.addEventListener("input", async function () {
        let tablePlace = document.getElementById('usersTableDiv');
        tablePlace.innerHTML = "";
        tablePlace.appendChild(tablazatGeneral(await sortedUser(), variables));
    })

    let keresoSelect = document.createElement('select');
    keresoSelect.classList.add("form-select");
    keresoSelect.id = 'keresoSelect';
    keresoSelect.addEventListener("change", async function () {
        let tablePlace = document.getElementById('usersTableDiv');
        tablePlace.innerHTML = "";
        tablePlace.appendChild(tablazatGeneral(await sortedUser(), variables));
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
    fejlec.appendChild(newUserGomb);
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
            let tablePlace = document.getElementById('usersTableDiv');
            tablePlace.innerHTML = "";
            tablePlace.appendChild(tablazatGeneral(await sortedUser(), variables));
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
            let tablePlace = document.getElementById('usersTableDiv');
            tablePlace.innerHTML = "";
            tablePlace.appendChild(tablazatGeneral(await sortedUser(), variables));
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
    tablazat.appendChild(tablazatGeneral(await osszesUser(), variables));
    col9div.appendChild(tablazat);

    row.appendChild(col9div);
    row.appendChild(col3div);

    display.appendChild(row);
}

function newUserToModal() {
    let form = document.createElement('form');
    form.id = 'newUserFrom';

    let formGroup = document.createElement("div");
    formGroup.classList.add("form-group");

    let userDiv = document.createElement("div");
    let userP = document.createElement("p");
    userP.textContent = "Username";
    let userInput = inputGeneral("text", "Username here...", null, "newUsernameInput", ["form-control"], false);

    userDiv.appendChild(userP);
    userDiv.appendChild(userInput);

    let emailDiv = document.createElement("div");
    let emailP = document.createElement("p");
    emailP.textContent = "E-mail address";
    let emailInput = inputGeneral("text", "E-mail address here...", null, "newEmailInput", ["form-control"], false);

    emailDiv.appendChild(emailP);
    emailDiv.appendChild(emailInput);

    let passDiv = document.createElement("div");
    let passP = document.createElement("p");
    passP.textContent = "Password";
    let passInput = inputGeneral("password", "Password here...", null, "newPasswordInput", ["form-control"], false);

    passDiv.appendChild(passP);
    passDiv.appendChild(passInput);

    let roleDiv = document.createElement("div");
    let roleP = document.createElement("p");
    roleP.textContent = "Roles:";
    let select = document.createElement("select");
    select.classList.add("form-select");
    select.id = 'newRoleSelect';
    let opt1 = document.createElement("option");
    opt1.value = "user";
    opt1.textContent = "User";
    opt1.selected = true;
    let opt2 = document.createElement("option");
    opt2.value = "MOD";
    opt2.textContent = "Moderator";
    let opt3 = document.createElement("option");
    opt3.value = "ADMIN";
    opt3.textContent = "Admin";
    opt3.disabled = true;

    select.appendChild(opt1);
    select.appendChild(opt2);
    select.appendChild(opt3);
    roleDiv.appendChild(roleP);
    roleDiv.appendChild(select);

    let switchDiv = document.createElement("div");
    switchDiv.classList.add("form-check", "form-switch", "mt-3");
    let switchInput = inputGeneral("checkbox", null, null, "new2faInput", ["form-check-input"], false);
    switchInput.role = "switch";

    let switchLabel = document.createElement("label");
    switchLabel.setAttribute("for", "new2faInput");
    switchLabel.textContent = "Two-factor authentication";
    switchLabel.classList.add("form-check-label");

    switchDiv.appendChild(switchInput);
    switchDiv.appendChild(switchLabel);

    formGroup.appendChild(userDiv);
    formGroup.appendChild(emailDiv);
    formGroup.appendChild(passDiv);
    formGroup.appendChild(roleDiv);
    formGroup.appendChild(switchDiv);

    form.appendChild(formGroup);

    return form;
}

async function editUserToModal(data, variables) {
    let user_id = data.user_id;
    let username = data.username;
    let email = data.email;
    let role = data.role;
    let is_2fa = data.is_2fa;
    let pfproute = data.filepath;
    let container = document.createElement("div");
    container.classList.add("container-fluid");

    let row = document.createElement("div");
    row.classList.add("row");

    /* BAL OLDAL */
    let colLeft = document.createElement("div");
    colLeft.classList.add("col-4");

    let pfp = document.createElement("img");
    let deletePfpButton;
    if (pfproute == null) {
        pfp.src = "../images/default.png";
    }
    else {
        variables.objectURL = await getProfilePicture(pfproute);
        pfp.src = variables.objectURL;
        deletePfpButton = gombGeneral("button", "Profilkép törlése", "trash-2", "red", null);
        deletePfpButton.addEventListener("click", async function () {
            await deleteProfilePicture(user_id);
        })
    }
    pfp.alt = "Profile picture";
    pfp.title = "Profile picture";
    pfp.classList.add("img-fluid", "img-thumbnail", "rounded-circle", "h-75"
    );

    let newPfpInput = inputGeneral("file", null, null, "newPfpInput", ["form-control"], false);
    newPfpInput.setAttribute("accept", "image/*");
    let newPfpButton = gombGeneral("button", "Profilkép feltöltése", "upload", "green", null);
    newPfpButton.addEventListener("click", async function () {
        let feltoltott = document.getElementById('newPfpInput');
        if (feltoltott.files.length === 0) {
            alert("Kérlek, válassz ki egy képet!");
        }
        else {
            await uploadProfilePic(feltoltott.files[0], user_id);
        }
    })

    let pfpTitle = document.createElement("h6");
    pfpTitle.textContent = username;

    colLeft.appendChild(pfp);
    colLeft.appendChild(newPfpInput);
    colLeft.appendChild(newPfpButton);
    if (pfproute != null) {
        colLeft.appendChild(deletePfpButton);
    }
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
    let idInput = inputGeneral("number", null, user_id, "editIdInput", ["form-control"], true);

    idDiv.appendChild(idP);
    idDiv.appendChild(idInput);

    let userDiv = document.createElement("div");
    let userP = document.createElement("p");
    userP.textContent = "Username";
    let userInput = inputGeneral("text", null, username, "editUsernameInput", ["form-control"], false);

    userDiv.appendChild(userP);
    userDiv.appendChild(userInput);

    let emailDiv = document.createElement("div");
    let emailP = document.createElement("p");
    emailP.textContent = "E-mail address";
    let emailInput = inputGeneral("text", null, email, "editEmailInput", ["form-control"], false);

    emailDiv.appendChild(emailP);
    emailDiv.appendChild(emailInput);

    let roleDiv = document.createElement("div");
    let roleP = document.createElement("p");
    roleP.textContent = "Roles:";
    let select = document.createElement("select");
    select.classList.add("form-select");
    select.id = 'editRoleSelect';
    let opt1 = document.createElement("option");
    opt1.value = "user";
    opt1.textContent = "User";
    let opt2 = document.createElement("option");
    opt2.value = "MOD";
    opt2.textContent = "Moderator";
    let opt3 = document.createElement("option");
    opt3.value = "ADMIN";
    opt3.textContent = "Admin";
    opt3.disabled = true;
    switch (role) {
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
    let switchInput = inputGeneral("checkbox", null, null, "edit2faInput", ["form-check-input"], false);
    switchInput.role = "switch";
    if (is_2fa) {
        switchInput.checked = true;
    }

    let switchLabel = document.createElement("label");
    switchLabel.setAttribute("for", "edit2faInput");
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

async function viewUserToModal(data, variables) {
    console.log(data);
    let user_id = data.user_id;
    let username = data.username;
    let email = data.email;
    let role = data.role;
    let is_2fa = data.is_2fa;
    let pfproute = data.filepath;
    let container = document.createElement("div");
    container.classList.add("container-fluid");

    let row = document.createElement("div");
    row.classList.add("row");

    /* BAL OLDAL */
    let colLeft = document.createElement("div");
    colLeft.classList.add("col-4");

    let pfp = document.createElement("img");
    if (pfproute == null) {
        pfp.src = "../images/default.png";
    }
    else {
        variables.objectURL = await getProfilePicture(pfproute);
        pfp.src = variables.objectURL;
    }
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
    let idInput = inputGeneral("number", null, user_id, "editIdInput", ["form-control"], true);

    idDiv.appendChild(idP);
    idDiv.appendChild(idInput);

    let userDiv = document.createElement("div");
    let userP = document.createElement("p");
    userP.textContent = "Username";
    let userInput = inputGeneral("text", null, username, "editUsernameInput", ["form-control"], true);

    userDiv.appendChild(userP);
    userDiv.appendChild(userInput);

    let emailDiv = document.createElement("div");
    let emailP = document.createElement("p");
    emailP.textContent = "E-mail address";
    let emailInput = inputGeneral("text", null, email, "editEmailInput", ["form-control"], true);
    emailInput.type = "text";
    emailInput.id = "editEmailInput";
    emailInput.value = email;
    emailInput.classList.add("form-control");
    emailInput.disabled = true;

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
    opt1.disabled = true;
    let opt2 = document.createElement("option");
    opt2.value = "2";
    opt2.textContent = "Moderator";
    opt2.disabled = true;
    let opt3 = document.createElement("option");
    opt3.value = "3";
    opt3.textContent = "Admin";
    opt3.disabled = true;
    switch (role) {
        case "ADMIN":
            opt3.selected = true;
            break;
        case "MOD":
            opt2.selected = true;
            break;
        case "user":
            opt1.selected = true;
            break;
    }

    select.appendChild(opt1);
    select.appendChild(opt2);
    select.appendChild(opt3);
    roleDiv.appendChild(roleP);
    roleDiv.appendChild(select);

    let switchDiv = document.createElement("div");
    switchDiv.classList.add("form-check", "form-switch", "mt-3");
    let switchInput = inputGeneral("checkbox", null, null, "edit2faInput", ["form-check-input"], false);
    switchInput.type = "checkbox";
    switchInput.role = "switch";
    switchInput.id = "edit2faInput";
    if (is_2fa) {
        switchInput.checked = true;
    }
    switchInput.classList.add("form-check-input");
    switchInput.disabled = true;

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

function tablazatGeneral(data, variables) {
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
    console.log(adatok);
    for (let i = 0; i < adatok.length; i++) {
        let tr = document.createElement('tr');
        let ertekek = Object.values(adatok[i]);
        if (ertekek.length > 0) {
            let td = document.createElement('td');
            let circle = document.createElement('span');
            circle.style.display = "inline-block";
            circle.style.width = "12px";
            circle.style.height = "12px";
            circle.style.borderRadius = "50%";
            circle.style.backgroundColor = ertekek[0] === null ? "green" : "red";
            td.appendChild(circle);
            tr.appendChild(td);
        }
        for (let j = 1; j < ertekek.length; j++) {
            let td = document.createElement('td');
            td.innerText = ertekek[j];
            tr.appendChild(td);
        }

        let td = document.createElement('td');
        let modositoGombokDiv = document.createElement('div');
        modositoGombokDiv.classList.add("d-flex", "justify-content-evenly");
        let editGomb, torloGomb;
        if (adatok[i].role != "ADMIN" && adatok[i].deleted_at == null) {
            editGomb = gombGeneral("button", "Szerkesztés", "edit", "blue", null);
            editGomb.addEventListener("click", async function () {
                currentData = await getUser(adatok[i].user_id);
                modalView("Felhasználó módosítása", "edit", await editUserToModal(currentData, variables), variables);
                variables.modal.show();
            })

            torloGomb = gombGeneral("button", "Törlés", "trash-2", "red", null);
            torloGomb.addEventListener("click", async function () {
                alert(await userToInactive(adatok[i].user_id, adatok[i].role, adatok[i].deleted_at == null));
                let tablePlace = document.getElementById('usersTable');
                tablePlace.innerHTML = "";
                tablePlace.appendChild(tablazatGeneral(await sortedUser(), variables));
            });

        }
        else {
            editGomb = gombGeneral("button", "Megtekintés", "eye", "blue", null);
            editGomb.addEventListener("click", async function () {
                currentData = await getUser(adatok[i].user_id);
                modalView("Felhasználó megtekintése", "view", await viewUserToModal(currentData, variables), variables);
                variables.modal.show();
            })
        }

        modositoGombokDiv.appendChild(editGomb);
        if (torloGomb) {
            modositoGombokDiv.appendChild(torloGomb);
        }

        td.appendChild(modositoGombokDiv);
        tr.appendChild(td);

        tbody.appendChild(tr);
    }

    tablazat.appendChild(thead);
    tablazat.appendChild(tbody);

    return tablazat;
}

function modalView(title, type, content, variables) {
    document.getElementById('modalTitle').innerText = title;
    let modalSize = document.getElementById('modalSize');
    modalSize.className = "";
    let footertext = document.getElementById('footerText');
    footertext.innerHTML = "";
    footertext.className = "";
    let footerButtons = document.getElementById('footerButtons');
    footerButtons.innerHTML = "";
    let tablePlace = document.getElementById('usersTableDiv');
    let button;
    switch (type) {
        case "new":
            modalSize.classList.add("modal-dialog", "modal-md");

            footertext.innerHTML = "Minden mezőbe kell valamit irni!";
            footertext.classList.add("text-danger");

            button = gombGeneral("button", "Létrehozás", "user-check", "blue", null);
            button.addEventListener('click', async function () {
                let ures = false;
                let inInput = {
                    username: document.getElementById("newUsernameInput").value,
                    email: document.getElementById("newEmailInput").value,
                    password: document.getElementById("newPasswordInput").value,
                    role: document.getElementById("newRoleSelect").value,
                    is_2fa: document.getElementById("new2faInput").checked
                }
                Object.keys(inInput).forEach(key => {
                    if (inInput[key] == "") {
                        alert('baj')
                    }
                });
                if (!ures) {
                    await newUser(inInput.username, inInput.email, inInput.password, inInput.role, inInput.is_2fa);
                    tablePlace.innerHTML = "";
                    tablePlace.appendChild(tablazatGeneral(await sortedUser(), variables));
                }
                variables.modal.hide();
            })
            footerButtons.appendChild(button);
            break;
        case "edit":
            modalSize.classList.add("modal-dialog", "modal-xl");

            footertext.innerHTML = "Kilépés után a változtatásokat nem lehet visszavonni!";
            footertext.classList.add("text-danger");

            button = gombGeneral("button", "Változtatások visszavonása", "refresh-ccw", "red", null);
            button.addEventListener("click", function () {
                document.getElementById("editUsernameInput").value = currentData.username;
                document.getElementById("editEmailInput").value = currentData.email;
                document.getElementById("editRoleSelect").value = currentData.role;
                document.getElementById("edit2faInput").checked = currentData.is_2fa;
            })
            footerButtons.appendChild(button);

            button = gombGeneral("button", "Mentés", "save", "blue", null);
            button.addEventListener('click', async function () {
                let valtozas = false;
                let inInput = {
                    username: document.getElementById("editUsernameInput").value,
                    email: document.getElementById("editEmailInput").value,
                    role: document.getElementById("editRoleSelect").value,
                    is_2fa: document.getElementById("edit2faInput").checked,
                }
                console.log(inInput);
                Object.keys(inInput).forEach(key => {
                    if (inInput[key] == currentData[key]) {
                        console.log(inInput[key], currentData[key])
                    }
                    else {
                        valtozas = true;
                    }
                });
                if (valtozas) {
                    let siker = await userUpdate(currentData.user_id, inInput.username, inInput.email, inInput.role, inInput.is_2fa);
                    if (siker) {
                        tablePlace.innerHTML = "";
                        tablePlace.appendChild(tablazatGeneral(await sortedUser(), variables));
                    }
                }
                variables.modal.hide();
            })
            footerButtons.appendChild(button);
            break;
        case "view":
            modalSize.classList.add("modal-dialog", "modal-xl");

            button = gombGeneral("button", "Kilépés", null, "blue", null);
            button.addEventListener("click", function () {
                variables.modal.hide();
            })
            footerButtons.appendChild(button);
            break;
        case "information":
            modalSize.classList.add("modal-dialog", "modal-sm");

            button = gombGeneral("button", "OK", null, "blue", null);
            footerButtons.appendChild(button);
            break;
    }

    let hova = document.getElementById('modalContent');
    hova.innerHTML = "";
    hova.appendChild(content);
}

function infoToModal(text) {
    let content = document.createElement('p');
    content.classList.add('text-center');
    content.innerText = text;

    return content;
}

let currentData = {};