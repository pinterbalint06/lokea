require('./helpers/mocks.js');

const request = require('supertest');
const express = require('express');
const db = require('#sql/admin/databaseAdmin.js');
const dbLogs = require('#sql/admin/databaseLogs.js');
const auth = require('#middlewares/auth.js');
const enTranslations = require('#locales/en/admin.json');
const huTranslations = require('#locales/hu/admin.json');
const { mockI18nMiddleware, testRequiresAdminOrAuth, suppressConsoleErrors } = require('./helpers/helpers.js');

const app = express();
app.use(express.json());

app.use(mockI18nMiddleware);

app.use('/api/admin', require('#admin/index.js'));

describe('Admin API-tesztek', () => {
    suppressConsoleErrors();

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
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/charts/activity-day?lang=en'));

        it('HIBA - 400, érvénytelen típus', async () => {
            const res = await request(app)
                .get('/api/admin/charts/invalid-type?lang=en')
                .expect(400);
            expect(res.body.errors.some(e => e.msg === enTranslations.adminApi.chart_invalid_type)).toBe(true);
        });

        it('HIBA - 500, ha hiba van a lekérdezés során', async () => {
            db.getUserActivityByWeek.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app)
                .get('/api/admin/charts/activity-week?lang=en')
                .set('forceerror', 'true')
                .expect(500);
            expect(res.body.error).toBe(enTranslations.adminApi.chart_generation_error);
        });

        it('SIKER - 200, helyes típus', async () => {
            const mockData = [
                { datum: '01.01.', felhasznalok_szama: 10 },
            ];
            db.getUserActivityByDay.mockResolvedValue(mockData);
            const res = await request(app)
                .get('/api/admin/charts/activity-day?lang=en')
                .expect(200);
            expect(res.header['content-type']).toBe('image/webp');
            expect(res.body).toBeDefined();
        });

        it('SIKER - 200, activity-week típus lekérése', async () => {
            const mockData = [{ het_megnevezes: '12.', bejelentkezesek_szama: 20 }];
            db.getUserActivityByWeek.mockResolvedValue(mockData);
            const res = await request(app)
                .get('/api/admin/charts/activity-week?lang=en')
                .expect(200);
            expect(res.header['content-type']).toBe('image/webp');
            expect(res.body).toBeDefined();
        });

        it('SIKER - 200, registrations típus lekérése', async () => {
            const mockData = [{ het_megnevezes: '12.', regisztraciok_szama: 10 }];
            db.getRegistrationByWeek.mockResolvedValue(mockData);
            const res = await request(app)
                .get('/api/admin/charts/registrations?lang=en')
                .expect(200);
            expect(res.header['content-type']).toBe('image/webp');
            expect(res.body).toBeDefined();
        });

        it('SIKER - 200, matches típus lekérése', async () => {
            const mockData = [{ het_megnevezes: '12.', meccsek_szama: 30 }];
            db.getMatchCountByWeek.mockResolvedValue(mockData);
            const res = await request(app)
                .get('/api/admin/charts/matches?lang=en')
                .expect(200);
            expect(res.header['content-type']).toBe('image/webp');
            expect(res.body).toBeDefined();
        });

        it('SIKER - 200, grafikon lekérése a gyorsítótárból (cache hit)', async () => {
            await request(app).get('/api/admin/charts/activity-day?lang=en').expect(200);

            db.getUserActivityByDay.mockClear();

            const res = await request(app)
                .get('/api/admin/charts/activity-day?lang=en')
                .expect(200);

            expect(res.header['content-type']).toBe('image/webp');
            expect(res.header['cache-control']).toBe('private, max-age=300');

            expect(db.getUserActivityByDay).not.toHaveBeenCalled();
        });
    });
});
