require('./helpers/mocks.js');

const request = require('supertest');
const express = require('express');
const db = require('../../sql/admin/databaseAdmin.js');
const dbLogs = require('../../sql/admin/databaseLogs.js');
const auth = require('../../utils/auth.js');
const enTranslations = require('../../locales/en/admin.json');
const huTranslations = require('../../locales/hu/admin.json');
const { mockI18nMiddleware, testRequiresAdminOrAuth } = require('./helpers/helpers.js');

const app = express();
app.use(express.json());

app.use(mockI18nMiddleware);

app.use('/api/admin', auth.checkAuth, auth.checkRole("ADMIN"), require('../../api/admin/index.js'));

describe('Admin API-tesztek', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Végpont: GET /language', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/language'));

        it('SIKER - 200, nyelv lekérése', async () => {
            const res = await request(app).get('/api/admin/language').expect(200);
            expect(res.body.language).toBe("en");
        });
    });

    describe('Végpont: GET /dashboard', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/dashboard'));

        it('SIKER - 200, dashboard info lekérése', async () => {
            db.getUserCount.mockResolvedValue(100);
            db.getActiveUserCount.mockResolvedValue(20);
            const mockLogs = {
                rows: [
                    { log_id: 1, user_id: 1, activity: 'Login', happened_at: '2024-01-01 12:00:00' },
                    { log_id: 2, user_id: 2, activity: 'Logout', happened_at: '2024-01-01 13:00:00' }
                ]
            };
            dbLogs.getLogs.mockResolvedValue(mockLogs);
            const res = await request(app).get('/api/admin/dashboard').expect(200);
            expect(res.body.playerCount).toBe(100);
            expect(res.body.activePlayerCount).toBe(20);
            expect(res.body.logsPreview).toEqual(mockLogs.rows);
        });

        it('HIBA - 500, ha hiba van a lekérdezés során', async () => {
            db.getUserCount.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app)
                .get('/api/admin/dashboard')
                .set('forceerror', 'true')
                .expect(500);
            expect(res.body.error).toBe(enTranslations.adminApi.dashboard_info_error);
        });
    });

    describe('Végpont: GET /charts/:type', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/charts/activity-day'));

        it('HIBA - 400, érvénytelen típus', async () => {
            const res = await request(app)
                .get('/api/admin/charts/invalid-type')
                .expect(400);
            expect(res.body.error).toBe(enTranslations.adminApi.chart_invalid_type);
        });

        it('SIKER - 200, helyes típus', async () => {
            const mockData = [
                { datum: '01.01.', felhasznalok_szama: 10 },
            ];
            db.getUserActivityByDay.mockResolvedValue(mockData);
            const res = await request(app)
                .get('/api/admin/charts/activity-day')
                .expect(200);
            expect(res.header['content-type']).toBe('image/webp');
            expect(res.body).toBeDefined();
        });

        it('HIBA - 500, ha hiba van a lekérdezés során', async () => {
            db.getUserActivityByDay.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app)
                .get('/api/admin/charts/activity-day')
                .set('forceerror', 'true')
                .expect(500);
            expect(res.body.error).toBe(enTranslations.adminApi.chart_generation_error);
        });
    });
});