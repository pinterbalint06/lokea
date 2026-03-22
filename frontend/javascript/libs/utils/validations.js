export function validalvaReg(user, mail, pass) {
    let fail = false;
    let username = user.value;
    let email = mail.value;
    let password = pass.value;

    if (!validalvaUsername(username)) {
        fail = true;
        wrongInput(user);
    }
    if (!validalvaEmail(email)) {
        fail = true;
        wrongInput(mail);
    }
    if (!validalvaJelszo(password)) {
        fail = true;
        wrongInput(pass);
    }
    return !fail;
}

export function validalvaBej(user, pass) {
    let fail = false;
    let username = user.value;
    let password = pass.value;
    if (username.length > 50 || username.length < 1) {
        wrongInput(user);
    }
    if (password.length > 50 || password.length < 8) {
        fail = true;
        wrongInput(pass);
    }
    return !fail;
}

export function validalvaUsername(username) {
    return username.length < 50 && username.length > 1 && isCorrectUsername(username);
}

export function validalvaEmail(email) {
    return email.length < 250 && email.length > 5 && isEmail(email);
}

export function validalvaJelszo(password) {
    return password.length < 50 && password.length > 8 && isCorrectPassword(password);
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

export function wrongInput(input) {
    input.classList.add("border-danger")
    input.addEventListener(
        "input",
        () => input.classList.remove("border-danger"),
        { once: true }
    );
}



