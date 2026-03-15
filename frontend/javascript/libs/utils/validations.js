export function validalvaReg(user, mail, pass) {
    let fail = false;
    let username = user.value;
    let email = mail.value;
    let password = pass.value;

    if (username.length > 50 || username.length < 1 || !isCorrectUsername(username)) {
        fail = true;
        user.classList.add("border-danger");
        removeBorderDanger(user);
    }
    if (email.length > 250 || email.length < 5 || !isEmail(email)) {
        fail = true;
        mail.classList.add("border-danger");
        removeBorderDanger(mail);
    }
    if (password.length > 50 || password.length < 8 || !isCorrectPassword(password)) {
        fail = true;
        pass.classList.add("border-danger");
        removeBorderDanger(pass);
    }
    return fail;
}

export function validalvaBej(user, pass) {
    let fail = false;
    let username = user.value;
    let password = pass.value;
    if (username.length > 50 || username.length < 1) {
        fail = true;
        user.classList.add("border-danger");
        removeBorderDanger(user);
    }
    if (password.length > 50 || password.length < 8) {
        fail = true;
        pass.classList.add("border-danger");
        removeBorderDanger(pass);
    }
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

function removeBorderDanger(input) {
    input.addEventListener(
        "input",
        () => input.classList.remove("border-danger"),
        { once: true }
    );
}



