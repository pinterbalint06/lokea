const express = require('../../../backend/node_modules/express/index.js');
const router = express.Router();

//?SQL
const databaseLogs = require('../sql/databaseLogs.js');

//API endpoints

router.get('/getLogs', async (request, response) => {
    try {
        let logs = await databaseLogs.getLogs();
        response.status(200).json({ message: "Sikeres lekérés", logs: logs.rows, total: logs.total });
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.get('/sortedLogs', async (request, response) => {
    try {
        let { username, periodFrom, periodTo, roles, activities, page } = request.query;
        const finalRoles = ensureArray(roles);
        const finalActivities = ensureArray(activities);

        let logs = await databaseLogs.sortedLogs(
            username,
            periodFrom,
            periodTo,
            finalRoles,
            finalActivities,
            page || 1
        );

        response.status(200).json({ logs: logs.rows, total: logs.total });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
});

//POST

router.post('/addLog', async (request, response) => {
    try {
        let { victimid, activity } = request.body;
        await databaseLogs.addLog(request.session.userid, activity, victimid);
        response.status(200).send();
    } catch (error) {
        response.status(500).json({ error: error });
    }
})

router.post('/exportLogs', async (request, response) => {
    try {
        let { username, periodFrom, periodTo, roles, activities } = request.body;
        let logs = await databaseLogs.sortedLogs(username, periodFrom, periodTo, roles, activities, 1, 999999);

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

const ensureArray = (val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
};

module.exports = router;