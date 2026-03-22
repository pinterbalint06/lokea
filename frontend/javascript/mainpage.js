import { makeSubtitle, inputGeneral, labelGeneral, gombGeneral, makeSvg } from "./libs/utils/DOMutils.js";
import { validalvaBej, validalvaUsername, validalvaEmail, validalvaJelszo, wrongInput } from "./libs/utils/validations.js";
import { initSocket } from "./libs/utils/socketio.js";

document.addEventListener("DOMContentLoaded", async function () {
    if (!await isLogined()) {
        document.getElementById('loginButton').addEventListener("click", async function (e) {
            e.preventDefault();
            let username = document.getElementById('loginUser');
            let password = document.getElementById('loginPass');
            if (validalvaBej(username, password)) {
                await bejelentkezes(username, password, document.getElementById('rememberMe').checked);
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
    try {
        let response = await fetch("/api/loginRole");
        let data = await response.json();
        if (response.ok) {
            if (data.login) {
                if (data.adminLink) {
                    await dropdownLetrehoz(data.adminLink, data.user[0].username, data.user[0].filepath);
                }
                else {
                    await dropdownLetrehoz(null, data.user[0].username, data.user[0].filepath);
                }
                let body = document.body;
                console.log(data)
                if (data.user[0].darkmode == 1) {
                    body.setAttribute('data-bs-theme', 'dark');
                }
                else {
                    body.setAttribute('data-bs-theme', 'light');
                }
            }
            else {
                if (data.error) {
                    console.log(error);
                }
            }
        }

        return data.login;
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

async function bejelentkezes(username, jelszo, remember) {
    try {
        let response = await fetch("/api/login", {
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
        let data = await response.json();
        console.log(data)
        if (response.ok) {
            bejelentkezett(data.username);
        }
        else {
            bejelentkezett(data.username, data.error_code, data.message);
        }
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

function bejelentkezett(username, hibakod = null, hibauzenet = "") {
    let form = document.getElementById('loginForm');
    let container = document.getElementById('loginContainer');
    let title = document.getElementById('loginTitle');
    let modalText = document.getElementById('logText');
    title.innerHTML = "";
    modalText.innerHTML = "";

    if (hibakod == null) {
        container.querySelectorAll('svg').forEach(svg => svg.remove());
        container.appendChild(makeSvg("circle-border", "progress-svg", "progress-circle"));
        container.appendChild(makeSvg("checkmark", "check-svg", "mark"));

        container.classList.add('spinning');

        setTimeout(() => {
            container.classList.add('success-draw');
            container.classList.remove('spinning');
            title.innerText = `Sikeres bejelentkezés!`;
            title.classList.replace("h5", "h2");
            form.classList.add('collapse-out');
            modalText.innerText = `Üdv, ${username}!`;

            setTimeout(() => {
                location.reload();
            }, 3000);
        }, 1000);
    }
    else {
        container.querySelectorAll('svg').forEach(svg => svg.remove());
        container.appendChild(makeSvg("circle-border", "progress-svg", "progress-circle"));
        container.appendChild(makeSvg("icon-x", "check-svg", "mark"));

        container.classList.add('spinning');
        setTimeout(() => {
            container.classList.add('error-draw');
            container.classList.remove('spinning');
            title.innerText = `Bejelentkezés sikertelen! (Error ${hibakod})`;
            form.classList.add('collapse-out');
            modalText.innerText = hibauzenet;
            setTimeout(() => {
                form.classList.remove('collapse-out');
                form.classList.add('collapse-in');
                container.classList.remove('error-draw');
                title.innerText = `Bejelentkezés`;
                modalText.innerText = "";
            }, 2000);
        }, 1000);
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
    img.classList.add("img-fluid", "profilePicture");
    let username = document.createElement("span");
    username.id = "profileUsername";
    username.innerText = nev
    a.appendChild(img);
    a.appendChild(username);
    div.appendChild(a);

    let ul = document.createElement('ul');
    ul.classList.add("dropdown-menu", "dropdown-menu-end", "text-small");

    let li = dropdownLink("Fiókom", null, null, "sliders");
    li.addEventListener("click", async function () {
        await showSettingsModal();
    })
    ul.appendChild(li);
    ul.appendChild(dropdownDivider());
    ul.appendChild(dropdownLink("Saját játékaim", null, null, "map"));
    ul.appendChild(dropdownDivider());
    if (link) {
        li = dropdownLink("Belépés az admin oldalra", 'enterAdmin', null, "shield")
        li.href = link;
        ul.appendChild(li);
        ul.appendChild(dropdownDivider());
    }
    li = dropdownLink("Kijelentkezés", 'signOut', ["text-danger"], "logout");
    li.addEventListener("click", async function () {
        await kijelentkezes();
    });
    ul.appendChild(li);

    div.appendChild(ul);
    hova.appendChild(div);
}

function dropdownLink(title, id, customClasses, svgName) {
    let li = document.createElement('li');

    let a = document.createElement('a');
    a.classList.add("dropdown-item");
    if (customClasses) {
        a.classList.add(...customClasses);
    }
    if (id) {
        a.id = id;
    }
    let span = document.createElement('span');
    span.innerText = title;
    a.appendChild(makeSvg(svgName, "dropdown-icons", null));
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
        let response = await fetch("/api/signout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let data = await response.json();
        if (data.success) {
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
        else {
            console.error("baj a kijelentkezésben, baj: " + data.error);
        }

    } catch (error) {
        console.error(`hálózati hiba: ${error}`);
    }
}

//settings

async function showSettingsModal() {
    let hova = document.getElementById('userData');
    let errordiv = document.getElementById('errorLocation');
    hova.innerHTML = "";
    errordiv.classList.add('d-none');
    let tempPfp = null;
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
    text.innerText = "Kép feltöltéshez kattints ide, vagy húzz be egy képet!";
    text.classList.add("subtitle", "text-center");

    dropzone.appendChild(pfp);
    dropzone.appendChild(newPfpInput);
    dropzone.appendChild(text);
    dropzone.addEventListener("click", function () {
        newPfpInput.click();
    });
    div.appendChild(dropzone);
    if (data.filepath != null) {
        let deletePfpButton = gombGeneral("button", "Profilkép törlése", "trash-2", "red", null);
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

    div.appendChild(makeSubtitle(`Regisztrált: ${date.toLocaleString("hu-HU")}`));

    div.appendChild(makeSubtitle("Felhasználónév"));
    div.appendChild(inputGeneral("text", "mintajancsi123", data.username, "usernameInput", ["form-control"], false));

    div.appendChild(makeSubtitle("E-mail-cim"));
    div.appendChild(inputGeneral("text", "mintajan@gmail.com", data.email, "emailInput", ["form-control"], false));

    let alertPlaceholder = document.createElement('div');
    alertPlaceholder.id = 'passwordAlert';

    let buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add("d-flex", "justify-content-center", "my-3");

    let changePassBtn = gombGeneral("button", "Új jelszó igénylése", null, null, null);
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
    passGroup.appendChild(labelGeneral('oldPassword', 'Régi jelszó:', ['text-nowrap', 'me-3']));
    passGroup.appendChild(inputGeneral('password', null, null, 'oldPassword', ["form-control"], false));
    innerCard.appendChild(passGroup);

    passGroup = document.createElement('div');
    passGroup.classList.add('d-flex');
    passGroup.appendChild(labelGeneral('newPassword', 'Új jelszó:', ['text-nowrap', 'me-3']));
    passGroup.appendChild(inputGeneral('password', null, null, 'newPassword', ["form-control"], false));
    innerCard.appendChild(passGroup);

    let saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-success btn-sm w-100';
    saveBtn.innerText = 'Mentés';
    saveBtn.onclick = jelszoValtoztat;

    innerCard.appendChild(saveBtn);
    collapseDiv.appendChild(innerCard);

    let deleteProfileBtn = gombGeneral("button", "Fiók törlése", null, "red", null);
    deleteProfileBtn.addEventListener("click", function () {
        deleteProfile();
    });

    div.appendChild(alertPlaceholder);
    buttonsDiv.appendChild(changePassBtn);
    buttonsDiv.appendChild(deleteProfileBtn);
    div.appendChild(buttonsDiv);
    div.appendChild(collapseDiv);


    div.appendChild(makeSubtitle("Két lépcsős azonositás"));
    let checkbox = inputGeneral("checkbox", null, null, "is2faInput", null, false);
    checkbox.checked = data.is_2fa;
    div.appendChild(checkbox);

    document.getElementById('darkMode').checked = (data.darkmode == 1);

    currentSettings = {
        username: data.username,
        email: data.email,
        is_2fa: data.is_2fa,
        language: document.getElementById('languageSelect').value,
        darkmode: document.getElementById('darkMode').checked
    }

    document.getElementById('settingsSave').onclick = async function () {
        await checkModification();
        if (tempPfp != null) {
            await uploadProfilePic(tempPfp);
        }
        else {
            if (deleteLast) {
                await deleteProfilePicture();
            }
        }
        settingsModal.hide();
    }

    row.appendChild(div);
    container.appendChild(row);
    hova.appendChild(container);
    settingsModal.show();
}

async function getUserData() {
    try {
        let response = await fetch('/api/getUserData');
        if (response.ok) {
            let data = await response.json();
            return data.users;
        }
        else {
            throw new Error("baj");
        }
    } catch (error) {
        console.error(error);
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
        is_2fa: document.getElementById('is2faInput').checked,
        language: document.getElementById('languageSelect').value,
        darkmode: document.getElementById('darkMode').checked
    }
    if (inInput.darkmode != currentSettings.darkmode) {
        ejszakaimod();
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
            await saveModification(inInput.username, inInput.email, inInput.is_2fa, inInput.language, inInput.darkmode);
        }
    }
}

async function saveModification(username, email, is_2fa, language, darkmode) {
    try {
        console.log(username, email, is_2fa, language, darkmode)
        let response = await fetch("/api/updateUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username, email, is_2fa, language, darkmode
            })
        })
        let data = await response.json();
        if (!response.ok) {
            if (data.error) {
                let errordiv = document.getElementById('errorLocation');
                errordiv.classList.remove('d-none');
                errordiv.innerHTML = "";
                let ul = document.createElement('ul');
                for (let i = 0; i < data.error.length; i++) {
                    let li = document.createElement('li');
                    li.innerText = `${data.error[i].path}: ${data.error[i].msg}`;
                    ul.appendChild(li);
                }
                errordiv.appendChild(ul);
            }
        }
        else {
            alert("Sikeres módositás!"); //atmeneti
            settingsModal.hide();
        }
    } catch (error) {
        console.log(error);
    }
}

async function deleteProfile() {
    try {
        let response = await fetch("/api/inactiveUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let data = await response.json();
        if (data.success) {
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
        else {
            console.error("baj a törlésben, baj: " + data.error);
        }

    } catch (error) {
        console.error(`hálózati hiba: ${error}`);
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
            try {
                let response = await fetch("/api/updatePassword", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        oldPass: oldPass.value,
                        newPass: newPass.value
                    })
                })
                let data = await response.json();
                if (response.ok) {
                    newAlert = createAlert('Sikeres jelszómódosítás!', 'success');
                    let bsCollapse = bootstrap.Collapse.getInstance(passwordCollapse) || new bootstrap.Collapse(passwordCollapse);
                    bsCollapse.hide();
                    oldPass.value = '';
                    newPass.value = '';
                }
                else {
                    let hibaUzenet = '';

                    if (data.error && Array.isArray(data.error)) {
                        hibaUzenet = data.error.map(err => err.msg).join('<br>');
                        newAlert = createAlert(`Hiba! Az alábbi követelmények nem teljesülnek!<br>${hibaUzenet}`, 'danger');
                    } else {
                        hibaUzenet = data.message || 'Ismeretlen hiba történt!';
                        newAlert = createAlert(`Hiba! ${hibaUzenet}`, 'danger');
                    }
                }
            } catch (error) {
                newAlert = createAlert('Nem sikerült elérni a szervert!', 'danger');
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

//profile picture things

async function getProfilePicture(route) {
    try {
        let response = await fetch(`/api/getProfilePic?route=${route}`);
        let blob = await response.blob();

        let objectURL = URL.createObjectURL(blob);
        return objectURL;
    } catch (error) {
        console.log(error);
    }
}

async function uploadProfilePic(picture) {
    let fd = new FormData();
    fd.append("profilePic", picture);
    try {
        let response = await fetch("/api/updateProfilePic", {
            method: "POST",
            body: fd
        });

        if (response.ok) {
            console.log("sikerult a feltoltes");
        }
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

async function deleteProfilePicture() {
    try {
        let response = await fetch("/api/deleteProfilePic", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (response.ok) {
            console.log("sikerult a torles");
        }
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

async function createPreview(file) {

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.src = url;

    await new Promise(res => img.onload = res);

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

let modalElement;
let settingsModal;
let currentSettings;
let objectURL;
let tempPfp;