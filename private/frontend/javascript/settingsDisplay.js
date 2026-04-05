import { getUserData, deleteProfile, deleteProfilePicture, uploadProfilePic, userSelfUpdate, updatePassword, updateDarkMode } from "./fetchs.js";
import { inputGeneral, gombGeneral, labelGeneral, makeSubtitle } from "./utils/domUtils.js";

export async function settingsDisplayre() {
    let hova = document.getElementById('content');
    hova.innerHTML = "";

    let errordiv = document.createElement('div');
    errordiv.id = 'errorLocation';
    errordiv.classList.add('d-none');

    tempPfp = null;
    let deleteLast = false;
    let data = await getUserData();
    currentSettings = {
        username: data.username,
        email: data.email,
        is_2fa: data.is_2fa
    }

    let container = document.createElement('div');
    container.classList.add('container', 'p-4');

    let accordion = document.createElement('div');
    accordion.id = 'settingsAccordion';
    accordion.classList.add('accordion');

    let personalSec = createSection('personal', 'Personal Settings', true);
    let saveAllBtn = gombGeneral("button", "Save settings", null, "green", null);
    saveAllBtn.classList.add('w-100', 'mt-4', 'py-3', 'fw-bold');
    saveAllBtn.addEventListener("click", async function () {
        try {
            await checkModification();
            if (tempPfp != null) {
                await uploadProfilePic(tempPfp);
            } else {
                if (deleteLast) {
                    await deleteProfilePicture();
                }
            }
            alert("Beállítások mentve!");
        } catch (error) {
            errordiv.innerHTML = `<p>${error.message}</p>`;
            errordiv.className = "alert alert-danger d-flex justify-content-between align-items-center";
            let closeBtn = document.createElement('button');
            closeBtn.className = 'btn-close';
            closeBtn.onclick = () => { errordiv.classList.add('d-none'); };
            errordiv.appendChild(closeBtn);
        }
    });
    personalSec.appendChild(saveAllBtn);

    let uiSec = createSection('ui', 'UI Settings');
    let adminSec = createSection('admin', 'Admin Settings');

    let row = document.createElement("div");
    row.classList.add("row");

    let pfpCol = document.createElement("div");
    pfpCol.classList.add("col-12", "col-md-4", "d-flex", "flex-column", "align-items-center");

    let dropzone = document.createElement("div");
    dropzone.classList.add("dropzone");
    dropzone.addEventListener("dragover", function (e) {
        e.preventDefault();
    });

    dropzone.addEventListener("drop", function (e) {
        e.preventDefault();

        let file = e.dataTransfer.files[0];
        tempPfp = file;
        let reader = new FileReader();
        reader.onload = function (ev) {
            pfp.src = ev.target.result;
        }
        reader.readAsDataURL(file);
    });

    let pfp = document.createElement("img");
    if (data.filepath == null) {
        pfp.src = "../images/default.png";
    } else {
        objectURL = await getProfilePicture(data.filepath);
        pfp.src = objectURL;
    }
    pfp.classList.add("img-fluid", "img-thumbnail", "settingsPfp");

    let newPfpInput = inputGeneral("file", null, null, "newPfpInput", ["form-control", "d-none"], false);
    newPfpInput.setAttribute("accept", "image/*");
    newPfpInput.addEventListener("change", async function () {
        if (this.files.length != 0) {
            let file = this.files[0];
            tempPfp = file;
            pfp.src = await createPreview(file);
        }
    });

    dropzone.appendChild(pfp);
    dropzone.appendChild(newPfpInput);
    dropzone.addEventListener("click", () => newPfpInput.click());
    pfpCol.appendChild(dropzone);

    if (data.filepath != null) {
        let deletePfpButton = gombGeneral("button", "Delete profile picture", "trash-2", "red", null);
        deletePfpButton.addEventListener("click", () => {
            pfp.src = "../images/default.png";
            deleteLast = true;
        });
        pfpCol.appendChild(deletePfpButton);
    }

    let dataCol = document.createElement("div");
    dataCol.classList.add("col-12", "col-md-8");

    let date = new Date(data.created_at);
    dataCol.appendChild(makeSubtitle(`Registered: ${date.toLocaleString("hu-HU")}`));
    dataCol.appendChild(makeSubtitle("Username"));
    dataCol.appendChild(inputGeneral("text", "username", data.username, "usernameInput", ["form-control"], false));
    dataCol.appendChild(makeSubtitle("E-mail address"));
    dataCol.appendChild(inputGeneral("text", "email", data.email, "emailInput", ["form-control"], false));

    let buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add("d-flex", "gap-2", "my-3");

    let changePassBtn = gombGeneral("button", "Change password", null, null, null);
    changePassBtn.classList.add("btn", "btn-purple", "rounded-pill");
    changePassBtn.setAttribute('data-bs-toggle', 'collapse');
    changePassBtn.setAttribute('data-bs-target', '#passwordCollapse');

    let deleteProfileBtn = gombGeneral("button", "Delete account", null, "red", null);
    deleteProfileBtn.addEventListener("click", () => deleteProfile());

    let collapseDiv = document.createElement('div');
    collapseDiv.className = 'collapse';
    collapseDiv.id = 'passwordCollapse';

    let innerCard = document.createElement('div');
    innerCard.classList.add("d-flex", "flex-column", "border", "rounded", "p-3", "bg-light");

    let passGroup1 = document.createElement('div');
    passGroup1.classList.add('mb-2');
    passGroup1.appendChild(labelGeneral('oldPassword', 'Old password:'));
    passGroup1.appendChild(inputGeneral('password', null, null, 'oldPassword', ["form-control"], false));

    let passGroup2 = document.createElement('div');
    passGroup2.classList.add('mb-2');
    passGroup2.appendChild(labelGeneral('newPassword', 'New password:'));
    passGroup2.appendChild(inputGeneral('password', null, null, 'newPassword', ["form-control"], false));

    let savePassBtn = document.createElement('button');
    savePassBtn.className = 'btn btn-success btn-sm';
    savePassBtn.innerText = 'Save';
    savePassBtn.onclick = jelszoValtoztat;

    innerCard.appendChild(passGroup1);
    innerCard.appendChild(passGroup2);
    innerCard.appendChild(savePassBtn);
    collapseDiv.appendChild(innerCard);

    buttonsDiv.appendChild(changePassBtn);
    buttonsDiv.appendChild(deleteProfileBtn);
    dataCol.appendChild(buttonsDiv);
    dataCol.appendChild(collapseDiv);

    row.appendChild(pfpCol);
    row.appendChild(dataCol);
    personalSec.body.appendChild(row);

    uiSec.body.appendChild(makeSubtitle("Select language:"));
    let langSelect = document.createElement('select');
    langSelect.id = 'languageSelect';
    langSelect.classList.add('form-select', 'mb-3');
    let optHu = new Option("Magyar", "hu");
    let optEn = new Option("English", "en");
    langSelect.add(optHu);
    langSelect.add(optEn);
    uiSec.body.appendChild(langSelect);

    uiSec.body.appendChild(makeSubtitle("Dark mode"));
    let darkSwitchDiv = document.createElement('div');
    darkSwitchDiv.classList.add('form-check', 'form-switch');
    let darkInput = inputGeneral("checkbox", null, null, "darkMode", ["form-check-input"], false);
    darkInput.checked = (data.darkmode == 1);
    darkInput.onclick = async function () {
        await updateDarkMode(document.getElementById("darkMode").checked);
        ejszakaimod();
    };
    let darkLabel = document.createElement('label');
    darkLabel.innerText = "Enable dark mode";
    darkSwitchDiv.appendChild(darkInput);
    darkSwitchDiv.appendChild(darkLabel);
    uiSec.body.appendChild(darkSwitchDiv);

    accordion.appendChild(personalSec.item);
    accordion.appendChild(uiSec.item);
    accordion.appendChild(adminSec.item);
    container.appendChild(accordion);

    hova.appendChild(errordiv);
    hova.appendChild(container);
}

function createSection(id, title, isOpen = false) {
    let item = document.createElement('div');
    item.classList.add('accordion-item', 'mb-3', 'border-0', 'shadow-sm');

    let header = document.createElement('h2');
    header.classList.add('accordion-header');

    let button = document.createElement('button');
    button.classList.add('accordion-button');
    if (!isOpen) button.classList.add('collapsed');
    button.type = 'button';
    button.innerText = title;
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', `#collapse-${id}`);

    let collapse = document.createElement('div');
    collapse.id = `collapse-${id}`;
    collapse.classList.add('accordion-collapse', 'collapse');
    if (isOpen) collapse.classList.add('show');
    collapse.setAttribute('data-bs-parent', '#settingsAccordion');

    let body = document.createElement('div');
    body.classList.add('accordion-body');

    header.appendChild(button);
    collapse.appendChild(body);
    item.appendChild(header);
    item.appendChild(collapse);

    return { item, body };
};

async function checkModification() {
    let valtozas = false;
    let inInput = {
        username: document.getElementById('usernameInput').value,
        email: document.getElementById('emailInput').value,
        is_2fa: document.getElementById('is2faInput').checked
    }
    Object.keys(inInput).forEach(key => {
        if (inInput[key] == currentSettings[key]) {
            inInput[key] = null;
        }
        else {
            valtozas = true;
        }
    });
    if (valtozas) {
        let siker = true;
        if (inInput.username != null && !validalvaUsername(inInput.username)) {
            wrongInput(document.getElementById('usernameInput'));
            siker = false;
        }
        if (inInput.email != null && !validalvaEmail(inInput.email)) {
            wrongInput(document.getElementById('emailInput'));
            siker = false;
        }
        if (siker) {
            await saveModification(inInput.username, inInput.email, inInput.is_2fa);
        }
    }
}

async function saveModification(username, email, is_2fa) {
    let errordiv = document.getElementById('errorLocation');
    errordiv.innerHTML = "";
    let response = await userSelfUpdate(username, email, is_2fa);
    if (!response.ok) {
        let data = await response.json();
        errordiv.classList.remove('d-none');
        if (data.error) {
            let ul = document.createElement('ul');
            let hiba;
            if (Array.isArray(data.error)) {
                for (let i = 0; i < data.error.length; i++) {
                    let li = document.createElement('li');
                    hiba = data.error[i].msg;
                    li.innerText = `${data.error[i].path}: ${hiba}`;
                    ul.appendChild(li);
                }
            }
            else {
                let li = document.createElement('li');
                hiba = data.error.msg;
                li.innerText = `${data.error.path}: ${hiba}`;
                ul.appendChild(li);
            }

            errordiv.appendChild(ul);
        }
    }
    else {
        alert("Sikeres módositás!"); //atmeneti
    }
}

async function jelszoValtoztat() {
    let alertPlaceholder = document.getElementById('passwordAlert');
    let passwordCollapse = document.getElementById('passwordCollapse');
    let oldPass = document.getElementById('oldPassword');
    let newPass = document.getElementById('newPassword');
    let newAlert = null;
    if (oldPass.value == newPass.value) {
        newAlert = createAlert('Az régi és az új jelszó nem lehet ugyanaz!', 'danger');
    }
    else {
        if (validalvaJelszo(newPass.value)) {
            let response = await updatePassword(oldPass.value, newPass.value)
            if (response.ok) {
                newAlert = createAlert('Sikeres jelszómódosítás!', 'success');
                let bsCollapse = bootstrap.Collapse.getInstance(passwordCollapse) || new bootstrap.Collapse(passwordCollapse);
                bsCollapse.hide();
                oldPass.value = '';
                newPass.value = '';
            }
            else {
                let data = await response.json();
                let hibaUzenet = '';

                if (data.error && Array.isArray(data.error)) {
                    hibaUzenet = data.error.map(err => err.msg).join('<br>');
                    newAlert = createAlert(`Hiba! Az alábbi követelmények nem teljesülnek!<br>${hibaUzenet}`, 'danger');
                } else {
                    hibaUzenet = data.error || 'Ismeretlen hiba történt!';
                    newAlert = createAlert(`Hiba! ${hibaUzenet}`, 'danger');
                }
            }
        }
        else {
            newAlert = createAlert('Az új jelszónak tartalmaznia kell egy nagybetűt, egy számot, minimum 8 és maximum 50 karakter hosszú lehet!', 'danger');
        }
    }
    if (newAlert) {
        alertPlaceholder.replaceChildren(newAlert);
    }
}

function ejszakaimod() {
    let body = document.body;
    let aktualis = body.getAttribute('data-bs-theme');

    if (aktualis === 'dark') {
        body.setAttribute('data-bs-theme', 'light');
    } else {
        body.setAttribute('data-bs-theme', 'dark');
    }
}

function createAlert(message, type) {
    let alertDiv = document.createElement('div');
    alertDiv.classList.add("alert", "alert-dismissible", "fade", "show");
    if (type) {
        alertDiv.classList.add(`alert-${type}`)
    }
    alertDiv.role = 'alert';

    let textNode = document.createElement('span');
    textNode.innerHTML = message;
    alertDiv.appendChild(textNode);

    let closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close';
    closeBtn.setAttribute('data-bs-dismiss', 'alert');
    closeBtn.setAttribute('aria-label', 'Close');

    alertDiv.appendChild(closeBtn);

    return alertDiv;
}

async function createPreview(file) {

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.src = url;
    await new Promise(res => img.onload = res);
    URL.revokeObjectURL(url);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 400;

    let size = Math.min(img.width, img.height);

    let sx = (img.width - size) / 2;
    let sy = (img.height - size) / 2;

    ctx.drawImage(
        img,
        sx, sy,
        size, size,
        0, 0,
        400, 400
    );

    return canvas.toDataURL("image/webp");
}

function wrongInput(input) {
    input.classList.add("border-danger")
    input.addEventListener(
        "input",
        () => input.classList.remove("border-danger"),
        { once: true }
    );
}

function validalvaUsername(username) {
    return username.length < 50 && username.length > 1 && isCorrectUsername(username);
}

function validalvaEmail(email) {
    return email.length < 250 && email.length > 5 && isEmail(email);
}

function validalvaJelszo(password) {
    return password.length < 50 && password.length > 8 && isCorrectPassword(password);
}

function isCorrectUsername(username) {
    const re = /^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]{1,20}$/;
    return re.test(username);
}

function isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isCorrectPassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasUpperCase && hasNumber;
}

let settingsModal;
let currentSettings;
let objectURL;
let tempPfp;