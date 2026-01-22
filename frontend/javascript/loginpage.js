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
});

// function ell() {
//     if (felh() && jelsz()) {
//         alert("jo");
//     }
//     else {
//         alert("nem jo");
//     }
// }

// function felh() {
//     let email = document.getElementById("regEmail").value;
//     console.log(email);
//     let szetvalaszt = email.split('@');
//     if (szetvalaszt.length != 2) {
//         return false;
//     }
//     else {
//         let ideiglenes = szetvalaszt[1];
//         szetvalaszt = ideiglenes.split('.');
//         return (szetvalaszt.length > 0 && !szetvalaszt.includes(" "));
//     }
// }

// function jelsz() {
//     let jelszo = document.getElementById('regPass').value;
//     const minLength = 8;
//     const hasUpperCase = /[A-Z]/.test(jelszo);
//     const hasNumber = /[0-9]/.test(jelszo);

//     if (hasUpperCase && hasNumber && jelszo.length >= minLength) {
//         return true;
//     }
//     else {
//         return false;
//     }
// }

// function mutasjel() {
//     var x = document.getElementById("InputPassword");
//     if (x.type === "password") {
//         x.type = "text";
//     } else {
//         x.type = "password";
//   }
// }