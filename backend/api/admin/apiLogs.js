const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { validate } = require('#utils/validate.js');

//?SQL
const databaseLogs = require('#sql/admin/databaseLogs.js');

//API endpoints

router.get('/logs', async (request, response) => {
    try {
        let logs = await databaseLogs.getLogs();
        response.status(200).json({ message: request.t('admin:logsApi.fetch_success'), logs: logs.rows, total: logs.total });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: request.t('admin:logsApi.fetch_error') });
    }
});

router.get('/logs/sorted',
    [
        query('username')
            .optional({ values: 'null' })
            .trim()
            .isLength({ min: 1, max: 50 }).withMessage((value, { req }) => req.t('admin:logsApi.validation_username_length')),
        query('periodFrom')
            .optional({ values: 'null' })
            .isISO8601().withMessage((value, { req }) => req.t('admin:logsApi.validation_period_from_invalid')),
        query('periodTo')
            .optional({ values: 'null' })
            .isISO8601().withMessage((value, { req }) => req.t('admin:logsApi.validation_period_to_invalid_format'))
            .custom((value, { req }) => {
                if (
                    value &&
                    req.query.periodFrom &&
                    new Date(value) < new Date(req.query.periodFrom)
                ) {
                    throw new Error(req.t('admin:logsApi.validation_period_to_invalid'));
                }
                return true;
            }),
        query('roles')
            .optional({ values: 'null' })
            .custom((value) => {
                let arr = Array.isArray(value) ? value : [value];
                return arr.every(r => ['LORD', 'ADMIN', 'MOD', 'user'].includes(r));
            }).withMessage((value, { req }) => req.t('admin:logsApi.validation_roles_invalid')),
        query('activities')
            .optional({ values: 'null' })
            .custom((value) => {
                let arr = Array.isArray(value) ? value : [value];
                return arr.every(a => /^[a-zA-Z0-9 -]+$/.test(a));
            }).withMessage((value, { req }) => req.t('admin:logsApi.validation_activities_invalid')),
        query('page')
            .optional()
            .isInt({
                min: 1,
                max: 10000
            }).withMessage((value, { req }) => req.t('admin:logsApi.validation_page_invalid'))
            .toInt(),
    ], validate,
    async (request, response) => {
        try {
            let { username, periodFrom, periodTo, roles, activities, page } = request.query;
            const finalRoles = Array.isArray(roles) ? roles : (roles ? [roles] : undefined);
            const finalActivities = Array.isArray(activities) ? activities : (activities ? [activities] : undefined);

            let logs = await databaseLogs.sortedLogs(
                username,
                periodFrom,
                periodTo,
                finalRoles,
                finalActivities,
                page || 1
            );
            response.status(200).json({
                logs: logs.rows,
                total: logs.total
            });

        }
        catch (error) {
            response.status(500).json({
                error: request.t('admin:logsApi.fetch_sorted_error')
            });
        }
    });

router.post('/logs',
    [
        body('victimid')
            .optional({ values: 'null' })
            .isInt({
                min: 1,
                max: 999999999
            }).withMessage((value, { req }) => req.t('admin:logsApi.validation_victimid_invalid'))
            .toInt(),
        body('activity')
            .exists()
            .trim()
            .notEmpty()
            .isLength({
                min: 2,
                max: 100
            }).withMessage((value, { req }) => req.t('admin:logsApi.validation_activity_invalid'))
            .escape(),
    ], validate,
    async (request, response) => {
        try {
            let { victimid, activity } = request.body;
            await databaseLogs.addLog(request.session.userid, activity, victimid);
            response.status(200).send();

        }
        catch (error) {
            response.status(500).json({
                error: request.t('admin:logsApi.add_log_error')
            });
        }
    });

router.post('/logs/exports',
    [
        body('username')
            .optional({ values: 'null' })
            .trim()
            .isLength({ min: 1, max: 50 }).withMessage((value, { req }) => req.t('admin:logsApi.validation_username_length')),
        body('periodFrom')
            .optional({ values: 'null' })
            .isISO8601().withMessage((value, { req }) => req.t('admin:logsApi.validation_period_from_invalid')),
        body('periodTo')
            .optional({ values: 'null' })
            .isISO8601().withMessage((value, { req }) => req.t('admin:logsApi.validation_period_to_invalid_format'))
            .custom((value, { req }) => {
                if (value && req.body.periodFrom && new Date(value) < new Date(req.body.periodFrom)) {
                    throw new Error(req.t('admin:logsApi.validation_period_to_invalid'));
                }
                return true;
            }),
        body('roles')
            .optional({ values: 'null' })
            .custom((value) => {
                let arr = Array.isArray(value) ? value : [value];
                return arr.every(r => ['LORD', 'ADMIN', 'MOD', 'user'].includes(r));
            }).withMessage((value, { req }) => req.t('admin:logsApi.validation_roles_invalid')),
        body('activities')
            .optional({ values: 'null' })
            .custom((value) => {
                let arr = Array.isArray(value) ? value : [value];
                return arr.every(a => /^[a-zA-Z0-9 -]+$/.test(a));
            }).withMessage((value, { req }) => req.t('admin:logsApi.validation_activities_invalid')),
    ], validate,
    async (request, response) => {
        try {
            let { username, periodFrom, periodTo, roles, activities } = request.body;
            const finalRoles = Array.isArray(roles) ? roles : (roles ? [roles] : undefined);
            const finalActivities = Array.isArray(activities) ? activities : (activities ? [activities] : undefined);

            let logs = await databaseLogs.sortedLogs(
                username,
                periodFrom,
                periodTo,
                finalRoles,
                finalActivities,
                1,
                Number.MAX_SAFE_INTEGER //9 billiárd
            );

            if (logs.total === 0) {
                response.status(404).json({ error: request.t('admin:logsApi.export_not_found') });
            }
            else {
                let csvContent = "\uFEFFUser;Victim;Activity;Date\n";

                logs.rows.forEach(log => {

                    const d = new Date(log.happened_at);
                    const isoDate = !isNaN(d.getTime()) ? d.toISOString().replace('T', ' ').split('.')[0] : 'N/A';

                    csvContent +=
                        `${log.username || 'System'};${log.victim || '-'};${log.activity};${isoDate}\n`;

                });

                response.setHeader('Content-Type', 'text/csv; charset=utf-8');
                response.setHeader('Content-Disposition', 'attachment; filename=logs_export.csv');
                response.status(200).send(csvContent);
            }
        }
        catch (error) {
            console.error('Log export error:', error);
            response.status(500).json({ error: request.t('admin:logsApi.export_error') });
        }
    });

module.exports = router;
