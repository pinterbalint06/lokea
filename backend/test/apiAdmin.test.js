const request = require('supertest');
const express = require('express');
const db = require('../../private/backend/sql/databaseAdmin.js');
const dbLogs = require('../../private/backend/sql/databaseLogs.js');
const auth = require('../../private/backend/auth.js');

jest.mock('../../private/backend/sql/databaseAdmin.js');
jest.mock('../../private/backend/sql/databaseLogs.js');

jest.mock('../../private/backend/auth.js', () => ({
    checkAuth: (req, res, next) => {
        if (req.headers.unauthenticated) {
            return res.status(401).json({ message: "Bejelentkezés szükséges!" });
        }
        if (!req.session) req.session = {};
        req.session.userid = 99;
        req.session.role = "ADMIN";
        req.session.userLanguage = "en";
        next();
    },
    checkRole: (...roles) => (req, res, next) => {
        if (req.headers.notadmin) {
            return res.status(404).send("Not Found HTML");
        }
        next();
    }
}));

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    if (!req.session) req.session = {};
    next();
});

app.use('/api/admin', auth.checkAuth, auth.checkRole("ADMIN"), require('../../private/backend/api/index.js'));

describe('Admin API-tesztek', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Végpont: GET /getLanguage', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .get('/api/admin/getLanguage')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .get('/api/admin/getLanguage')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('SIKER - 200, nyelv lekérése', async () => {
            const res = await request(app).get('/api/admin/getLanguage').expect(200);
            expect(res.body.language).toBe("en");
        });
    });

    describe('Végpont: PUT /getDashboardInfo', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .get('/api/admin/getLanguage')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .get('/api/admin/getLanguage')
                .set('notadmin', 'true')
                .expect(404);
        });

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
            const res = await request(app).get('/api/admin/getDashboardInfo').expect(200);
            expect(res.body.playerCount).toBe(100);
            expect(res.body.activePlayerCount).toBe(20);
            expect(res.body.logsPreview).toEqual(mockLogs.rows);
        });

        it('HIBA - 500, ha hiba van a lekérdezés során', async () => {
            db.getUserCount.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app)
                .get('/api/admin/getDashboardInfo')
                .set('forceerror', 'true')
                .expect(500);
            expect(res.body.error).toBe("Hiba a dashboard információk lekérdezésekor");
        });
    });

    describe('Végpont: GET /chart/:type', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .get('/api/admin/chart/activity-day')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .get('/api/admin/chart/activity-day')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('HIBA - 400, érvénytelen típus', async () => {
            const res = await request(app)
                .get('/api/admin/chart/invalid-type')
                .expect(400);
            expect(res.body.error).toBe("Érvénytelen grafikon típus");
        });

        it('SIKER - 200, helyes típus', async () => {
            const mockData = [
                { datum: '01.01.', felhasznalok_szama: 10 },
            ];
            db.getUserActivityByDay.mockResolvedValue(mockData);
            const res = await request(app)
                .get('/api/admin/chart/activity-day')
                .expect(200);
            expect(res.header['content-type']).toBe('image/webp');
            expect(res.body).toBeDefined();
        });

        it('HIBA - 500, ha hiba van a lekérdezés során', async () => {
            db.getUserActivityByDay.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app)
                .get('/api/admin/chart/activity-day')
                .set('forceerror', 'true')
                .expect(500);
            expect(res.body.error).toBe("Hiba a grafikon generálása során");
        });
    });
});