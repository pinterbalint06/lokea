import { validalvaReg } from "./libs/utils/validations.js";
import { makeSvg } from "./libs/utils/DOMutils.js";

document.addEventListener("DOMContentLoaded", function () {
    modalElement = document.getElementById('modalReg');
    modal = new bootstrap.Modal(modalElement);
    document.getElementById('regButton').addEventListener("click", async function () {
        let username = document.getElementById('regUser');
        let email = document.getElementById('regEmail');
        let jelszo = document.getElementById('regPass');
        let is2fa = document.getElementById('twofactorCheckbox');
        if (validalvaReg(username, email, jelszo)) {
            regisztracio(username, email, jelszo, is2fa);
        }
    });
})

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

let modalElement;
let modal;