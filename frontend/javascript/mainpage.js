document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById('loginButton').addEventListener("click", async function (e) {
        e.preventDefault();
        let username = document.getElementById('loginUser');
        let password = document.getElementById('loginPass');
        if (!validalvaBej(username, password)) {
            await bejelentkezes(username, password);
        }
    })
})

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