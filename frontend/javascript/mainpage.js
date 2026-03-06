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
    ul.appendChild(dropdownLink("Fiókom", null, null, "sliders"));
    ul.appendChild(dropdownDivider());
    ul.appendChild(dropdownLink("Saját játékaim", null, null, "map"));
    ul.appendChild(dropdownDivider());
    if (link) {
        ul.appendChild(dropdownLink("Belépés az admin oldalra", 'enterAdmin', null, "shield"));
        ul.appendChild(dropdownDivider());
    }

    ul.appendChild(dropdownLink("Kijelentkezés", 'signOut', ["text-danger"], "logout"));

    div.appendChild(ul);
    hova.appendChild(div);

    if (link) {
        document.getElementById('enterAdmin').href = link;
    } //javitani!

    document.getElementById('signOut').addEventListener("click", async function () {
        await kijelentkezes()
    });
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

function makeSvg(name, className) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add(className);
    let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `../images/icons/sprite.svg#${name}`);

    svg.appendChild(use);
    return svg;
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