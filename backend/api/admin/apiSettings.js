const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

//?SQL
const databaseSettings = require('../../sql/admin/databaseSettings.js');
const databaseLogs = require('../../sql/admin/databaseLogs.js');

//API endpoints

//GET

router.get('/getAdminSettings', async (request, response) => {
    try {
        const result = await databaseSettings.getAdminSettings(request.session.userid);

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

//PUT

router.put('/updateAdminSettings',
    [
        body("darkmode").isBoolean().withMessage("Nem true/false értéket adtál meg!"),
        body("selected_chart").isIn(["activity-day", "activity-week", "weekly_registrations", "weekly-matches"]).withMessage("Érvénytelen chart típus!")
    ],
    validate,
    async (request, response) => {
        try {
            const { darkmode, selected_chart } = request.body;

            const affectedRows = await databaseSettings.updateAdminSettings(request.session.userid, darkmode, selected_chart);

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

router.put('/userDarkMode',
    [
        body("darkmode").isBoolean().withMessage("Nem true/false értéket adtál meg!")
    ],
    validate,
    async (request, response) => {
        try {
            let { darkmode } = request.body;
            let success = await databaseSettings.updateDarkMode(request.session.userid, darkmode);
            if (success == 1) {
                await databaseLogs.addLog(request.session.userid, 'User update');
                response.status(200).json({ message: "Sikeres felhasználófrissítés!" });
            }
            else {
                response.status(200).json({ message: "Nem történt változtatás!" });
            }
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Hiba a frissítés során" });
        }
    })

router.put('/updateLanguage', [
    body("language").isIn(["en", "hu"]).withMessage("Érvénytelen nyelv!")
], validate,
    async (request, response) => {
        try {
            const { language } = request.body;
            const affectedRows = await databaseSettings.updateLanguage(request.session.userid, language);

            if (affectedRows === 0) {
                response.status(200).json({ message: "Nem történt változtatás!", language: request.session.userLanguage });
            }
            else {
                request.session.userLanguage = language;
                await databaseLogs.addLog(request.session.userid, 'User update');
                response.status(200).json({ message: "Sikeres frissítés!", language });
            }
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Hiba a frissítés során" });
        }
    });

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            errors: errors.array()
        });
    }
    else {
        next();
    }
}

module.exports = router;

