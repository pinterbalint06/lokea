document.addEventListener("DOMContentLoaded", async function () {
    if (!await logined()) {
        document.getElementById('loginButton').addEventListener("click", async function (e) {
            e.preventDefault();
            let username = document.getElementById('loginUser');
            let password = document.getElementById('loginPass');
            if (!validalvaBej(username, password)) {
                await bejelentkezes(username, password, document.getElementById('rememberMe').checked);
            }
        })
    }
    else {
        modalElement = document.getElementById('settingsModal');
        settingsModal = new bootstrap.Modal(modalElement);
    }

})

async function logined() {
    try {
        console.log("halo")
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
    a.appendChild(makeSvg(svgName, "dropdown-icons"));
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

function inputGeneral(type, placeholder, value, id, osztalyok, disabled) {
    let input = document.createElement('input');
    input.type = type;
    if (placeholder != null) {
        input.placeholder = placeholder;
    }
    if (value != null) {
        input.value = value;
    }
    input.id = id;
    if (osztalyok != null) {
        input.classList.add(...osztalyok);
    }
    input.disabled = disabled;
    return input;
}

function gombGeneral(type, text, svg, color, id) {
    let button = document.createElement('button');
    button.type = type;
    if (svg == null) {
        button.innerText = text;
    }
    else {
        button.appendChild(makeSvg(svg, "buttonIcon"));
        let textNode = document.createTextNode(text);
        button.appendChild(textNode);
    }

    if (id != null) {
        button.id = id;
    }
    button.classList.add('btn');
    switch (color) {
        case "red":
            button.classList.add('btn-danger');
            break;
        case "blue":
            button.classList.add('btn-primary');
            break;
        case "lightblue":
            button.classList.add('btn-info');
            break;
        case "green":
            button.classList.add('btn-success');
            break;
        case "link":
            button.classList.add('btn-link');
            break;
    }
    return button;
}

function makeSvg(name, className) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add(className);
    let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `../images/icons/sprite.svg#${name}`);

    svg.appendChild(use);
    return svg;
}

function makeSubtitle(text) {
    let subtitle = document.createElement('h5');
    subtitle.classList.add("subtitle");
    subtitle.innerText = text;
    return subtitle;
}

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

async function uploadProfilePic(picture, id) {
    let fd = new FormData();
    fd.append("profilePic", picture);
    fd.append("user_id", id);
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

async function deleteProfilePicture(id) {
    try {
        let response = await fetch("/api/deleteProfilePic", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: id
            })
        });

        if (response.ok) {
            console.log("sikerult a torles");
        }
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

function validalvaBej(a, b) {
    let fail = false;
    let username = a.value;
    let jelszo = b.value;
    if (username.length > 50 || username.length < 1) {
        fail = true;
        a.classList.add("border-danger");
    }
    else {
        a.classList.remove("border-danger");
    }
    if (jelszo.length > 50 || jelszo.length < 8) {
        fail = true;
        b.classList.add("border-danger");
    }
    else {
        b.classList.remove("border-danger");
    }
    console.log(fail);
    return fail;
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
            alert(data.message);
        }
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

function bejelentkezett(username) {
    let form = document.getElementById('loginForm');
    let container = document.getElementById('loginContainer');
    let title = document.getElementById('loginTitle');

    container.classList.add('spinning');
    container.classList.add('success-draw');
    title.innerText = `Üdvözöljük, ${username}!`;
    title.classList.replace("h5", "h2");
    form.classList.add('collapse-out');
    setTimeout(() => {
        container.classList.remove('spinning');
        form.innerHTML = "";
        setTimeout(() => {
            location.reload();
        }, 3000);
    }, 500);
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

async function showSettingsModal() {
    let hova = document.getElementById('userData');
    let errordiv = document.getElementById('errorLocation');
    hova.innerHTML = "";
    errordiv.classList.add('d-none');

    let data = await getUserData();

    let container = document.createElement('div');
    container.classList.add('container');

    let row = document.createElement("div");
    row.classList.add("row");

    let div = document.createElement("div");
    div.classList.add("col-4");
    //kimasolt adminbol!
    // let pfp = document.createElement("img");
    // let deletePfpButton;
    // if (data.filepath == null) {
    //     pfp.src = "../images/default.png";
    // }
    // else {
    //     objectURL = await getProfilePicture(data.filepath);
    //     pfp.src = objectURL;
    //     deletePfpButton = gombGeneral("button", "Profilkép törlése", "trash-2", "red", null);
    //     deletePfpButton.addEventListener("click", async function () {
    //         await deleteProfilePicture(user_id);
    //     })
    // }
    // pfp.alt = "Profile picture";
    // pfp.title = "Profile picture";
    // pfp.classList.add("img-fluid", "img-thumbnail", "rounded-circle", "h-75"
    // );

    // let newPfpInput = inputGeneral("file", null, null, "newPfpInput", ["form-control"], false);
    // newPfpInput.setAttribute("accept", "image/*");
    // let newPfpButton = gombGeneral("button", "Profilkép feltöltése", "upload", "green", null);
    // newPfpButton.addEventListener("click", async function () {
    //     let feltoltott = document.getElementById('newPfpInput');
    //     if (feltoltott.files.length === 0) {
    //         alert("Kérlek, válassz ki egy képet!");
    //     }
    //     else {
    //         await uploadProfilePic(feltoltott.files[0]);
    //     }
    // })

    // let pfpTitle = document.createElement("h6");
    // pfpTitle.textContent = data.username;

    // div.appendChild(pfp);
    // div.appendChild(newPfpInput);
    // div.appendChild(newPfpButton);
    // if (pfproute != null) {
    //     div.appendChild(deletePfpButton);
    // }
    // div.appendChild(pfpTitle);
    row.appendChild(div);

    div = document.createElement("div");
    div.classList.add("col-8");

    let date = new Date(data.created_at);

    hova.appendChild(makeSubtitle(`Regisztrált: ${date.toLocaleString("hu-HU")}`));

    hova.appendChild(makeSubtitle("Felhasználónév"));
    hova.appendChild(inputGeneral("text", "mintajancsi123", data.username, "usernameInput", ["form-control"], false));

    hova.appendChild(makeSubtitle("E-mail-cim"));
    hova.appendChild(inputGeneral("text", "mintajan@gmail.com", data.email, "emailInput", ["form-control"], false));

    hova.appendChild(makeSubtitle("Jelszó"));
    hova.appendChild(inputGeneral("password", null, data.password, "passwordInput", ["form-control"], false)); //nem adunk vissza jelszot
    let newPassBtn = gombGeneral("button", "Új jelszó igénylése", null, null, null);
    newPassBtn.classList.add("btn", "btn-purple", "px-5", "rounded-pill");
    newPassBtn.addEventListener("click", async function () {
        //ide a uj jelszo igenyles function
    })
    hova.appendChild(newPassBtn);

    hova.appendChild(makeSubtitle("Két lépcsős azonositás"));
    let checkbox = inputGeneral("checkbox", null, null, "is2faInput", null, false);
    checkbox.checked = data.is_2fa;
    hova.appendChild(checkbox);

    currentSettings = {
        username: data.username,
        email: data.email,
        is_2fa: data.is_2fa,
        language: document.getElementById('languageSelect').value,
        darkmode: document.getElementById('darkMode').checked
    }

    document.getElementById('settingsSave').onclick = async function () {
        await checkModification();
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

async function checkModification() {
    let valtozas = false;
    let inInput = {
        username: document.getElementById('usernameInput').value,
        email: document.getElementById('emailInput').value,
        is_2fa: document.getElementById('is2faInput').checked,
        language: document.getElementById('languageSelect').value,
        darkmode: document.getElementById('darkMode').checked
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
        console.log('van valtozas!')
        await saveModification(inInput.username, inInput.email, inInput.is_2fa, inInput.language, inInput.darkmode);
    }
    else {
        console.log('nincs valtozas!');
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

let modalElement;
let settingsModal;
let currentSettings;