import { osszesUser, getUser, sortedUser, getProfilePicture, newUser, userUpdate, userToInactive, exportUsers, uploadProfilePic, deleteProfilePicture } from "./fetchs.js";
import { createHTMLelement, gombGeneral, inputGeneral, labelGeneral, lapozasGeneral, createPreview, showAlert } from "./utils/domUtils.js";
import { validalvaUsername, validalvaEmail, validalvaJelszo, wrongInput } from "/javascript/libs/utils/validations.js";
import i18next from "./utils/i18next.js";

const State = {
    page: 1,
    currentData: {},
    variables: {}
};

export async function usersDisplayre(variables) {
    State.page = 1;
    State.variables = variables;
    let display = document.getElementById('content');
    display.innerHTML = "";

    let row = createHTMLelement('div', ["row", "p-3", "g-4"]);

    let fejlecDiv = createHTMLelement('div', ["d-flex", "justify-content-between", "align-items-center"]);
    let cim = createHTMLelement('h2', ["h2", "mb-0"], i18next.t('admin:users.title'));
    let newUserGomb = gombGeneral("button", i18next.t('admin:users.create_new'), "user-plus", "green", null);
    newUserGomb.addEventListener("click", handleNewUserClick);
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
    keresoInput.addEventListener("input", handleFilterChange);

    let keresoSelect = document.createElement('select');
    keresoSelect.classList.add("form-select");
    keresoSelect.id = 'keresoSelect';
    keresoSelect.addEventListener("change", handleFilterChange);

    let options = [
        { value: 'user_id', text: 'ID' },
        { value: 'username', text: 'Username' },
        { value: 'email', text: 'E-mail' }
    ];
    options.forEach(opt => {
        let o = document.createElement('option');
        o.value = opt.value;
        o.innerText = opt.text;
        if (opt.value === 'user_id') {
            o.selected = true;
        } 
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
        radioButton.addEventListener("change", handleFilterChange);
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
        { id: 'roleLord', label: i18next.t('admin:common.lord') },
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
        checkbox.addEventListener("change", handleFilterChange);
        let label = labelGeneral(roleFilter.id, roleFilter.label, ["form-check-label"]);
        formcheck.appendChild(checkbox);
        formcheck.appendChild(label);
        roleDiv.appendChild(formcheck);
    }
    szuresDiv.appendChild(roleDivCim);
    szuresDiv.appendChild(roleDiv);

    let exportGombDiv = createHTMLelement('div', ["mt-3", "border-top", "pt-3"]);
    let exportGomb = gombGeneral("button", i18next.t('admin:users.export_csv'), "file-text", "blue", null, ["w-100"]);
    exportGomb.addEventListener("click", handleExportClick);
    exportGombDiv.appendChild(exportGomb);
    szuresDiv.appendChild(exportGombDiv);

    kartya.appendChild(kiscim);
    kartya.appendChild(szuresDiv);
    szuresCol.appendChild(kartya);

    //tablazat
    let tablazatCol = createHTMLelement('div', []);
    let tablazatTartalom = createHTMLelement('div', ["table-responsive"], null, "usersTableDiv");
    let data = await osszesUser();
    tablazatTartalom.appendChild(lapozasGeneral(data.total, paginate, State, 10));
    tablazatTartalom.appendChild(tablazatGeneral(data.users));
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
    let form = createHTMLelement('div', [], null, 'newUserFrom');

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
    let select = createRoleSelect("user", false);
    select.id = 'newRoleSelect';
    roleDiv.appendChild(roleP);
    roleDiv.appendChild(select);

    formGroup.appendChild(userDiv);
    formGroup.appendChild(emailDiv);
    formGroup.appendChild(passDiv);
    formGroup.appendChild(roleDiv);

    form.appendChild(formGroup);

    return form;
}

async function editUserToModal(data) {
    let user_id = data.user_id;
    let username = data.username;
    let email = data.email;
    let role = data.role;
    let pfproute = data.filepath;

    State.variables.tempPfp = null;
    State.variables.deleteLast = false;

    let container = createHTMLelement('div', ["container-fluid"]);
    let row = createHTMLelement('div', ["row"]);

    /* BAL OLDAL */
    let colLeft = createHTMLelement('div', ["col-4"]);

    let dropzone = document.createElement("div");
    dropzone.classList.add("dropzone");
    dropzone.addEventListener("dragover", handleDragOver);
    dropzone.addEventListener("drop", handleDrop);

    let pfp = document.createElement("img");
    pfp.id = "editPfpImage";
    let deletePfpButton;
    if (pfproute == null) {
        pfp.src = "../images/default.png";
    }
    else {
        State.variables.objectURL = await getProfilePicture(pfproute);
        pfp.src = State.variables.objectURL;
        deletePfpButton = gombGeneral("button", i18next.t('admin:users.delete_profile_picture'), "trash-2", "red", null);
        deletePfpButton.addEventListener("click", handleDeletePfpClick);
    }
    pfp.alt = i18next.t('admin:users.profile_picture');
    pfp.title = i18next.t('admin:users.profile_picture');
    pfp.classList.add("img-fluid", "img-thumbnail", "rounded-circle", "h-75");

    let newPfpInput = inputGeneral("file", null, null, "newPfpInput", ["form-control", "d-none"], false);
    newPfpInput.setAttribute("accept", "image/*");
    newPfpInput.addEventListener("change", handlePfpChange);

    let dropzoneText = document.createElement('p');
    dropzoneText.innerText = i18next.t('admin:users.drop_image_text');
    dropzoneText.classList.add("text-center");

    dropzone.appendChild(pfp);
    dropzone.appendChild(newPfpInput);
    dropzone.appendChild(dropzoneText);
    dropzone.addEventListener("click", handleDropzoneClick);

    colLeft.appendChild(dropzone);
    if (pfproute != null) {
        colLeft.appendChild(deletePfpButton);
    }

    /* JOBB OLDAL */
    let colRight = createHTMLelement('div', ["col-8"]);
    let form = createHTMLelement('div', [], null, 'editUserForm');
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
    let select = createRoleSelect(role, false);
    select.id = 'editRoleSelect';
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

async function viewUserToModal(data) {
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
        State.variables.objectURL = await getProfilePicture(pfproute);
        pfp.src = State.variables.objectURL;
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
    let form = createHTMLelement('div', [], null, 'editUserForm');
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
    let select = createRoleSelect(role, true);
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

function frissitUserTablazat(data, userCount) {
    let tablePlace = document.getElementById('usersTableDiv');
    tablePlace.innerHTML = "";
    tablePlace.appendChild(lapozasGeneral(userCount, paginate, State, 10));
    tablePlace.appendChild(tablazatGeneral(data));
}

function tablazatGeneral(adatok) {
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
        let canEdit = (adatok[i].role !== "ADMIN" && adatok[i].role !== "LORD") || State.variables.myRole === "LORD";
        if (canEdit && adatok[i].deleted_at == null) {
            editGomb = gombGeneral("button", null, "edit", "blue", null, ["d-flex", "flex-column", "flex-xl-row", "justify-content-center", "align-items-center", "ps-lg-2"]);
            editGomb.dataset.id = adatok[i].user_id;
            editGomb.addEventListener("click", handleEditClick);
            gombText = createHTMLelement('span', ["d-none", "d-md-block"], i18next.t('admin:users.btn_edit'));
            editGomb.appendChild(gombText);

            if (adatok[i].username !== State.variables.myUsername) {
                torloGomb = gombGeneral("button", null, "trash-2", "red", null, ["d-flex", "flex-column", "flex-xl-row", "justify-content-center", "align-items-center", "ps-xl-2"]);
                torloGomb.dataset.id = adatok[i].user_id;
                torloGomb.dataset.role = adatok[i].role;
                torloGomb.dataset.active = adatok[i].deleted_at == null;
                torloGomb.addEventListener("click", handleDeleteClick);
                gombText = createHTMLelement('span', ["d-none", "d-md-block"], i18next.t('admin:users.btn_delete'));
                torloGomb.appendChild(gombText);
            }
        }
        else {
            editGomb = gombGeneral("button", null, "eye", "blue", null, ["d-flex", "flex-column", "flex-xl-row", "justify-content-center", "align-items-center", "ps-xl-2"]);
            editGomb.dataset.id = adatok[i].user_id;
            editGomb.addEventListener("click", handleViewClick);
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
        case "new":
            modalSize.classList.add("modal-dialog", "modal-md");

            footertext.innerHTML = i18next.t('admin:users.validation_required');
            footertext.classList.add("text-danger");

            button = gombGeneral("button", i18next.t('admin:users.btn_create'), "user-check", "blue", null);
            button.addEventListener('click', handleModalCreateClick);
            footerButtons.appendChild(button);
            break;
        case "edit":
            modalSize.classList.add("modal-dialog", "modal-xl");

            footertext.innerHTML = i18next.t('admin:users.warning_after_exit');
            footertext.classList.add("text-danger");

            button = gombGeneral("button", i18next.t('admin:users.btn_undo'), "refresh-ccw", "red", null);
            button.addEventListener("click", handleModalUndoClick);
            footerButtons.appendChild(button);

            button = gombGeneral("button", i18next.t('admin:users.btn_save'), "save", "blue", null);
            button.addEventListener('click', handleModalSaveClick);
            footerButtons.appendChild(button);
            break;
        case "view":
            modalSize.classList.add("modal-dialog", "modal-xl");

            button = gombGeneral("button", i18next.t('admin:users.btn_exit'), null, "blue", null);
            button.addEventListener("click", handleModalExitClick);
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

async function paginate() {
    let data = await sortedUser(getFilterValues());
    frissitUserTablazat(data.users, data.total);
}

function getFilterValues() {
    let kereso = document.getElementById('keresoInput').value;
    let selectOption = document.getElementById('keresoSelect').value;
    let selectedStatus = document.querySelector('input[name="sort1"]:checked').id;
    let adminChecked = document.getElementById('roleAdmin').checked;
    let modChecked = document.getElementById('roleModerator').checked;
    let userChecked = document.getElementById('roleUser').checked;
    let lordChecked = document.getElementById('roleLord').checked;

    return {
        mireKeresek: selectOption,
        mit: kereso,
        status: selectedStatus,
        adminChecked,
        modChecked,
        userChecked,
        lordChecked,
        page: State.page
    };
}

function createRoleSelect(selectedRole, isDisabled = false) {
    let select = document.createElement("select");
    select.classList.add("form-select");

    const roles = [
        { value: "user", text: i18next.t('admin:common.user'), reqLord: false },
        { value: "MOD", text: i18next.t('admin:common.moderator'), reqLord: false },
        { value: "ADMIN", text: i18next.t('admin:common.admin'), reqLord: true },
        { value: "LORD", text: i18next.t('admin:common.lord'), reqLord: true }
    ];

    roles.forEach(r => {
        let opt = document.createElement("option");
        opt.value = r.value;
        opt.textContent = r.text;
        opt.disabled = isDisabled || (r.reqLord && State.variables.myRole !== 'LORD');
        if (r.value === selectedRole) opt.selected = true;
        select.appendChild(opt);
    });

    return select;
}

async function handleFilterChange() {
    State.page = 1;
    let data = await sortedUser(getFilterValues());
    frissitUserTablazat(data.users, data.total);
}

async function handleExportClick() {
    await exportUsers(getFilterValues());
}

function handleNewUserClick() {
    modalView(i18next.t('admin:users.create_new'), "new", newUserToModal());
    State.variables.modal.show();
}

async function handleEditClick(event) {
    let userId = event.currentTarget.dataset.id;
    State.currentData = await getUser(userId);
    modalView(i18next.t('admin:users.modal_edit_title'), "edit", await editUserToModal(State.currentData));
    State.variables.modal.show();
}

async function handleDeleteClick(event) {
    let btn = event.currentTarget;
    try {
        let uzenet = await userToInactive(btn.dataset.id, btn.dataset.role, btn.dataset.active === 'true');
        if (uzenet) {
            showAlert(uzenet, 'success');
        }
    } catch (error) {
        console.error("Hiba a törlés során:", error);
    } finally {
        State.page = 1;
        let data = await sortedUser(getFilterValues());
        frissitUserTablazat(data.users, data.total);
    }
}

async function handleViewClick(event) {
    let userId = event.currentTarget.dataset.id;
    State.currentData = await getUser(userId);
    modalView(i18next.t('admin:users.modal_view_title'), "view", await viewUserToModal(State.currentData));
    State.variables.modal.show();
}

function handleDragOver(e) {
    e.preventDefault();
}

async function handleDrop(e) {
    e.preventDefault();
    let file = e.dataTransfer.files[0];
    if (file) {
        State.variables.tempPfp = file;
        State.variables.deleteLast = false;
        let preview = await createPreview(file);
        document.getElementById('editPfpImage').src = preview;
    }
}

async function handlePfpChange(e) {
    if (e.target.files.length != 0) {
        let file = e.target.files[0];
        State.variables.tempPfp = file;
        State.variables.deleteLast = false;
        let preview = await createPreview(file);
        document.getElementById('editPfpImage').src = preview;
    }
}

function handleDeletePfpClick() {
    document.getElementById('editPfpImage').src = "../images/default.png";
    State.variables.deleteLast = true;
    State.variables.tempPfp = null;
}

function handleDropzoneClick() {
    document.getElementById('newPfpInput').click();
}

async function handleModalCreateClick() {
    let ures = false;
    let valids = true;
    let inInput = {
        username: document.getElementById("newUsernameInput").value,
        email: document.getElementById("newEmailInput").value,
        password: document.getElementById("newPasswordInput").value,
        role: document.getElementById("newRoleSelect").value
    }
    Object.keys(inInput).forEach(key => {
        if (inInput[key] == "") ures = true;
    });
    if (!ures) {
        if (!validalvaUsername(inInput.username)) {
            wrongInput(document.getElementById("newUsernameInput"));
            valids = false;
        }
        if (!validalvaEmail(inInput.email)) {
            wrongInput(document.getElementById("newEmailInput"));
            valids = false;
        }
        if (!validalvaJelszo(inInput.password)) {
            wrongInput(document.getElementById("newPasswordInput"));
            valids = false;
        }
        if (valids) {
            try {
                await newUser(inInput.username, inInput.email, inInput.password, inInput.role);
                State.page = 1;
                let data = await sortedUser(getFilterValues());
                frissitUserTablazat(data.users, data.total);
                showAlert(i18next.t('admin:usersApi.signup_success'), 'success');
                State.variables.modal.hide();
            } catch (error) {
                console.error("Hiba a felhasználó létrehozásakor:", error);
            }
        }
    } else {
        showAlert(i18next.t('admin:users.validation_required'), 'warning');
    }
}

function handleModalUndoClick() {
    document.getElementById("editUsernameInput").value = State.currentData.username;
    document.getElementById("editEmailInput").value = State.currentData.email;
    document.getElementById("editRoleSelect").value = State.currentData.role;
    if (State.currentData.filepath == null) {
        document.getElementById("editPfpImage").src = "../images/default.png";
    } else {
        document.getElementById("editPfpImage").src = State.variables.objectURL;
    }
    State.variables.tempPfp = null;
    State.variables.deleteLast = false;
}

async function handleModalSaveClick() {
    let valtozas = false;
    let valids = true;
    if (State.variables.deleteLast) {
        await deleteProfilePicture(State.currentData.user_id);
        valtozas = true;
    } else if (State.variables.tempPfp) {
        await uploadProfilePic(State.variables.tempPfp, State.currentData.user_id);
        valtozas = true;
    }

    let inInput = {
        username: document.getElementById("editUsernameInput").value,
        email: document.getElementById("editEmailInput").value,
        role: document.getElementById("editRoleSelect").value
    }

    Object.keys(inInput).forEach(key => {
        if (inInput[key] != State.currentData[key]) {
            valtozas = true;
        }
    });

    if (valtozas) {
        if (!validalvaUsername(inInput.username)) {
            wrongInput(document.getElementById("editUsernameInput"));
            valids = false;
        }
        if (!validalvaEmail(inInput.email)) {
            wrongInput(document.getElementById("editEmailInput"));
            valids = false;
        }

        if (valids) {
            try {
                let siker = await userUpdate(State.currentData.user_id, inInput.username, inInput.email, inInput.role);
                if (siker) {
                    State.page = 1;
                    let data = await sortedUser(getFilterValues());
                    frissitUserTablazat(data.users, data.total);
                    showAlert(i18next.t('admin:usersApi.update_success'), 'success');
                    State.variables.modal.hide();
                }
            } catch (error) {
                console.error("Hiba a frissítés során:", error);
            }
        }
    } else {
        State.variables.modal.hide();
    }
}

function handleModalExitClick() {
    State.variables.modal.hide();
}