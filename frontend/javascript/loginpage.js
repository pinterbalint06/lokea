document.addEventListener("DOMContentLoaded", async function() {
    document.getElementById('register').addEventListener("click", async function () {
        let username = document.getElementById('regUser');
        let email = document.getElementById('regEmail');
        let jelszo = document.getElementById('regPass');

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
    });
    document.getElementById('login').addEventListener("click", async function() {
        let username = document.getElementById('logUser');
        let jelszo = document.getElementById('logPass');

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
    });
});
