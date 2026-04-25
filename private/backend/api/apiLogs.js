const express = require('../../../backend/node_modules/express/index.js');
const router = express.Router();
const { body, query, validationResult } = require('../../../backend/node_modules/express-validator/lib/index.js');

//?SQL
const databaseLogs = require('../sql/databaseLogs.js');

//API endpoints

router.get('/getLogs', async (request, response) => {
    try {
        let logs = await databaseLogs.getLogs();
        response.status(200).json({ message: "Sikeres lekérés", logs: logs.rows, total: logs.total });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Hiba a lekérdezés során" });
    }
});

router.get('/sortedLogs',
    [
        query('username')
            .optional({ values: 'null' })
            .trim()
            .isLength({ min: 1, max: 50 }),
        query('periodFrom')
            .optional({ values: 'null' })
            .isISO8601(),
        query('periodTo')
            .optional({ values: 'null' })
            .isISO8601()
            .custom((value, { req }) => {
                if (
                    value &&
                    req.query.periodFrom &&
                    new Date(value) < new Date(req.query.periodFrom)
                ) {
                    throw new Error('periodTo cannot be earlier than periodFrom');
                }
                return true;
            }),
        query('roles')
            .optional({ values: 'null' })
            .isIn(['ADMIN', 'MOD', 'user']),

        query('activities')
            .optional({ values: 'null' })
            .matches(/^[a-zA-Z0-9_, -]+$/),
        query('page')
            .optional()
            .isInt({
                min: 1,
                max: 10000
            })
            .toInt(),
        validate
    ],
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
                error: error.message
            });
        }
    });

router.post('/addLog',
    [
        body('victimid')
            .optional({ values: 'null' })
            .isInt({
                min: 1,
                max: 999999999
            })
            .toInt(),
        body('activity')
            .exists()
            .trim()
            .notEmpty()
            .isLength({
                min: 2,
                max: 100
            })
            .escape(),

        validate
    ],
    async (request, response) => {
        try {
            let { victimid, activity } = request.body;
            await databaseLogs.addLog(request.session.userid, activity, victimid);
            response.status(200).send();

        }
        catch (error) {
            response.status(500).json({
                error: error.message
            });
        }
    });

router.post('/exportLogs',
    [
        body('username')
            .optional({ values: 'null' })
            .trim()
            .isLength({ min: 1, max: 50 }),
        body('periodFrom')
            .optional({ values: 'null' })
            .isISO8601(),
        body('periodTo')
            .optional({ values: 'null' })
            .isISO8601()
            .custom((value, { req }) => {
                if (value && req.body.periodFrom && new Date(value) < new Date(req.body.periodFrom)) {
                    throw new Error('periodTo invalid');
                }
                return true;
            }),
        body('roles')
            .optional({ values: 'null' })
            .isIn(['ADMIN', 'MOD', 'user']),
        body('activities')
            .optional({ values: 'null' })
            .matches(/^[a-zA-Z0-9_, -]+$/),
        validate
    ],
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
                999999
            );

            if (logs.total === 0) {
                response.status(404).json({ error: "No logs found for export." });
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
            response.status(500).json({ error: 'Export error' });
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