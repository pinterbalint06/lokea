const nodemailer = require("nodemailer");

let transporter = null;

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("FIGYELMEZTETÉS: EMAIL_USER és EMAIL_PASS környezeti változók nincsenek beállítva. E-mail küldéskor hiba fog fellépni!");
} else {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

//email texts

const sendWelcomeEmail = async (userEmail, username) => {
    if (!transporter) {
        console.warn("E-mail küldés sikertelen: Hiányzó környezeti változók!");
        return;
    }
    const mailOptions = {
        from: `"Lokea Csapata" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Üdvözlünk a Lokeában! 🌍",
        html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Sikeres regisztráció, üdv a Lokeában <strong>${username}</strong>!</h2>
            
            <p>Örülünk, hogy csatlakoztál! Próbáld ki játékmódjainkat még ma, ahol utazás nélkül járhatod be a világot, a felhasználók által létrehozott pályákon!</p>
            
            <div style="margin: 30px 0;">
                <a href="https://localhost:3000/main" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Irány a játék!</a>
            </div>
            </div>`
    };

    return transporter.sendMail(mailOptions).catch(e => console.error(e));
};

const sendDeleteEmail = async (userEmail, username) => {
    if (!transporter) {
        console.warn("E-mail küldés sikertelen: Hiányzó környezeti változók!");
        return;
    }
    const mailOptions = {
        from: `"Lokea Csapata" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Fiókod törlésre került",
        html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Fiókod törölve lett, ${username}!</h2>
            
            <p>Örültünk, ameddig velünk voltál!<br>Lokea csapata</p>
            </div>`
    };

    return transporter.sendMail(mailOptions).catch(e => console.error(e));
};

const sendChangeEmail = async (userEmail, username) => {
    if (!transporter) {
        console.warn("E-mail küldés sikertelen: Hiányzó környezeti változók!");
        return;
    }
    const mailOptions = {
        from: `"Lokea Csapata" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Fiókváltozatások",
        html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Fiókadatok változása</h2>
            
            <p>Szia ${username}! Fiókodban változások történtek, ez egy automatikus email.</p>

            <div style="margin: 30px 0;">
                <a href="https://localhost:3000/main" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Irány a játék!</a>
            </div>

            <p>Lokea csapata</p>
            </div>`
    };

    return transporter.sendMail(mailOptions).catch(e => console.error(e));
};

const sendPasswordChangeEmail = async (userEmail, username) => {
    if (!transporter) {
        console.warn("E-mail küldés sikertelen: Hiányzó környezeti változók!");
        return;
    }
    const mailOptions = {
        from: `"Lokea Csapata" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Jelszó megváltozott",
        html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Jelszavad megváltozott</h2>
            
            <p>Szia ${username}! A jelszavad megváltozott, ez egy automatikus email.</p>

            <div style="margin: 30px 0;">
                <a href="https://localhost:3000/main" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Irány a játék!</a>
            </div>

            <p>Lokea csapata</p>
            </div>`
    };

    return transporter.sendMail(mailOptions).catch(e => console.error(e));
};

module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail,
    sendChangeEmail,
    sendPasswordChangeEmail
};