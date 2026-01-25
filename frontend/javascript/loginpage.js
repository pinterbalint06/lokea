document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById('register').addEventListener("click", async function () {
        let username = document.getElementById('regUser');
        let email = document.getElementById('regEmail');
        let jelszo = document.getElementById('regPass');
        if (!validalvaReg(username, email, jelszo)) {
            regisztracio(username, email, jelszo);
        }
    });
    document.getElementById('login').addEventListener("click", async function () {
        let username = document.getElementById('logUser');
        let jelszo = document.getElementById('logPass');
        if (!validalvaBej(username, jelszo)) {
            bejelentkezes(username, jelszo);
        }
    });
});

function validalvaReg(a, b, c) {
    let fail = false;
    let username = a.value;
    let email = b.value;
    let jelszo = c.value;
    if (username.length > 50 || username.length < 1) {
        fail = true;
        a.classList.add("border-danger");
    }
    if (email.length > 250 || email.length < 5 || !isEmail(email)) {
        fail = true;
        b.classList.add("border-danger");
    }
    if (jelszo.length > 50 || jelszo.length < 8 || !isCorrectPassword(password)) {
        fail = true;
        c.classList.add("border-danger");
    }
    return fail;
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

async function regisztracio(username, email, jelszo) {
    try {
        let response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username.value,
                email: email.value,
                password: jelszo.value
            })
        });

        let data = await response.json();
        if (data.success) {
            alert(data.message);
            username.value = "";
            email.value = "";
            jelszo.value = "";
        }
        else {
            let hibak = "";
            if (Array.isArray(data.error)) {
                data.error.forEach(element => {
                    hibak += element.msg + "\n";
                });
            }
            alert(hibak || data.error);
        }
    } catch (error) {
        alert(`hálózati hiba: ${error}`);
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
    if (jelszo.length > 50 || jelszo.length < 8) {
        fail = true;
        b.classList.add("border-danger");
    }
    return fail;
}

async function bejelentkezes(username, jelszo) {
    try {
        let response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username.value,
                password: jelszo.value
            })
        });
        let data = await response.json();
        console.log(data);
        let a = document.createElement('a');
        a.href = "localhost:3000/api/terrain";
        a.innerText = "terrainra";
        document.getElementById('buttons').appendChild(a);
    } catch (error) {
        alert(`hálózati hiba: ${error}`);
    }
}