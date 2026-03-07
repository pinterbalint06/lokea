document.addEventListener("DOMContentLoaded", function () {
    modalElement = document.getElementById('modalReg');
    modal = new bootstrap.Modal(modalElement);
    document.getElementById('regButton').addEventListener("click", async function () {
        let username = document.getElementById('regUser');
        let email = document.getElementById('regEmail');
        let jelszo = document.getElementById('regPass');
        let is2fa = document.getElementById('twofactorCheckbox');
        if (!validalvaReg(username.value, email.value, jelszo.value)) {
            regisztracio(username, email, jelszo, is2fa);
        }
    });
})

function validalvaReg(username, email, password) {
    let fail = false;

    if (username.length > 50 || username.length < 1 || !isCorrectUsername(username)) {
        fail = true;
    }
    if (email.length > 250 || email.length < 5 || !isEmail(email)) {
        fail = true;
    }
    if (password.length > 50 || password.length < 8 || !isCorrectPassword(password)) {
        fail = true;
    }
    console.log(fail)
    return fail;
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

async function regisztracio(username, email, password, is2fa) {
    try {
        let response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username.value,
                email: email.value,
                password: password.value,
                is2fa
            })
        });

        let data = await response.json();
        if (data.success) {
            username.value = "";
            email.value = "";
            password.value = "";
            regisztralt();
        }
        else {
            regisztralt(data.error_code, data.message);
        }
    } catch (error) {
        regisztralt(500, error.message);
    }
}

function regisztralt(hibakod = null, hibauzenet = "") {
    let container = document.getElementById('regModalContainer');
    let title = document.getElementById('regModalTitle');
    let modalText = document.getElementById('regModalText');
    title.innerHTML = "";
    modalText.innerHTML = "";
    
    modal.show();
    
    if (hibakod == null) {
        container.querySelectorAll('svg').forEach(svg => svg.remove());
        container.appendChild(makeSvg("circle-border", "progress-svg", "progress-circle"));
        container.appendChild(makeSvg("checkmark", "check-svg", "mark"));

        container.classList.add('spinning');
        
        
        setTimeout(() => {
            container.classList.add('success-draw');
            container.classList.remove('spinning');
            title.innerText = `Sikeres regisztráció!`;
            modalText.innerText = "Fiók létrehozva. Kérlek, jelentkezz be a folytatáshoz!";
            setTimeout(() => {
                window.location.href = "/main";
            }, 3000);
        }, 2000);
    }
    else {
        container.querySelectorAll('svg').forEach(svg => svg.remove());
        container.appendChild(makeSvg("circle-border", "progress-svg", "progress-circle"));
        container.appendChild(makeSvg("icon-x", "check-svg", "mark"));

        container.classList.add('spinning');
        setTimeout(() => {
            container.classList.add('error-draw');
            container.classList.remove('spinning');
            title.innerText = `Regisztálás sikertelen! (Error ${hibakod})`;
            modalText.innerText = hibauzenet;
            setTimeout(() => {
                modal.hide();
                container.classList.remove('error-draw');
            }, 3000);
        }, 2000);
    }
}

function makeSvg(name, svgclasses, useclasses) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add(svgclasses);
    let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.classList.add(useclasses);
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `../images/icons/sprite.svg#${name}`);

    svg.appendChild(use);
    return svg;
}

let modalElement;
let modal;