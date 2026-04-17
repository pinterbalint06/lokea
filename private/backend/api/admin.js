const express = require('../../../backend/node_modules/express');
const router = express.Router();
const database = require('../sql/database.js');
const auth = require('../auth.js');
const fs = require('fs/promises');
const bcrypt = require('../../../backend/node_modules/bcrypt');
const validator = require('../../../backend/node_modules/validator');
const { body, validationResult } = require('../../../backend/node_modules/express-validator');
const sharp = require('../../../backend/node_modules/sharp');
const { sendWelcomeEmail, sendChangeEmail, sendDeleteEmail } = require('../../../backend/mails.js');
const { Chart, registerables } = require('../../../backend/node_modules/chart.js');
const { Canvas } = require('../../../backend/node_modules/skia-canvas');

//!Multer
const multer = require('../../../backend/node_modules/multer'); //?npm install multer
const path = require('path');
const TARGET_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.resolve(process.cwd(), 'uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

Chart.register(...registerables);

//Endpoints - admin

router.post("/signupFromAdmin",
    [
        body("username")
            .not().isEmail().withMessage("Felhasználónév nem lehet email cim!")
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage('A felhasználónév csak betűket, számokat, - vagy _ karaktert, és ékezetes betűket tartalmazhat.')
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 250 }).withMessage("Email max 250 karakter"),
        body("password")
            .isLength({ min: 8, max: 50 }).withMessage("Jelszó hossza 8-50")
            .matches(/\d/).withMessage("Kell benne szám")
            .matches(/[A-Z]/).withMessage("Kell benne nagybetű"),
        body("is_2fa")
            .isBoolean().withMessage("Nem kapott értéket a kétlépcsős azonosítás!")
    ],
    async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    error: errors.array()
                });
            }
            else {
                const { username, email, password, role, is_2fa } = request.body;
                const hashedPassword = await bcrypt.hash(password, 10);
                let insert = await database.newUserFromAdmin(username, email, hashedPassword, role, is_2fa);
                if (insert.success) {
                    let userid = insert.insertId;
                    await database.addLog(userid, 'Sign up (A)');
                    // await sendWelcomeEmail(email, username);
                    response.status(201).json({
                        success: true,
                        message: "Sikeres regisztráció!"
                    });
                }
                else {
                    response.status(500).json({
                        success: false,
                        message: insert.error
                    })
                }
            }
        } catch (error) {
            response.status(500).json({ error: "Hiba az adatbázis művelet során!" });
        }
    }
);

router.get('/users', async (request, response) => {
    try {
        let users = await database.getUsers();
        response.status(200).json({ users: users.rows, total: users.total });
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.get('/user', async (request, response) => {
    try {
        let params = request.query.id;
        let users = await database.getUser(params);
        response.status(200).json({ message: "Sikeres lekérés", users: users });
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.post('/sortedUsers', async (request, response) => {
    try {
        let { mireKeresek, mit, status, adminChecked, modChecked, userChecked, page } = request.body;
        let users = await database.sortedUsers(mireKeresek, mit, status, adminChecked, modChecked, userChecked, page || 1);
        response.status(200).json({ users: users.rows, total: users.total });
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.post('/updateUserFromAdmin',
    [
        body("username")
            .not().isEmail().withMessage("Felhasználónév nem lehet email cim!")
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage('A felhasználónév csak betűket, számokat, - vagy _ karaktert, és ékezetes betűket tartalmazhat.')
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 250 }).withMessage("Email max 250 karakter!")
    ],
    async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    error: errors.array()
                });
            }
            else {
                let { user_id, username, email, role, is_2fa } = request.body;
                if (role == "ADMIN" && request.session.role != "LORD") {
                    response.status(403).json({ message: "Nincs jogosultságod ehhez!" });
                }
                else {
                    let success = await database.updateUserByAdmin(user_id, username, email, role, is_2fa);
                    if (success == 1) {
                        await database.addLog(request.session.userid, 'User update (A)', user_id);
                        // await sendChangeEmail(email, username);
                        response.status(204).json({ message: "Sikeres felhasználófrissités!" });
                    }
                    else {
                        response.status(404).json({ message: "Nincs ilyen felhasználó, vagy a felhasználó inaktiv már!" });
                    }
                }
            }
        } catch (error) {
            response.status(500).json({ error: error });
        }
    })

router.post('/userSelfUpdate',
    [
        body("username")
            .not().isEmail().withMessage("Felhasználónév nem lehet email cim!")
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage('A felhasználónév csak betűket, számokat, - vagy _ karaktert, és ékezetes betűket tartalmazhat.')
            .isLength({ min: 1, max: 20 }).withMessage("Felhasználónév hossza nem megfelelő!"),
        body("email")
            .isEmail().withMessage("Hibás email formátum")
            .isLength({ min: 5, max: 250 }).withMessage("Email max 250 karakter!")
    ],
    async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    error: errors.array()
                });
            }
            else {
                let { username, email, is_2fa } = request.body;
                let success = await database.updateUserByAdmin(request.session.userid, username, email, role, is_2fa);
                if (success == 1) {
                    await database.addLog(request.session.userid, 'User update');
                    // await sendChangeEmail(email, username);
                    response.status(204).json({ message: "Sikeres felhasználófrissités!" });
                }
                else {
                    response.status(404).json({ error: "Nincs ilyen felhasználó, vagy a felhasználó inaktiv már!" });
                }
            }
        } catch (error) {
            response.status(500).json({ error: error });
        }
    })

router.post('/userDarkModeUpdate',
    [
        body("darkmode").isBoolean().withMessage("Nem true/false értéket adtál meg!")
    ],
    async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    error: errors.array()
                });
            }
            else {
                let { darkmode } = request.body;
                let success = await database.updateDarkMode(request.session.userid, darkmode);
                if (success == 1) {
                    await database.addLog(request.session.userid, 'User update');
                    response.status(204).json({ message: "Sikeres felhasználófrissités!" });
                }
                else {
                    response.status(404).json({ error: "Nincs ilyen felhasználó, vagy a felhasználó inaktiv már!" });
                }
            }
        } catch (error) {
            response.status(500).json({ error: error });
        }
    })


router.post('/userToInactive',
    [
        body("role")
            .not().matches("ADMIN").withMessage("Nem frissithetsz admin-t!"),
        body("deleted")
            .custom(value => value === true).withMessage("Inaktiv felhasználót nem frissithetsz!")
    ],
    async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                response.status(400).json({
                    success: false,
                    error: errors.array()
                });
            }
            else {
                let { userId } = request.body;
                let sorok = await database.userToInactive(userId);
                if (sorok === 0) {
                    response.status(200).json({ message: "A felhasználó már inaktiv volt!" })
                }
                else {
                    await database.addLog(request.session.userid, 'User delete (A)', userId);
                    // await sendDeleteEmail(email, username);
                    response.status(204).end();
                }
            }
        } catch (error) {
            response.status(500).json({ error: error });
        }
    })

router.post('/exportUsers', async (request, response) => {
    try {
        let { mireKeresek, mit, status, adminChecked, modChecked, userChecked } = request.body;
        let users = (await database.sortedUsers(mireKeresek, mit, status, adminChecked, modChecked, userChecked, 1, 999999)).rows;

        let csvContent = "\uFEFFID;Username;Email;Status;Role\n";

        users.forEach(user => {
            let statusText = user.deleted_at ? "Deleted" : "Active";
            csvContent += `${user.user_id};${user.username};${user.email};${statusText};${user.role}\n`;
        });

        response.setHeader('Content-Type', 'text/csv; charset=utf-8');
        response.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');

        return response.status(200).send(csvContent);

    } catch (error) {
        console.log(error.message)
        return response.status(500).json({ error: "Export error" });
    }
});

router.post('/updateProfilePicFromAdmin', upload.single('profilePic'), async (request, response) => {
    let originalFile;
    let newFilePath;
    try {
        if (!request.file) {
            response.status(400).json({ message: "Nincs kép!" });
        }

        let user_id = request.body.user_id;
        originalFile = request.file.path;

        let newFileName = `processed-${Date.now()}.webp`;
        newFilePath = path.join(TARGET_UPLOADS_DIR, newFileName);

        sharp.cache(false);
        const metadata = await sharp(originalFile)
            .resize(400, 400, {
                fit: 'cover',
                position: 'center'
            })
            .toFormat('webp')
            .toFile(newFilePath);

        let { width, height } = metadata;
        let lastPfp = await database.uploadProfilePic(newFileName, width, height, user_id);

        await fs.unlink(originalFile).catch(() => { });

        if (lastPfp) {
            let lastPfpPath = path.join(TARGET_UPLOADS_DIR, lastPfp);
            await fs.unlink(lastPfpPath).catch(() => { });
        }

        await database.addLog(request.session.userid, 'Profile picture update (A)', user_id);
        response.status(201).json({ success: true, message: "Profilkép frissítve!" });

    } catch (error) {
        if (originalFile) await fs.unlink(originalFile).catch(() => { });
        if (newFilePath) await fs.unlink(newFilePath).catch(() => { });
        response.status(500).json({ error: error.message });
    }
});

router.delete('/deleteProfilePicFromAdmin', async (request, response) => {
    try {
        let user_id = request.body.user_id;
        let lastPfp = await database.deleteProfilePic(user_id);

        if (!lastPfp) {
            response.status(200).json({ success: true, message: "A profilkép már alapértelmezett volt." });
        }
        else {
            let lastPfpPath = path.join(TARGET_UPLOADS_DIR, lastPfp);
            await fs.unlink(lastPfpPath).catch(() => { });

            await database.addLog(request.session.userid, 'Profile picture delete (A)', user_id);
            response.status(201).json({ success: true, message: "Profilkép törölve!" });
        }
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

router.get('/getDashboardInfo', async (request, response) => {
    try {
        let playerCount = await database.getUserCount();
        let activePlayerCount = await database.getActiveUserCount();
        let logsPreview = await database.getLogs(5);

        response.status(200).json({ playerCount, activePlayerCount, logsPreview: logsPreview.rows });
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.get('/getLogs', async (request, response) => {
    try {
        let logs = await database.getLogs();
        response.status(200).json({ message: "Sikeres lekérés", logs: logs.rows, total: logs.total });
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.post('/addLog', async (request, response) => {
    try {
        let { victimid, activity } = request.body;
        await database.addLog(request.session.userid, activity, victimid);
        response.status(200).send();
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.post('/sortedLogs', async (request, response) => {
    try {
        let { username, periodFrom, periodTo, roles, activities, page } = request.body;
        let logs = await database.sortedLogs(username, periodFrom, periodTo, roles, activities, page || 1);
        response.status(200).json({ logs: logs.rows, total: logs.total });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

router.post('/exportLogs', async (request, response) => {
    try {
        let { username, periodFrom, periodTo, roles, activities } = request.body;
        let logs = await database.sortedLogs(username, periodFrom, periodTo, roles, activities, 1, 999999);

        let csvContent = "\uFEFFUser;Victim;Activity;Date\n";

        logs.rows.forEach(log => {
            const d = new Date(log.happened_at);
            const isoDatum = d.toISOString()
                .replace('T', ' ')
                .split('.')[0];

            csvContent += `${log.username || 'System'};${log.victim || '-'};${log.activity};${isoDatum}\n`;
        });

        response.setHeader('Content-Type', 'text/csv; charset=utf-8');
        response.setHeader('Content-Disposition', 'attachment; filename=logs_export.csv');

        return response.status(200).send(csvContent);

    } catch (error) {
        console.error("Log export error:", error);
        return response.status(500).json({ error: "Export error" });
    }
});

router.get('/getAdminSettings', async (request, response) => {
    try {
        const result = await database.getAdminSettings(request.session.userid);

        if (!result) {
            response.status(200).json({
                darkmode: 0,
                selectedChart: 'activity-week'
            });
        }
        else {
            response.status(200).json(result);
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: "Hiba a lekérdezés során" });
    }
});

router.post('/updateAdminSettings', async (request, response) => {
    try {
        const { darkmode, selected_chart } = request.body;

        const affectedRows = await database.updateAdminSettings(request.session.userid, darkmode, selected_chart);

        if (affectedRows === 0) {
            response.status(200).json({ message: "Nem történt változtatás" });
        }
        else {
            response.status(200).json({ message: "Sikeres frissítés" });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: "Hiba a frissítés során" });
    }
});

router.get('/chart/:type', async (request, response) => {
    try {
        let type = request.params.type;
        let dbData, label, color, xKey, yKey;

        switch (type) {
            case 'activity-day':
                dbData = await database.getUserActivityByDay();
                label = 'Napi aktivitás';
                xKey = 'datum';
                yKey = 'felhasznalok_szama';
                break;
            case 'activity-week':
                dbData = await database.getUserActivityByWeek();
                label = 'Heti aktivitás';
                xKey = 'het_megnevezes';
                yKey = 'bejelentkezesek_szama';
                break;
            case 'registrations':
                dbData = await database.getRegistrationByWeek();
                label = 'Heti regisztrációk';
                xKey = 'het_megnevezes';
                yKey = 'regisztraciok_szama';
                color = '#198754';
                break;
            case 'matches':
                dbData = await database.getMatchCountByWeek();
                label = 'Heti meccsek';
                xKey = 'het_megnevezes';
                yKey = 'meccsek_szama';
                color = '#dc3545';
                break;
            default:
                response.status(400).send("Érvénytelen grafikon típus");
        }

        const labels = dbData.map(row => row[xKey]);
        const values = dbData.map(row => row[yKey]);

        const canvas = new Canvas(1200, 600);
        const ctx = canvas.getContext("2d");
        const chart = new Chart(ctx, createChartConfig(labels, values, label, color));

        const rawBuffer = await canvas.toBuffer('png');
        const optimizedImage = await sharp(rawBuffer)
            .toFormat('webp', { quality: 95 })
            .toBuffer();

        response.set('Content-Type', 'image/webp');
        response.send(optimizedImage);

        chart.destroy();

    } catch (error) {
        console.error(error);
        response.status(500).send("Hiba a generáláskor");
    }
});

const createChartConfig = (labels, data, label, color) => ({
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: label,
            data: data,
            borderColor: color || '#0d6efd',
            borderWidth: 5,
            pointRadius: 6,
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        devicePixelRatio: 1,
        plugins: { legend: { labels: { font: { size: 18, weight: 'bold' } } } },
        scales: {
            x: { ticks: { font: { size: 16, weight: 'bold' } } },
            y: { ticks: { font: { size: 16, weight: 'bold' }, beginAtZero: true } }
        }
    }
});

module.exports = router;