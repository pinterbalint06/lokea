const express = require('../../../backend/node_modules/express/index.js');
const router = express.Router();
const { body, validationResult } = require('../../../backend/node_modules/express-validator/lib/index.js');

//?SQL
const databaseSettings = require('../sql/databaseSettings');
const databaseLogs = require('../sql/databaseLogs');

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

router.put('/updateAdminSettings', async (request, response) => {
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
                let success = await databaseSettings.updateDarkMode(request.session.userid, darkmode);
                if (success == 1) {
                    await databaseLogs.addLog(request.session.userid, 'User update');
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

router.put('/updateLanguage', async (request, response) => {
    try {
        const { language } = request.body;
        const affectedRows = await databaseSettings.updateLanguage(request.session.userid, language);

        if (affectedRows === 0) {   
            response.status(200).json({ message: "Nem történt változtatás", language: request.session.userLanguage });
        }
        else {
            request.session.userLanguage = language;
            await databaseLogs.addLog(request.session.userid, 'User update');
            response.status(200).json({ message: "Sikeres frissítés", language });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: "Hiba a frissítés során" });
    }
});

module.exports = router;

