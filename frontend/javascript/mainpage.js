import { makeSubtitle, inputGeneral, labelGeneral, gombGeneral, makeSvg, showAlert } from "./libs/utils/DOMutils.js";
import { validalvaBej, validalvaUsername, validalvaEmail, validalvaJelszo, wrongInput } from "./libs/utils/validations.js";
import { initSocket } from "./libs/utils/socketio.js";
import i18next, { initI18next } from "./libs/language/i18next.js";

document.addEventListener("DOMContentLoaded", async function () {
    if (!await isLogined()) {
        document.getElementById('loginButton').addEventListener("click", async function (e) {
            e.preventDefault();
            let username = document.getElementById('loginUser');
            let password = document.getElementById('loginPass');
            if (validalvaBej(username, password)) {
                await bejelentkezesAnimacio(username, password, document.getElementById('rememberMe').checked);
            }
        })
    }
    else {
        document.getElementById('comparisionLokea').innerHTML = "";
        modalElement = document.getElementById('settingsModal');
        settingsModal = new bootstrap.Modal(modalElement);
        settingsModal._element.addEventListener("hidden.bs.modal", function () {
            tempPfp = null;
            if (objectURL) {
                URL.revokeObjectURL(objectURL);
                objectURL = null;
            }
        });
    }
    await initSocket();
})

async function isLogined() {
    let loginStatus = false;
    try {
        let response = await fetch("/api/auth/status");
        let data = await response.json();
        if (response.ok) {
            loginStatus = data.login;
            if (loginStatus) {
                await initI18next(await nyelvSzinkronizalas() || 'hu');
                translatePage();

                if (data.adminLink) {
                    await dropdownLetrehoz(data.adminLink, data.user.username, data.user.filepath);
                }
                else {
                    await dropdownLetrehoz(null, data.user.username, data.user.filepath);
                }
                let body = document.body;
                if (data.user.darkmode == 1) {
                    body.setAttribute('data-bs-theme', 'dark');
                }
                else {
                    body.setAttribute('data-bs-theme', 'light');
                }
                return loginStatus;
            }
        }
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }

    await initI18next('hu');
    translatePage();

    return loginStatus;
}

async function bejelentkezes(username, jelszo, remember) {
    try {
        let response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username.value,
                password: jelszo.value,
                remember: remember
            })
        });
        return response;
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

async function bejelentkezesAnimacio(username, jelszo, remember) {
    let form = document.getElementById('loginForm');
    let container = document.getElementById('loginContainer');
    let title = document.getElementById('loginTitle');
    let modalText = document.getElementById('logText');

    container.querySelectorAll('svg').forEach(svg => svg.remove());
    container.classList.remove('success-draw', 'error-draw');
    container.appendChild(makeSvg("circle-border", ["progress-svg"], ["progress-circle"]));
    container.classList.add('spinning');

    try {
        let response = await bejelentkezes(username, jelszo, remember);
        let data = await response.json();
        setTimeout(() => {
            container.classList.remove('spinning');
            title.innerHTML = "";
            modalText.innerHTML = "";

            if (response.ok) {
                container.appendChild(makeSvg("checkmark", ["check-svg"], ["mark"]));
                container.classList.add('success-draw');

                title.innerText = `Sikeres bejelentkezés!`;
                title.classList.replace("h5", "h2");
                form.classList.add('collapse-out');
                modalText.innerText = `Üdv, ${data.username}!`;

                setTimeout(() => {
                    location.reload();
                }, 2500);
            } else {
                container.appendChild(makeSvg("icon-x", ["check-svg"], ["mark"]));
                container.classList.add('error-draw');

                title.innerText = "Bejelentkezés sikertelen!";
                form.classList.add('collapse-out');
                modalText.innerHTML = extractError(data).replace(/\n/g, '<br>');

                setTimeout(() => {
                    container.classList.remove('error-draw');
                    container.querySelectorAll('svg').forEach(svg => svg.remove());
                    form.classList.remove('collapse-out');
                    form.classList.add('collapse-in');
                    title.innerText = `Bejelentkezés`;
                    modalText.innerText = "";
                    setTimeout(() => {
                        form.classList.remove('collapse-in');
                    }, 600);
                }, 2500);
            }
        }, 2000);

    } catch (error) {
        container.classList.remove('spinning');
        title.innerText = "Hiba történt!";
        modalText.innerText = "Nem sikerült elérni a szervert.";
        console.error(error);
    }
}

//after login

async function dropdownLetrehoz(link, nev, kep) {
    let hova = document.getElementById('LogOrDropdown');
    hova.innerHTML = "";
    let div = document.createElement('div');
    div.classList.add("dropdown");

    let a = document.createElement('a');
    a.classList.add("d-block", "link-light", "text-decoration-none", "dropdown-toggle");
    let img = document.createElement('img');
    if (kep != null) {
        img.src = await getProfilePicture(kep);
    }
    else {
        img.src = "../images/default.png";
    }
    img.alt = "Profile pic";
    img.id = "dropdownProfilePicture";
    img.classList.add("img-fluid", "profilePicture");
    let username = document.createElement("span");
    username.id = "profileUsername";
    username.innerText = nev
    a.appendChild(img);
    a.appendChild(username);
    div.appendChild(a);

    let ul = document.createElement('ul');
    ul.classList.add("dropdown-menu", "dropdown-menu-end", "text-small");

    let li = dropdownLink(i18next.t('settingsModal.myAccount'), null, null, "sliders");
    li.addEventListener("click", async function () {
        await showSettingsModal();
    })
    ul.appendChild(li);
    ul.appendChild(dropdownDivider());
    ul.appendChild(dropdownLink(i18next.t('settingsModal.myGames'), null, null, "map"));
    ul.appendChild(dropdownDivider());
    if (link) {
        ul.appendChild(dropdownLink(i18next.t('settingsModal.adminPanel'), 'enterAdmin', null, "shield", link));
        ul.appendChild(dropdownDivider());
    }
    li = dropdownLink(i18next.t('settingsModal.logout'), 'signOut', ["text-danger"], "logout");
    li.addEventListener("click", async function () {
        await kijelentkezes();
    });
    ul.appendChild(li);

    div.appendChild(ul);
    hova.appendChild(div);
}

function dropdownLink(title, id, customClasses, svgName, link = null) {
    let li = document.createElement('li');

    let a = document.createElement('a');
    a.classList.add("dropdown-item");
    if (customClasses) {
        a.classList.add(...customClasses);
    }
    if (id) {
        a.id = id;
    }
    if (link) {
        a.href = link;
    }
    let span = document.createElement('span');
    span.innerText = title;
    a.appendChild(makeSvg(svgName, ["dropdown-icons"], null));
    a.appendChild(span);

    li.appendChild(a);
    return li;
}

function dropdownDivider() {
    let li = document.createElement('li');
    let hr = document.createElement('hr');
    hr.classList.add('dropdown-divider');
    li.appendChild(hr);
    return li;
}

async function kijelentkezes() {
    try {
        let response = await fetch("/api/auth/logout", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let data = await response.json();
        if (!response.ok || !data.success) throw new Error(extractError(data));
        setTimeout(() => {
            location.reload();
        }, 1000);
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

//settings

async function showSettingsModal() {
    let hova = document.getElementById('userData');
    hova.innerHTML = "";

    tempPfp = null;
    let deleteLast = false;

    let data = await getUserData();

    let container = document.createElement('div');
    container.classList.add('container');

    let row = document.createElement("div");
    row.classList.add("row");

    let div = document.createElement("div");
    div.classList.add("col-12", "col-sm-5", "d-flex", "flex-column", "align-items-center");

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
    }
    else {
        objectURL = await getProfilePicture(data.filepath);
        pfp.src = objectURL;
    }
    pfp.alt = "Profile picture";
    pfp.title = "Profile picture";
    pfp.classList.add("img-fluid", "img-thumbnail", "settingsPfp");

    let newPfpInput = inputGeneral("file", null, null, "newPfpInput", ["form-control", "d-none"], false);
    newPfpInput.setAttribute("accept", "image/*");
    newPfpInput.addEventListener("change", async function () {
        if (this.files.length != 0) {
            let file = this.files[0];
            tempPfp = file;

            let preview = await createPreview(file);

            pfp.src = preview;
        }
    });

    let text = document.createElement('p');
    text.innerText = i18next.t('settingsModal.uploadImageText');
    text.classList.add("subtitle", "text-center");

    dropzone.appendChild(pfp);
    dropzone.appendChild(newPfpInput);
    dropzone.appendChild(text);
    dropzone.addEventListener("click", function () {
        newPfpInput.click();
    });
    div.appendChild(dropzone);
    if (data.filepath != null) {
        let deletePfpButton = gombGeneral("button", i18next.t('settingsModal.deleteProfilePicture'), "trash-2", "red", null);
        deletePfpButton.addEventListener("click", async function () {
            pfp.src = "../images/default.png";
            deleteLast = true;
        })
        div.appendChild(deletePfpButton);
    }
    row.appendChild(div);

    div = document.createElement("div");
    div.classList.add("col-12", "col-sm-7");
    div.id = "userTextData";

    let date = new Date(data.created_at);

    div.appendChild(makeSubtitle(`${i18next.t('settingsModal.registeredAt')} ${date.toLocaleString(i18next.language === 'hu' ? 'hu-HU' : 'en-US')}`));

    div.appendChild(makeSubtitle(i18next.t('settingsModal.username')));
    div.appendChild(inputGeneral("text", "mintajancsi123", data.username, "usernameInput", ["form-control"], false));

    div.appendChild(makeSubtitle(i18next.t('settingsModal.email')));
    div.appendChild(inputGeneral("text", "mintajan@gmail.com", data.email, "emailInput", ["form-control"], false));

    let alertPlaceholder = document.createElement('div');
    alertPlaceholder.id = 'passwordAlert';

    let buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add("d-flex", "justify-content-center", "my-3");

    let changePassBtn = gombGeneral("button", i18next.t('settingsModal.requestNewPassword'), null, null, null);
    changePassBtn.classList.add("btn", "btn-purple", "px-5", "rounded-pill", "d-block", "mx-auto");
    changePassBtn.setAttribute('data-bs-toggle', 'collapse');
    changePassBtn.setAttribute('data-bs-target', '#passwordCollapse');

    let collapseDiv = document.createElement('div');
    collapseDiv.className = 'collapse';
    collapseDiv.id = 'passwordCollapse';

    let innerCard = document.createElement('div');
    innerCard.classList.add("d-flex", "flex-column", "border", "rounded", "mt-3", "p-3")

    let passGroup = document.createElement('div');
    passGroup.classList.add('d-flex');
    passGroup.appendChild(labelGeneral('oldPassword', i18next.t('settingsModal.oldPassword'), ['text-nowrap', 'me-3']));
    passGroup.appendChild(inputGeneral('password', null, null, 'oldPassword', ["form-control"], false));
    innerCard.appendChild(passGroup);

    passGroup = document.createElement('div');
    passGroup.classList.add('d-flex');
    passGroup.appendChild(labelGeneral('newPassword', i18next.t('settingsModal.newPassword'), ['text-nowrap', 'me-3']));
    passGroup.appendChild(inputGeneral('password', null, null, 'newPassword', ["form-control"], false));
    innerCard.appendChild(passGroup);

    let saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-success btn-sm w-100';
    saveBtn.innerText = i18next.t('settingsModal.saveButton');
    saveBtn.onclick = jelszoValtoztat;

    innerCard.appendChild(saveBtn);
    collapseDiv.appendChild(innerCard);

    let deleteProfileBtn = gombGeneral("button", i18next.t('settingsModal.deleteAccount'), null, "red", null);
    deleteProfileBtn.addEventListener("click", function () {
        deleteProfile();
    });

    div.appendChild(alertPlaceholder);
    buttonsDiv.appendChild(changePassBtn);
    buttonsDiv.appendChild(deleteProfileBtn);
    div.appendChild(buttonsDiv);
    div.appendChild(collapseDiv);

    document.getElementById('darkMode').checked = (data.darkmode == 1);
    if (data.language) {
        document.getElementById('languageSelect').value = data.language;
    }

    currentSettings = {
        username: data.username,
        email: data.email,
        language: data.language,
        darkmode: document.getElementById('darkMode').checked
    };

    document.getElementById('settingsSave').onclick = async function () {
        try {
            await checkModification();
            if (tempPfp != null) {
                await uploadProfilePic(tempPfp);
            } else {
                if (deleteLast) {
                    await deleteProfilePicture();
                    document.getElementById('dropdownProfilePicture').src = "../images/default.png";
                }
            }
            settingsModal.hide();
        } catch (error) {
            showAlert(error.message);
        }
    }
    row.appendChild(div);
    container.appendChild(row);
    hova.appendChild(container);
    settingsModal.show();
}

async function getUserData() {
    try {
        let response = await fetch('/api/users/me');
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data.users;
    } catch (error) {
        showAlert(error.message);
        throw error;
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

async function checkModification() {
    let valtozas = false;
    let inInput = {
        username: document.getElementById('usernameInput').value,
        email: document.getElementById('emailInput').value,
        language: document.getElementById('languageSelect').value,
        darkmode: document.getElementById('darkMode').checked
    }
    if (inInput.darkmode != currentSettings.darkmode) {
        ejszakaimod();
    }

    if (inInput.language !== currentSettings.language) {
        await i18next.changeLanguage(inInput.language);
        translatePage();
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
        let errors = [];
        if (inInput.username != null && !validalvaUsername(inInput.username)) {
            wrongInput(document.getElementById('usernameInput'));
        }
        if (inInput.email != null && !validalvaEmail(inInput.email)) {
            wrongInput(document.getElementById('emailInput'));
        }
        if (errors.length > 0) {
            throw new Error(errors.join("\n"));
        }

        await saveModification(inInput.username, inInput.email, inInput.language, inInput.darkmode);
    }
}

async function saveModification(username, email, language, darkmode) {
    try {
        let response = await fetch("/api/users/me", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username, email, language, darkmode
            })
        })
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        showAlert("Sikeres módosítás!", "success");
        settingsModal.hide();
        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

async function deleteProfile() {
    try {
        let response = await fetch("/api/users/me", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let data = await response.json();
        if (!response.ok || !data.success) throw new Error(extractError(data));
        showAlert(data.message, "success");
        setTimeout(() => {
            location.reload();
        }, 1000);
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

async function jelszoValtoztat() {
    let passwordCollapse = document.getElementById('passwordCollapse');
    let oldPass = document.getElementById('oldPassword');
    let newPass = document.getElementById('newPassword');

    if (oldPass.value == newPass.value) {
        showAlert('A régi és az új jelszó nem lehet ugyanaz!', 'danger');
        return;
    }
    if (!validalvaJelszo(newPass.value)) {
        showAlert('Az új jelszónak tartalmaznia kell egy nagybetűt, egy számot, minimum 8 és maximum 50 karakter hosszú lehet!', 'danger');
        return;
    }

    try {
        let response = await fetch("/api/users/me/password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                oldPass: oldPass.value,
                newPass: newPass.value
            })
        })
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));

        showAlert(data.message || 'Sikeres jelszómódosítás!', 'success');
        let bsCollapse = bootstrap.Collapse.getInstance(passwordCollapse) || new bootstrap.Collapse(passwordCollapse);
        if (bsCollapse) bsCollapse.hide();
        oldPass.value = '';
        newPass.value = '';
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

//profile picture things

async function getProfilePicture(route) {
    try {
        let response = await fetch(`/api/users/profile-picture?route=${route}`);
        if (!response.ok) {
            let data = await response.json().catch(() => ({}));
            throw new Error(extractError(data));
        }
        let blob = await response.blob();

        let objectURL = URL.createObjectURL(blob);
        return objectURL;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

async function uploadProfilePic(picture) {
    try {
        let fd = new FormData();
        fd.append("profilePic", picture);
        let response = await fetch("/api/users/me/profile-picture", {
            method: "PUT",
            body: fd
        });
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));

        let image = document.getElementById('dropdownProfilePicture');
        if (image) {
            let preview = await createPreview(picture);
            image.src = preview;
        }
        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

async function deleteProfilePicture() {
    try {
        let response = await fetch("/api/users/me/profile-picture", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
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

function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.innerText = i18next.t(key);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(element => {
        const key = element.getAttribute('data-i18n-label');
        element.dataset.label = i18next.t(key) + ':';
    });
    document.documentElement.lang = i18next.language;
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (titleKey) {
        document.title = i18next.t(titleKey);
    }
}

export async function nyelvSzinkronizalas() {
    try {
        let response = await fetch('/api/users/language');
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        await initI18next(data.language);
        return data.language;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

function extractError(data) {
    let errorMessage = "Ismeretlen hiba történt / Unknown error";
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        errorMessage = data.errors.map(e => e.msg || e).join('\n');
    } else if (data.error && Array.isArray(data.error) && data.error.length > 0) {
        errorMessage = data.error.map(e => e.msg || e).join('\n');
    } else if (data.error) {
        errorMessage = data.error;
    } else if (data.message) {
        errorMessage = data.message;
    }
    return errorMessage;
}

let modalElement;
let settingsModal;
let currentSettings;

let objectURL;
let tempPfp;