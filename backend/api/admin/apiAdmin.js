const express = require('express'); //?npm install express
const { body, validationResult } = require('express-validator');
const sharp = require('sharp');
const { Chart, registerables } = require('chart.js');
const { Canvas } = require('skia-canvas');
const router = express.Router();

//?SQL
const databaseAdmin = require('../../sql/admin/databaseAdmin.js');
const databaseLogs = require('../../sql/admin/databaseLogs.js');

Chart.register(...registerables);

//API endpoints - GET

router.get('/getLanguage', (request, response) => {
    try {
        if (!request.session) {
            console.error("Session is missing");
            throw new Error();
        }
        let language = request.session.userLanguage;
        response.status(200).json({ language: request.session.userLanguage });
    } catch (error) {
        response.status(500).json({ error: request.t('admin:adminApi.language_fetch_error') });
    }

});

router.get('/getDashboardInfo', async (request, response) => {
    try {
        let playerCount = await databaseAdmin.getUserCount();
        let activePlayerCount = await databaseAdmin.getActiveUserCount();
        let logsPreview = await databaseLogs.getLogs(5);

        response.status(200).json({ playerCount, activePlayerCount, logsPreview: logsPreview.rows });
    } catch (error) {
        response.status(500).json({ error: request.t('admin:adminApi.dashboard_info_error') });
    }
});

router.get('/chart/:type', async (request, response) => {
    try {
        let type = request.params.type;
        let dbData, label, color, xKey, yKey;

        switch (type) {
            case 'activity-day':
                dbData = await databaseAdmin.getUserActivityByDay();
                label = request.t('admin:adminApi.chart_daily_activity');
                xKey = 'datum';
                yKey = 'felhasznalok_szama';
                break;
            case 'activity-week':
                dbData = await databaseAdmin.getUserActivityByWeek();
                label = request.t('admin:adminApi.chart_weekly_activity');
                xKey = 'het_megnevezes';
                yKey = 'bejelentkezesek_szama';
                break;
            case 'registrations':
                dbData = await databaseAdmin.getRegistrationByWeek();
                label = request.t('admin:adminApi.chart_weekly_registrations');
                xKey = 'het_megnevezes';
                yKey = 'regisztraciok_szama';
                color = '#198754';
                break;
            case 'matches':
                dbData = await databaseAdmin.getMatchCountByWeek();
                label = request.t('admin:adminApi.chart_weekly_matches');
                xKey = 'het_megnevezes';
                yKey = 'meccsek_szama';
                color = '#dc3545';
                break;
            default:
                return response.status(400).json({ error: request.t('admin:adminApi.chart_invalid_type') });
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
        response.status(500).json({ error: request.t('admin:adminApi.chart_generation_error') });
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