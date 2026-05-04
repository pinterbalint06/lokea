import { validalvaReg } from "./libs/utils/validations.js";
import { makeSvg } from "./libs/utils/DOMutils.js";

document.addEventListener("DOMContentLoaded", function () {
    modalElement = document.getElementById('modalReg');
    modal = new bootstrap.Modal(modalElement);
    document.getElementById('regButton').addEventListener("click", async function () {
        let username = document.getElementById('regUser');
        let email = document.getElementById('regEmail');
        let jelszo = document.getElementById('regPass');
        if (validalvaReg(username, email, jelszo)) {
            await regisztracioAnimacio(username, email, jelszo);
        }
    });
})

async function regisztracio(username, email, password) {
    try {
        let response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username.value,
                email: email.value,
                password: password.value
            })
        });

        return response;
    } catch (error) {
        regisztralt(error.message);
    }
}

async function regisztracioAnimacio(username, email, password) {
    let container = document.getElementById('regModalContainer');
    let title = document.getElementById('regModalTitle');
    let modalText = document.getElementById('regModalText');
    title.innerHTML = "";
    modalText.innerHTML = "";

    modal.show();
    container.querySelectorAll('svg').forEach(svg => svg.remove());
    container.classList.remove('success-draw', 'error-draw');
    container.appendChild(makeSvg("circle-border", ["progress-svg"], ["progress-circle"]));
    container.classList.add('spinning');

    try {
        let response = await regisztracio(username, email, password);
        let data = await response.json();
        let message = data.message || data.error || data.errors;
        setTimeout(() => {
            container.classList.remove('spinning');
            title.innerHTML = "";
            modalText.innerHTML = "";
            if (response.ok) {
                container.appendChild(makeSvg("checkmark", ["check-svg"], ["mark"]));
                container.classList.add('success-draw');
                container.classList.remove('spinning');
                title.innerText = message;
                modalText.innerText = "Fiók létrehozva. Kérlek, jelentkezz be a folytatáshoz!";
                setTimeout(() => {
                    window.location.href = "/";
                }, 1500);
            }
            else {
                container.appendChild(makeSvg("icon-x", ["check-svg"], ["mark"]));
                container.classList.add('error-draw');
                container.classList.remove('spinning');
                title.innerText = `Regisztrálás sikertelen!`;
                if (Array.isArray(message)) {
                    let errors = message.map(e => e.msg || e).join('<br>');
                    modalText.innerHTML = errors;
                }
                else {
                    modalText.innerText = message;
                }
                setTimeout(() => {
                    modal.hide();
                    container.classList.remove('error-draw');
                }, 1500);
            }
        }, 1000);
    } catch (error) {
        container.classList.remove('spinning');
        title.innerText = "Hiba történt!";
        modalText.innerText = "Nem sikerült elérni a szervert.";
        console.error(error);
    }
}

let modalElement;
let modal;