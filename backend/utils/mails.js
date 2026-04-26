const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "muhahaha2005@gmail.com",
        pass: "jfsd nblp xvsb oyyp",
    },
});

//email texts

const sendWelcomeEmail = async (userEmail, username) => {
    const mailOptions = {
        from: '"Lokea Csapata" <muhahaha2005@gmail.com>',
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

    //törlő link, ha esetleg más csinálta a fiókot az ő emailjével

    return transporter.sendMail(mailOptions);
};

const sendDeleteEmail = async (userEmail, username) => {
    const mailOptions = {
        from: '"Lokea Csapata" <muhahaha2005@gmail.com>',
        to: userEmail,
        subject: "Fiókod törlésre került",
        html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2>Fiókod törölve lett, ${username}!</h2>
            
            <p>Örültünk, ameddig velünk voltál!<br>Lokea csapata</p>
            </div>`
    };

    //visszavonó link, amivel meggondolhatja magát 

    return transporter.sendMail(mailOptions);
};

const sendChangeEmail = async (userEmail, username) => {
    const mailOptions = {
        from: '"Lokea Csapata" <visszaigazolas@lokea.hu>',
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

    //ha más csinálta a változtatásokat, valami visszavonás?

    return transporter.sendMail(mailOptions);
};

const sendPasswordChangeEmail = async (userEmail, username) => {
    const mailOptions = {
        from: '"Lokea Csapata" <visszaigazolas@lokea.hu>',
        to: userEmail,
        subject: "Jelszó mergváltozott",
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

    //ha más csinálta a változtatásokat, valami visszavonás?

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail,
    sendChangeEmail,
    sendPasswordChangeEmail
};