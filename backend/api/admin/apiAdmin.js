const express = require('express'); //?npm install express
const { body, validationResult } = require('express-validator');
const sharp = require('sharp');
const { Chart, registerables } = require('chart.js');
const { Canvas } = require('skia-canvas');
const router = express.Router();
const AppError = require('#utils/app-error.js');

//?SQL
const databaseAdmin = require('#sql/admin/databaseAdmin.js');
const databaseLogs = require('#sql/admin/databaseLogs.js');

Chart.register(...registerables);

const chartCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 perc (milliszekundumban)

//API endpoints - GET

router.get('/language', (request, response) => {
    try {
        if (!request.session) {
            response.status(401).json({ error: request.t('admin:adminApi.language_fetch_error') });
        }
        else {
            let language = request.session.userLanguage;
            response.status(200).json({ language: request.session.userLanguage });
        }
    } catch (error) {
        response.status(500).json({ error: request.t('admin:adminApi.language_fetch_error') });
    }

});

router.get('/dashboard', async (request, response) => {
    try {
        let playerCount = await databaseAdmin.getUserCount();
        let activePlayerCount = await databaseAdmin.getActiveUserCount();
        let logsPreview = await databaseLogs.getLogs(5);

        response.status(200).json({ playerCount, activePlayerCount, logsPreview: logsPreview.rows });
    } catch (error) {
        response.status(500).json({ error: request.t('admin:adminApi.dashboard_info_error') });
    }
});

router.get('/charts/:type', async (request, response) => {
    try {
        let type = request.params.type;
        let lang = request.query.lang || request.session?.userLanguage || 'hu';
        let cacheKey = `${type}_${lang}`;
        let dbData, label, color, xKey, yKey;

        if (chartCache.has(cacheKey)) {
            const cached = chartCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                response.set('Content-Type', 'image/webp');
                response.set('Cache-Control', 'private, max-age=300');
                return response.send(cached.buffer);
            }
        }
        else {
            switch (type) {
                case 'activity-day':
                    dbData = await databaseAdmin.getUserActivityByDay();
                    label = request.t('admin:adminApi.chart_daily_activity', { lng: lang });
                    xKey = 'datum';
                    yKey = 'felhasznalok_szama';
                    break;
                case 'activity-week':
                    dbData = await databaseAdmin.getUserActivityByWeek();
                    label = request.t('admin:adminApi.chart_weekly_activity', { lng: lang });
                    xKey = 'het_megnevezes';
                    yKey = 'bejelentkezesek_szama';
                    break;
                case 'registrations':
                    dbData = await databaseAdmin.getRegistrationByWeek();
                    label = request.t('admin:adminApi.chart_weekly_registrations', { lng: lang });
                    xKey = 'het_megnevezes';
                    yKey = 'regisztraciok_szama';
                    color = '#198754';
                    break;
                case 'matches':
                    dbData = await databaseAdmin.getMatchCountByWeek();
                    label = request.t('admin:adminApi.chart_weekly_matches', { lng: lang });
                    xKey = 'het_megnevezes';
                    yKey = 'meccsek_szama';
                    color = '#dc3545';
                    break;
                default:
                    throw new AppError(request.t('admin:adminApi.chart_invalid_type'), 400);
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

            chartCache.set(cacheKey, {
                buffer: optimizedImage,
                timestamp: Date.now()
            });

            response.set('Content-Type', 'image/webp');
            response.set('Cache-Control', 'private, max-age=300');
            response.send(optimizedImage);

            chart.destroy();
        }
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            return response.status(error.statusCode).json({ error: error.message });
        }
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
