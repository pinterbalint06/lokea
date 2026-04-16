import { getUserData, deleteProfile, deleteProfilePicture, uploadProfilePic, userSelfUpdate, updatePassword, updateDarkMode, getProfilePicture } from "./fetchs.js";
import { createHTMLelement, inputGeneral, gombGeneral, labelGeneral, makeSubtitle, createPreview } from "./utils/domUtils.js";

export async function settingsDisplayre() {
    let hova = document.getElementById('content');
    hova.innerHTML = "";

    let errordiv = createHTMLelement('div', ["d-none"], null, "errorLocation");

    tempPfp = null;
    let deleteLast = false;
    let data = await getUserData();
    currentSettings = {
        username: data.username,
        email: data.email,
        is_2fa: data.is_2fa
    }

    let container = createHTMLelement('div', ['container', 'p-4']);

    let accordion = createHTMLelement('div', ['accordion'], null, 'settingsAccordion');

    let personalSec = createSection('personal', 'Personal Settings', true);
    let saveAllBtn = gombGeneral("button", "Save settings", null, "green", null, ['w-100', 'mt-4', 'py-3', 'fw-bold']);
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

    let uiSec = createSection('ui', 'UI Settings');
    let adminSec = createSection('admin', 'Admin Settings');

    let row = createHTMLelement('div', ['row']);

    let pfpCol = createHTMLelement('div', ["col-12", "col-md-4", "d-flex", "flex-column", "align-items-center"]);

    let dropzone = createHTMLelement('div', ["dropzone"]);
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

    let pfp = createHTMLelement('img', ["img-fluid", "img-thumbnail", "settingsPfp"]);
    if (data.filepath == null) {
        pfp.src = "../images/default.png";
    } else {
        objectURL = await getProfilePicture(data.filepath);
        pfp.src = objectURL;
    }

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

    let dataCol = createHTMLelement('div', ["col-12", "col-md-8"]);

    let date = new Date(data.created_at);
    dataCol.appendChild(makeSubtitle(`Registered: ${date.toLocaleString("hu-HU")}`));
    dataCol.appendChild(makeSubtitle("Username"));
    dataCol.appendChild(inputGeneral("text", "username", data.username, "usernameInput", ["form-control"], false));
    dataCol.appendChild(makeSubtitle("E-mail address"));
    dataCol.appendChild(inputGeneral("text", "email", data.email, "emailInput", ["form-control"], false));
    dataCol.appendChild(makeSubtitle("Security"));
    let twoFaDiv = createHTMLelement('div', ['form-check', 'form-switch', 'mb-3']);
    let twoFaInput = inputGeneral("checkbox", null, null, "2faInput", ["form-check-input"], false);
    twoFaInput.checked = data.is_2fa;
    let twoFaLabel = document.createElement('label');
    twoFaLabel.className = 'form-check-label';
    twoFaLabel.innerText = "Two-factor authentication (2FA)";
    twoFaDiv.appendChild(twoFaInput);
    twoFaDiv.appendChild(twoFaLabel);
    dataCol.appendChild(twoFaDiv);

    let buttonsDiv = createHTMLelement('div', ["d-flex", "gap-2", "my-3"]);

    let changePassBtn = gombGeneral("button", "Change password", null, null, null, ["btn", "btn-purple", "rounded-pill"]);
    changePassBtn.setAttribute('data-bs-toggle', 'collapse');
    changePassBtn.setAttribute('data-bs-target', '#passwordCollapse');

    let deleteProfileBtn = gombGeneral("button", "Delete account", null, "red", null);
    deleteProfileBtn.addEventListener("click", async function () {
        if (await deleteProfile()) {
            window.location.href = "/main";
        }
    });

    let collapseDiv = createHTMLelement('div', ['collapse'], null, 'passwordCollapse');

    let innerCard = createHTMLelement('div', ["d-flex", "flex-column", "border", "rounded", "p-3", "bg-light"]);

    let passGroup1 = createHTMLelement('div', ['mb-2']);
    passGroup1.appendChild(labelGeneral('oldPassword', 'Old password:'));
    passGroup1.appendChild(inputGeneral('password', null, null, 'oldPassword', ["form-control"], false));

    let passGroup2 = createHTMLelement('div', ['mb-2']);
    passGroup2.appendChild(labelGeneral('newPassword', 'New password:'));
    passGroup2.appendChild(inputGeneral('password', null, null, 'newPassword', ["form-control"], false));

    let savePassBtn = gombGeneral('button', "Save", null, "green", null, ["btn-sm"]);
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
    personalSec.body.appendChild(saveAllBtn);

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
    let darkSwitchDiv = createHTMLelement('div', ['form-check', 'form-switch']);
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
    let item = createHTMLelement('div', ['accordion-item', 'mb-3', 'border-0', 'shadow-sm']);

    let header = createHTMLelement('h2', ['accordion-header']);

    let button = gombGeneral('button', title, null, null, null, ['accordion-button']);
    if (!isOpen) button.classList.add('collapsed');
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', `#collapse-${id}`);

    let collapse = createHTMLelement('div', ['accordion-collapse', 'collapse'], null, `collapse-${id}`);
    if (isOpen) collapse.classList.add('show');
    collapse.setAttribute('data-bs-parent', '#settingsAccordion');

    let body = createHTMLelement('div', ['accordion-body']);

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
        is_2fa: document.getElementById('2faInput').checked
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
            if (Array.isArray(data.error)) {
                for (let i = 0; i < data.error.length; i++) {
                    let li = createHTMLelement('li', [], `${data.error[i].path}: ${data.error[i].msg}`);
                    ul.appendChild(li);
                }
            }
            else {
                let li = createHTMLelement('li', [], `${data.error.path}: ${data.error.msg}`);
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
    let alertDiv = createHTMLelement('div', ["alert", "alert-dismissible", "fade", "show"]);
    if (type) {
        alertDiv.classList.add(`alert-${type}`)
    }
    alertDiv.role = 'alert';

    let textNode = createHTMLelement('span', [], message);
    alertDiv.appendChild(textNode);

    let closeBtn = gombGeneral('button', null, null, null, null, ['btn-close']);
    closeBtn.setAttribute('data-bs-dismiss', 'alert');
    closeBtn.setAttribute('aria-label', 'Close');

    alertDiv.appendChild(closeBtn);

    return alertDiv;
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

//megnezni selectet