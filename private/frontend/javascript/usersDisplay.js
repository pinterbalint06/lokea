import { osszesUser, getUser, sortedUser, getProfilePicture, newUser, userUpdate, userToInactive, exportUsers, uploadProfilePic, deleteProfilePicture } from "./fetchs.js";
import { createHTMLelement, gombGeneral, inputGeneral, labelGeneral, lapozasGeneral, createPreview, showAlert } from "./utils/domUtils.js";
import i18next from "./utils/i18next.js";

export async function usersDisplayre(variables) {
    currentPage.page = 1;
    let display = document.getElementById('content');
    display.innerHTML = "";

    let row = createHTMLelement('div', ["row", "p-3", "g-4"]);

    let fejlecDiv = createHTMLelement('div', ["d-flex", "justify-content-between", "align-items-center"]);
    let cim = createHTMLelement('h2', ["h2", "mb-0"], i18next.t('admin:users.title'));
    let newUserGomb = gombGeneral("button", i18next.t('admin:users.create_new'), "user-plus", "green", null);
    newUserGomb.addEventListener("click", async function () {
        modalView(i18next.t('admin:users.create_new'), "new", newUserToModal(), variables);
        variables.modal.show();
    });
    fejlecDiv.appendChild(cim);
    fejlecDiv.appendChild(newUserGomb);

    //szures
    let szuresCol = createHTMLelement('div', []);
    let kartya = createHTMLelement('div', ["card", "bg-light", "p-3", "shadow-sm"]);
    let kiscim = createHTMLelement('h4', ["h4"], i18next.t('admin:users.sort'));
    let szuresDiv = createHTMLelement('div', ['mb-3']);

    //kereso
    let keresodiv = createHTMLelement('div', ["my-3"]);
    let inputgroupdiv = createHTMLelement('div', ["input-group"]);
    let keresoInput = inputGeneral("text", i18next.t('admin:users.search_placeholder'), null, "keresoInput", ["form-control"], false);
    keresoInput.addEventListener("input", async function () {
        currentPage.page = 1;
        let data = await sortedUser(getFilterValues());
        frissitUserTablazat(data.users, data.total, variables);
    });

    let keresoSelect = document.createElement('select');
    keresoSelect.classList.add("form-select");
    keresoSelect.id = 'keresoSelect';
    keresoSelect.addEventListener("change", async function () {
        currentPage.page = 1;
        let data = await sortedUser(getFilterValues());
        frissitUserTablazat(data.users, data.total, variables);
    });

    let options = [
        { value: 'user_id', text: 'ID' },
        { value: 'username', text: 'Username' },
        { value: 'email', text: 'E-mail' }
    ];
    options.forEach(opt => {
        let o = document.createElement('option');
        o.value = opt.value;
        o.innerText = opt.text;
        if (opt.value === 'user_id') o.selected = true;
        keresoSelect.appendChild(o);
    });

    inputgroupdiv.appendChild(keresoInput);
    inputgroupdiv.appendChild(keresoSelect);
    keresodiv.append(inputgroupdiv);
    szuresDiv.appendChild(keresodiv);

    let statusDiv = document.createElement('div');
    let statusDivCim = createHTMLelement('h6', ["h6"], i18next.t('admin:users.user_status'));
    let statuszok = [i18next.t('admin:users.any'), i18next.t('admin:users.active'), i18next.t('admin:users.deleted')];
    let statusValues = ['Any', 'Active', 'Deleted'];
    for (let i = 0; i < statuszok.length; i++) {
        let formcheck = createHTMLelement('div', ["form-check"]);
        let radioButton = document.createElement('input');
        radioButton.type = "radio";
        radioButton.classList.add("form-check-input");
        radioButton.id = `status${statusValues[i]}`;
        radioButton.name = "sort1";
        if (i === 0) radioButton.checked = true;
        radioButton.addEventListener("change", async function () {
            currentPage.page = 1;
            let data = await sortedUser(getFilterValues());
            frissitUserTablazat(data.users, data.total, variables);
        });
        let label = labelGeneral(`status${statusValues[i]}`, statuszok[i], ["form-check-label"]);
        formcheck.appendChild(radioButton);
        formcheck.appendChild(label);
        statusDiv.appendChild(formcheck);
    }
    szuresDiv.appendChild(statusDivCim);
    szuresDiv.appendChild(statusDiv);

    let roleDiv = document.createElement('div');
    let roleDivCim = createHTMLelement('h6', ["h6"], i18next.t('admin:users.role'));
    let roleFilters = [
        { id: 'roleAdmin', label: i18next.t('admin:common.admin') },
        { id: 'roleModerator', label: i18next.t('admin:common.moderator') },
        { id: 'roleUser', label: i18next.t('admin:common.user') }
    ];
    for (let roleFilter of roleFilters) {
        let formcheck = createHTMLelement('div', ["form-check"]);
        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.classList.add("form-check-input");
        checkbox.id = roleFilter.id;
        checkbox.name = "sort2";
        checkbox.addEventListener("change", async function () {
            currentPage.page = 1;
            let data = await sortedUser(getFilterValues());
            frissitUserTablazat(data.users, data.total, variables);
        });
        let label = labelGeneral(roleFilter.id, roleFilter.label, ["form-check-label"]);
        formcheck.appendChild(checkbox);
        formcheck.appendChild(label);
        roleDiv.appendChild(formcheck);
    }
    szuresDiv.appendChild(roleDivCim);
    szuresDiv.appendChild(roleDiv);

    let exportGombDiv = createHTMLelement('div', ["mt-3", "border-top", "pt-3"]);
    let exportGomb = gombGeneral("button", i18next.t('admin:users.export_csv'), "file-text", "blue", null, ["w-100"]);
    exportGomb.addEventListener("click", async function () {
        await exportUsers(getFilterValues());
    });
    exportGombDiv.appendChild(exportGomb);
    szuresDiv.appendChild(exportGombDiv);

    kartya.appendChild(kiscim);
    kartya.appendChild(szuresDiv);
    szuresCol.appendChild(kartya);

    //tablazat
    let tablazatCol = createHTMLelement('div', []);
    let tablazatTartalom = createHTMLelement('div', ["table-responsive"], null, "usersTableDiv");
    let data = await osszesUser();
    tablazatTartalom.appendChild(lapozasGeneral(data.total, paginate, currentPage, variables));
    tablazatTartalom.appendChild(tablazatGeneral(data.users, variables));
    tablazatCol.appendChild(tablazatTartalom);

    let balOldal = createHTMLelement('div', ["col-lg-9"]);
    let jobbOldal = createHTMLelement('div', ["col-lg-3"]);

    const mediaQuery = window.matchMedia('(min-width: 992px)');
    const handleLayoutChange = (e) => {
        row.innerHTML = "";
        if (e.matches) {
            balOldal.appendChild(fejlecDiv);
            balOldal.appendChild(tablazatCol);
            jobbOldal.appendChild(szuresCol);

            row.appendChild(balOldal);
            row.appendChild(jobbOldal);

            tablazatCol.className = "mt-3";
            szuresCol.className = "";
        } else {
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
}

function newUserToModal() {
    let form = createHTMLelement('form', [], null, 'newUserFrom');

    let formGroup = createHTMLelement('div', ["form-group"]);

    let userDiv = document.createElement("div");
    let userP = createHTMLelement('p', [], i18next.t('admin:users.username'));
    let userInput = inputGeneral("text", i18next.t('admin:users.username_placeholder'), null, "newUsernameInput", ["form-control"], false);

    userDiv.appendChild(userP);
    userDiv.appendChild(userInput);

    let emailDiv = document.createElement("div");
    let emailP = createHTMLelement('p', [], i18next.t('admin:users.email'));
    let emailInput = inputGeneral("text", i18next.t('admin:users.email_placeholder'), null, "newEmailInput", ["form-control"], false);

    emailDiv.appendChild(emailP);
    emailDiv.appendChild(emailInput);

    let passDiv = document.createElement("div");
    let passP = createHTMLelement('p', [], i18next.t('admin:users.password'));
    let passInput = inputGeneral("password", i18next.t('admin:users.password_placeholder'), null, "newPasswordInput", ["form-control"], false);

    passDiv.appendChild(passP);
    passDiv.appendChild(passInput);

    let roleDiv = document.createElement("div");
    let roleP = createHTMLelement('p', [], i18next.t('admin:users.roles'));
    let select = document.createElement("select");
    select.classList.add("form-select");
    select.id = 'newRoleSelect';
    let opt1 = document.createElement("option");
    opt1.value = "user";
    opt1.textContent = i18next.t('admin:common.user');
    opt1.selected = true;
    let opt2 = document.createElement("option");
    opt2.value = "MOD";
    opt2.textContent = i18next.t('admin:common.moderator');
    let opt3 = document.createElement("option");
    opt3.value = "ADMIN";
    opt3.textContent = i18next.t('admin:common.admin');
    opt3.disabled = true;

    select.appendChild(opt1);
    select.appendChild(opt2);
    select.appendChild(opt3);
    roleDiv.appendChild(roleP);
    roleDiv.appendChild(select);

    formGroup.appendChild(userDiv);
    formGroup.appendChild(emailDiv);
    formGroup.appendChild(passDiv);
    formGroup.appendChild(roleDiv);

    form.appendChild(formGroup);

    return form;
}

async function editUserToModal(data, variables) {
    let user_id = data.user_id;
    let username = data.username;
    let email = data.email;
    let role = data.role;
    let pfproute = data.filepath;

    variables.tempPfp = null;
    variables.deleteLast = false;

    let container = createHTMLelement('div', ["container-fluid"]);
    let row = createHTMLelement('div', ["row"]);

    /* BAL OLDAL */
    let colLeft = createHTMLelement('div', ["col-4"]);

    let dropzone = document.createElement("div");
    dropzone.classList.add("dropzone");
    dropzone.addEventListener("dragover", function (e) {
        e.preventDefault();
    });

    dropzone.addEventListener("drop", async function (e) {
        e.preventDefault();
        let file = e.dataTransfer.files[0];
        if (file) {
            variables.tempPfp = file;
            variables.deleteLast = false;
            let preview = await createPreview(file);
            pfp.src = preview;
        }
    });

    let pfp = document.createElement("img");
    let deletePfpButton;
    if (pfproute == null) {
        pfp.src = "../images/default.png";
    }
    else {
        variables.objectURL = await getProfilePicture(pfproute);
        pfp.src = variables.objectURL;
        deletePfpButton = gombGeneral("button", i18next.t('admin:users.delete_profile_picture'), "trash-2", "red", null);
        deletePfpButton.addEventListener("click", function () {
            pfp.src = "../images/default.png";
            variables.deleteLast = true;
            variables.tempPfp = null;
        })
    }
    pfp.alt = i18next.t('admin:users.profile_picture');
    pfp.title = i18next.t('admin:users.profile_picture');
    pfp.classList.add("img-fluid", "img-thumbnail", "rounded-circle", "h-75");

    let newPfpInput = inputGeneral("file", null, null, "newPfpInput", ["form-control", "d-none"], false);
    newPfpInput.setAttribute("accept", "image/*");
    newPfpInput.addEventListener("change", async function () {
        if (this.files.length != 0) {
            let file = this.files[0];
            variables.tempPfp = file;
            variables.deleteLast = false;
            let preview = await createPreview(file);
            pfp.src = preview;
        }
    });

    let dropzoneText = document.createElement('p');
    dropzoneText.innerText = i18next.t('admin:users.drop_image_text');
    dropzoneText.classList.add("text-center");

    dropzone.appendChild(pfp);
    dropzone.appendChild(newPfpInput);
    dropzone.appendChild(dropzoneText);
    dropzone.addEventListener("click", function () {
        newPfpInput.click();
    });

    colLeft.appendChild(dropzone);
    if (pfproute != null) {
        colLeft.appendChild(deletePfpButton);
    }

    /* JOBB OLDAL */
    let colRight = createHTMLelement('div', ["col-8"]);
    let form = createHTMLelement('form', [], null, 'editUserForm');
    let formGroup = createHTMLelement('div', ["form-group"]);

    /* INPUTOK */
    let idDiv = document.createElement("div");
    let idP = createHTMLelement('p', [], i18next.t('admin:users.btn_id'));
    let idInput = inputGeneral("number", null, user_id, "editIdInput", ["form-control"], true);

    idDiv.appendChild(idP);
    idDiv.appendChild(idInput);

    let userDiv = document.createElement("div");
    let userP = createHTMLelement('p', [], i18next.t('admin:users.username'));
    let userInput = inputGeneral("text", null, username, "editUsernameInput", ["form-control"], false);

    userDiv.appendChild(userP);
    userDiv.appendChild(userInput);

    let emailDiv = document.createElement("div");
    let emailP = createHTMLelement('p', [], i18next.t('admin:users.email'));
    let emailInput = inputGeneral("text", null, email, "editEmailInput", ["form-control"], false);

    emailDiv.appendChild(emailP);
    emailDiv.appendChild(emailInput);

    let roleDiv = document.createElement("div");
    let roleP = createHTMLelement('p', [], i18next.t('admin:users.roles'));
    let select = document.createElement("select");
    select.classList.add("form-select");
    select.id = 'editRoleSelect';
    let opt1 = document.createElement("option");
    opt1.value = "user";
    opt1.textContent = i18next.t('admin:common.user');
    let opt2 = document.createElement("option");
    opt2.value = "MOD";
    opt2.textContent = i18next.t('admin:common.moderator');
    let opt3 = document.createElement("option");
    opt3.value = "ADMIN";
    opt3.textContent = i18next.t('admin:common.admin');
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

    /* ÖSSZEÉPITÉS */
    formGroup.appendChild(idDiv);
    formGroup.appendChild(userDiv);
    formGroup.appendChild(emailDiv);
    formGroup.appendChild(roleDiv);

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
    let pfproute = data.filepath;
    let container = createHTMLelement('div', ["container-fluid"]);

    let row = createHTMLelement('div', ["row"]);

    /* BAL OLDAL */
    let colLeft = createHTMLelement('div', ["col-4"]);

    let pfp = document.createElement("img");
    if (pfproute == null) {
        pfp.src = "../images/default.png";
    }
    else {
        variables.objectURL = await getProfilePicture(pfproute);
        pfp.src = variables.objectURL;
    }
    pfp.alt = i18next.t('admin:users.profile_picture');
    pfp.title = i18next.t('admin:users.profile_picture');
    pfp.classList.add("img-fluid", "img-thumbnail", "rounded-circle", "h-75"
    );

    let pfpTitle = createHTMLelement('h6', [], username);

    colLeft.appendChild(pfp);
    colLeft.appendChild(pfpTitle);

    /* JOBB OLDAL */
    let colRight = createHTMLelement('div', ["col-8"]);
    let form = createHTMLelement('form', [], null, 'editUserForm');
    let formGroup = createHTMLelement('div', ["form-group"]);

    /* INPUTOK */
    let idDiv = document.createElement("div");
    let idP = createHTMLelement('p', [], i18next.t('admin:users.btn_id'));
    let idInput = inputGeneral("number", null, user_id, "editIdInput", ["form-control"], true);

    idDiv.appendChild(idP);
    idDiv.appendChild(idInput);

    let userDiv = document.createElement("div");
    let userP = createHTMLelement('p', [], i18next.t('admin:users.username'));
    let userInput = inputGeneral("text", null, username, "editUsernameInput", ["form-control"], true);

    userDiv.appendChild(userP);
    userDiv.appendChild(userInput);

    let emailDiv = document.createElement("div");
    let emailP = createHTMLelement('p', [], i18next.t('admin:users.email'));
    let emailInput = inputGeneral("text", null, email, "editEmailInput", ["form-control"], true);

    emailDiv.appendChild(emailP);
    emailDiv.appendChild(emailInput);

    let roleDiv = document.createElement("div");
    let roleP = createHTMLelement('p', [], i18next.t('admin:users.roles'));
    let select = document.createElement("select");
    select.classList.add("form-select");
    let opt1 = document.createElement("option");
    opt1.value = "1";
    opt1.textContent = i18next.t('admin:common.user');
    opt1.disabled = true;
    let opt2 = document.createElement("option");
    opt2.value = "2";
    opt2.textContent = i18next.t('admin:common.moderator');
    opt2.disabled = true;
    let opt3 = document.createElement("option");
    opt3.value = "3";
    opt3.textContent = i18next.t('admin:common.admin');
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

    /* ÖSSZEÉPITÉS */
    formGroup.appendChild(idDiv);
    formGroup.appendChild(userDiv);
    formGroup.appendChild(emailDiv);
    formGroup.appendChild(roleDiv);

    form.appendChild(formGroup);
    colRight.appendChild(form);

    row.appendChild(colLeft);
    row.appendChild(colRight);
    container.appendChild(row);

    return container;
}

function frissitUserTablazat(data, userCount, variables) {
    let tablePlace = document.getElementById('usersTableDiv');
    tablePlace.innerHTML = "";
    tablePlace.appendChild(lapozasGeneral(userCount, paginate, currentPage, variables));
    tablePlace.appendChild(tablazatGeneral(data, variables));
}

function tablazatGeneral(adatok, variables) {
    let tablazat = createHTMLelement('table', ["table", "table-sm", "table-striped", "table-hover"], null, 'usersTable');
    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    let oszlopfok = [i18next.t('admin:users.table_active'), i18next.t('admin:users.table_id'), i18next.t('admin:users.table_username'), i18next.t('admin:users.table_email'), i18next.t('admin:users.table_role'), i18next.t('admin:users.table_actions')];

    for (let i = 0; i < oszlopfok.length; i++) {
        let th = createHTMLelement('th', [], oszlopfok[i]);
        tr.appendChild(th);
    }
    thead.appendChild(tr);
    let tbody = createHTMLelement('tbody', ["table-group-divider"]);
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
            let td = createHTMLelement('td', [], ertekek[j])
            tr.appendChild(td);
        }

        let td = document.createElement('td');
        let modositoGombokDiv = createHTMLelement('div', ["d-flex", "justify-content-evenly"]);
        let editGomb, torloGomb, gombText;
        if (adatok[i].role != "ADMIN" && adatok[i].deleted_at == null) {
            editGomb = gombGeneral("button", null, "edit", "blue", null, ["d-flex", "flex-column", "flex-xl-row", "justify-content-center", "align-items-center", "ps-lg-2"]);
            editGomb.addEventListener("click", async function () {
                currentData = await getUser(adatok[i].user_id);
                modalView(i18next.t('admin:users.modal_edit_title'), "edit", await editUserToModal(currentData, variables), variables);
                variables.modal.show();
            })
            gombText = createHTMLelement('span', ["d-none", "d-md-block"], i18next.t('admin:users.btn_edit'));
            editGomb.appendChild(gombText);

            torloGomb = gombGeneral("button", null, "trash-2", "red", null, ["d-flex", "flex-column", "flex-xl-row", "justify-content-center", "align-items-center", "ps-xl-2"]);
            torloGomb.addEventListener("click", async function () {
                showAlert(await userToInactive(adatok[i].user_id, adatok[i].role, adatok[i].deleted_at == null), 'success');
                currentPage.page = 1;
                let data = await sortedUser(getFilterValues());
                frissitUserTablazat(data.users, data.total, variables);
            });
            gombText = createHTMLelement('span', ["d-none", "d-md-block"], i18next.t('admin:users.btn_delete'));
            torloGomb.appendChild(gombText);
        }
        else {
            editGomb = gombGeneral("button", null, "eye", "blue", null, ["d-flex", "flex-column", "flex-xl-row", "justify-content-center", "align-items-center", "ps-xl-2"]);
            editGomb.addEventListener("click", async function () {
                currentData = await getUser(adatok[i].user_id);
                modalView(i18next.t('admin:users.modal_view_title'), "view", await viewUserToModal(currentData, variables), variables);
                variables.modal.show();
            })
            gombText = createHTMLelement('span', ["d-none", "d-md-block"], i18next.t('admin:users.btn_view'));
            editGomb.appendChild(gombText);
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
    let button;
    switch (type) {
        case "new":
            modalSize.classList.add("modal-dialog", "modal-md");

            footertext.innerHTML = i18next.t('admin:users.validation_required');
            footertext.classList.add("text-danger");

            button = gombGeneral("button", i18next.t('admin:users.btn_create'), "user-check", "blue", null);
            button.addEventListener('click', async function () {
                let ures = false;
                let inInput = {
                    username: document.getElementById("newUsernameInput").value,
                    email: document.getElementById("newEmailInput").value,
                    password: document.getElementById("newPasswordInput").value,
                    role: document.getElementById("newRoleSelect").value
                }
                Object.keys(inInput).forEach(key => {
                    if (inInput[key] == "") {
                        ures = true;
                    }
                });
                if (!ures) {
                    await newUser(inInput.username, inInput.email, inInput.password, inInput.role);
                    currentPage.page = 1;
                    let data = await sortedUser(getFilterValues());
                    frissitUserTablazat(data.users, data.total, variables);
                } else {
                    showAlert(i18next.t('admin:users.validation_required'), 'warning');
                }
                variables.modal.hide();
            })
            footerButtons.appendChild(button);
            break;
        case "edit":
            modalSize.classList.add("modal-dialog", "modal-xl");

            footertext.innerHTML = i18next.t('admin:users.warning_after_exit');
            footertext.classList.add("text-danger");

            button = gombGeneral("button", i18next.t('admin:users.btn_undo'), "refresh-ccw", "red", null);
            button.addEventListener("click", function () {
                document.getElementById("editUsernameInput").value = currentData.username;
                document.getElementById("editEmailInput").value = currentData.email;
                document.getElementById("editRoleSelect").value = currentData.role;
            })
            footerButtons.appendChild(button);

            button = gombGeneral("button", i18next.t('admin:users.btn_save'), "save", "blue", null);
            button.addEventListener('click', async function () {
                let valtozas = false;
                if (variables.deleteLast) {
                    await deleteProfilePicture(currentData.user_id);
                    valtozas = true;
                } else if (variables.tempPfp) {
                    await uploadProfilePic(variables.tempPfp, currentData.user_id);
                    valtozas = true;
                }

                let inInput = {
                    username: document.getElementById("editUsernameInput").value,
                    email: document.getElementById("editEmailInput").value,
                    role: document.getElementById("editRoleSelect").value
                }

                Object.keys(inInput).forEach(key => {
                    if (inInput[key] != currentData[key]) {
                        valtozas = true;
                    }
                });

                if (valtozas) {
                    let siker = await userUpdate(currentData.user_id, inInput.username, inInput.email, inInput.role);
                    if (siker) {
                        currentPage.page = 1;
                        let data = await sortedUser(getFilterValues());
                        frissitUserTablazat(data.users, data.total, variables);
                    }
                }
                variables.modal.hide();
            });
            footerButtons.appendChild(button);
            break;
        case "view":
            modalSize.classList.add("modal-dialog", "modal-xl");

            button = gombGeneral("button", i18next.t('admin:users.btn_exit'), null, "blue", null);
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
    let content = createHTMLelement('p', ['text-center'], text);
    return content;
}

async function paginate(variables) {
    let data = await sortedUser(getFilterValues());
    frissitUserTablazat(data.users, data.total, variables);
}

function getFilterValues() {
    let kereso = document.getElementById('keresoInput').value;
    let selectOption = document.getElementById('keresoSelect').value;
    let selectedStatus = document.querySelector('input[name="sort1"]:checked').id;
    let adminChecked = document.getElementById('roleAdmin').checked;
    let modChecked = document.getElementById('roleModerator').checked;
    let userChecked = document.getElementById('roleUser').checked;

    return {
        mireKeresek: selectOption,
        mit: kereso,
        status: selectedStatus,
        adminChecked,
        modChecked,
        userChecked,
        page: currentPage.page
    };
}

let currentData = {};
let currentPage = { page: 1 };