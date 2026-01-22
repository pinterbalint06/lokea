function ell() {
    if (felh() && jelsz()) {
        alert("jo");
    }
    else {
        alert("nem jo");
    }
}

function felh() {
    let email = document.getElementById("regEmail").value;
    console.log(email);
    let szetvalaszt = email.split('@');
    if (szetvalaszt.length != 2) {
        return false;
    }
    else {
        let ideiglenes = szetvalaszt[1];
        szetvalaszt = ideiglenes.split('.');
        return (szetvalaszt.length > 0 && !szetvalaszt.includes(" "));
    }
}

function jelsz() {
    let jelszo = document.getElementById('regPass').value;
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(jelszo);
    const hasNumber = /[0-9]/.test(jelszo);

    if (hasUpperCase && hasNumber && jelszo.length >= minLength) {
        return true;
    }
    else {
        return false;
    }
}

function mutasjel() {
    var x = document.getElementById("InputPassword");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
  }
}