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
        response.status(500).json({ error: request.t('admin:settingsApi.fetch_error') });
    }
});

//PUT

router.put('/updateAdminSettings',
    [
        body("darkmode").isBoolean().withMessage((value, { req }) => req.t("admin:settingsApi.validation_darkmode_boolean")),
        body("selected_chart").isIn(["activity-day", "activity-week", "weekly_registrations", "weekly-matches"]).withMessage((value, { req }) => req.t("admin:settingsApi.validation_chart_type_invalid"))
    ],
    validate,
    async (request, response) => {
        try {
            const { darkmode, selected_chart } = request.body;

            const affectedRows = await databaseSettings.updateAdminSettings(request.session.userid, darkmode, selected_chart);

            if (affectedRows === 0) {
                response.status(200).json({ message: request.t('admin:settingsApi.update_no_change') });
            }
            else {
                response.status(200).json({ message: request.t('admin:settingsApi.update_success') });
            }
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: request.t('admin:settingsApi.update_error') });
        }
    });

router.put('/userDarkMode',
    [
        body("darkmode").isBoolean().withMessage((value, { req }) => req.t("admin:settingsApi.validation_darkmode_boolean"))
    ],
    validate,
    async (request, response) => {
        try {
            let { darkmode } = request.body;
            let success = await databaseSettings.updateDarkMode(request.session.userid, darkmode);
            if (success == 1) {
                await databaseLogs.addLog(request.session.userid, 'User update');
                response.status(200).json({ message: request.t('admin:settingsApi.user_update_success') });
            }
            else {
                response.status(200).json({ message: request.t('admin:settingsApi.update_no_change') });
            }
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: request.t('admin:settingsApi.update_error') });
        }
    })

router.put('/updateLanguage', [
    body("language").isIn(["en", "hu"]).withMessage((value, { req }) => req.t("admin:settingsApi.validation_language_invalid"))
], validate,
    async (request, response) => {
        try {
            const { language } = request.body;
            const affectedRows = await databaseSettings.updateLanguage(request.session.userid, language);

            if (affectedRows === 0) {
                response.status(200).json({ message: request.t('admin:settingsApi.update_no_change'), language: request.session.userLanguage });
            }
            else {
                request.session.userLanguage = language;
                await databaseLogs.addLog(request.session.userid, 'User update');
                response.status(200).json({ message: request.t('admin:settingsApi.update_success'), language });
            }
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: request.t('admin:settingsApi.update_error') });
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
