import { getUserData, deleteProfile, deleteProfilePicture, uploadProfilePic, userToInactive } from "./fetchs.js";
import { inputGeneral, gombGeneral } from "./utils/domUtils.js";

export async function settingsDisplayre() {
    let hova = document.getElementById('content');
    hova.innerHTML = "";

    let errordiv = document.createElement('div');
    errordiv.id = 'errorLocation';
    errordiv.classList.add('d-none');

    let tempPfp = null;
    let deleteLast = false;

    let data = await getUserData();

    let container = document.createElement('div');
    container.classList.add('container');

    let row = document.createElement("div");
    row.classList.add("row", "p-5");

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

    div.appendChild(makeSubtitle("Éjszakai mód"));
    checkbox = inputGeneral("checkbox", null, null, "darkMode", null, false);
    checkbox.checked = (data.darkmode == 1);
    div.appendChild(checkbox);

    currentSettings = {
        username: data.username,
        email: data.email,
        is_2fa: data.is_2fa,
        // language: document.getElementById('languageSelect').value,
        darkmode: data.darkmode == 1
    }

    let settingsSave = gombGeneral("button", "Save", null, "green", null);
    settingsSave.addEventListener("click", async function () {
        try {
            await checkModification();
            if (tempPfp != null) {
                await uploadProfilePic(tempPfp);
            }
            else {
                if (deleteLast) {
                    await deleteProfilePicture();
                }
            }
        } catch (error) {
            let errorText = document.createElement('p');
            errorText.innerText = error.message;
            let errorBtn = document.createElement('button');
            errorBtn.classList.add('close-btn');
            errorBtn.addEventListener("click", function () {
                let errordiv = document.getElementById('errorLocation');
                errordiv.className = 'd-none';
                errordiv.innerHTML = "";
            })
            errorBtn.appendChild(makeSvg("icon-x", null));
            errordiv.appendChild(errorText);
            errordiv.appendChild(errorBtn);
            errordiv.className = "d-flex";
        }
    })
    row.appendChild(div);
    row.appendChild(settingsSave);
    container.appendChild(row);
    hova.appendChild(errordiv);
    hova.appendChild(container);
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
        let response = await fetch("/api/updateUser", {
            method: "PUT",
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
                let hiba;
                for (let i = 0; i < data.error.length; i++) {
                    let li = document.createElement('li');
                    hiba = data.error[i].msg;
                    li.innerText = `${data.error[i].path}: ${hiba}`;
                    ul.appendChild(li);
                }
                errordiv.appendChild(ul);
                throw new Error(hiba);
            }
        }
        else {
            alert("Sikeres módositás!"); //atmeneti
            settingsModal.hide();
        }
    } catch (error) {
        throw error;
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

function makeSubtitle(text) {
    let subtitle = document.createElement('h5');
    subtitle.classList.add("subtitle");
    subtitle.innerText = text;
    return subtitle;
}

function labelGeneral(id, text, classes) {
    let label = document.createElement('label');
    label.setAttribute('for', id);
    label.innerText = text;
    if (classes != null) {
        label.classList.add(...classes);
    }
    return label;
}

let settingsModal;
let currentSettings;
let objectURL;
let tempPfp;