require('./helpers/mocks.js');

const request = require('supertest');
const express = require('express');
const db = require('../../sql/admin/databaseLogs.js');
const auth = require('../../utils/auth.js');
const enTranslations = require('../../locales/en/admin.json');
const huTranslations = require('../../locales/hu/admin.json');
const { mockI18nMiddleware, testRequiresAdminOrAuth } = require('./helpers/helpers.js');

const app = express();
app.use(express.json());

app.use(mockI18nMiddleware);

app.use('/api/admin', auth.checkAuth, auth.checkRole("ADMIN"), require('../../api/admin/index.js'));

describe('Admin Logs API Átfogó Tesztek', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Végpont: GET /logs', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/logs'));

        it('SIKER - 200, alapértelmezett adatok lekérése', async () => {
            db.getLogs.mockResolvedValue({ total: 2, rows: [{}, {}] });
            const res = await request(app).get('/api/admin/logs').expect(200);
            expect(res.body.message).toBe(enTranslations.logsApi.fetch_success);
            expect(res.body.logs).toHaveLength(2);
        });

        it('HIBA - 500, ha az adatbázis összeomlik', async () => {
            db.getLogs.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app).get('/api/admin/logs').expect(500);
            expect(res.body.error).toBe(enTranslations.logsApi.fetch_error);
        });
    });

    describe('Végpont: GET /logs/sorted', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/logs/sorted'));

        it('HIBA - 400, ha a dátum intervallum hibás', async () => {
            const res = await request(app)
                .get('/api/admin/logs/sorted')
                .query({ periodFrom: '2024-05-10', periodTo: '2024-05-01' })
                .expect(400);
            expect(res.body.errors || res.body.error).toBeDefined();
        });

        it('HIBA - 400, ha az oldalszám (page) érvénytelen', async () => {
            const res = await request(app)
                .get('/api/admin/logs/sorted')
                .query({ page: -1 })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'page')).toBe(true);
        });

        it('HIBA - 400, ha a roles paraméter érvénytelen', async () => {
            const res = await request(app)
                .get('/api/admin/logs/sorted')
                .query({ roles: 'invalid_role_format' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'roles' || e.path === 'roles[0]')).toBe(true);
        });

        it('HIBA - 400, ha az activities paraméter érvénytelen', async () => {
            const res = await request(app)
                .get('/api/admin/logs/sorted')
                .query({ activities: 'invalid_activity_format' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'activities' || e.path === 'activities[0]')).toBe(true);
        });

        it('SIKER - 200, ha nincs találat (üres lista)', async () => {
            db.sortedLogs.mockResolvedValue({ total: 0, rows: [] });
            const res = await request(app).get('/api/admin/logs/sorted').expect(200);
            expect(res.body.logs).toHaveLength(0);
        });

        it('SIKER - 200, szűrés ellenőrzése egy paraméterrel', async () => {
            db.sortedLogs.mockResolvedValue({ total: 1, rows: [] });
            await request(app)
                .get('/api/admin/logs/sorted')
                .query({ roles: 'user', activities: 'login', page: 2 })
                .expect(200);

            expect(db.sortedLogs).toHaveBeenCalledWith(
                undefined, undefined, undefined, ['user'], ['login'], "2"
            );
        });

        it('SIKER - 200, szűrés ellenőrzése tömb (több checkbox) paraméterekkel', async () => {
            db.sortedLogs.mockResolvedValue({ total: 1, rows: [] });
            await request(app)
                .get('/api/admin/logs/sorted')
                .query({ roles: ['user', 'MOD'], activities: ['Login', 'User update'], page: 1 })
                .expect(200);

            // A backendnek helyesen, tömbként kell továbbadnia a db rétegnek
            expect(db.sortedLogs).toHaveBeenCalledWith(
                undefined, undefined, undefined, ['user', 'MOD'], ['Login', 'User update'], "1"
            );
        });

        it('HIBA - 500 hibaüzenet ellenőrzése', async () => {
            db.sortedLogs.mockRejectedValue(new Error('SQL Error'));
            const res = await request(app).get('/api/admin/logs/sorted').expect(500);
            expect(res.body.error).toBe("SQL Error");
        });
    });

    describe('Végpont: POST /logs', () => {
        testRequiresAdminOrAuth(() => request(app).post('/api/admin/logs'));

        it('HIBA - 400, ha az activity hiányzik vagy rövid', async () => {
            const res = await request(app).post('/api/admin/logs').send({ activity: 'a' }).expect(400);
            expect(res.body.errors.some(e => e.path === 'activity')).toBe(true);
        });

        it('HIBA - 400, ha a victimid érvénytelen (pl. nem szám)', async () => {
            const res = await request(app)
                .post('/api/admin/logs')
                .send({ activity: 'MUTE_USER', victimid: 'not_a_number' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'victimid')).toBe(true);
        });

        it('SIKER - 200, új log mentése session userid-vel', async () => {
            db.addLog.mockResolvedValue();
            await request(app)
                .post('/api/admin/logs')
                .send({ victimid: 5, activity: 'MUTE_USER' })
                .expect(200);
            expect(db.addLog).toHaveBeenCalledWith(99, 'MUTE_USER', 5);
        });

        it('SIKER - 200, mentés áldozat nélkül', async () => {
            db.addLog.mockResolvedValue();
            await request(app)
                .post('/api/admin/logs')
                .send({ activity: 'SERVER_RESTART' })
                .expect(200);
            expect(db.addLog).toHaveBeenCalledWith(99, 'SERVER_RESTART', undefined);
        });
    });

    describe('Végpont: POST /logs/exports', () => {
        testRequiresAdminOrAuth(() => request(app).post('/api/admin/logs/exports'));

        it('HIBA - 400, ha a dátum intervallum hibás', async () => {
            const res = await request(app)
                .post('/api/admin/logs/exports')
                .send({ periodFrom: '2024-05-10', periodTo: '2024-05-01' })
                .expect(400);
            expect(res.body.errors || res.body.error).toBeDefined();
        });

        it('HIBA - 400, ha a roles paraméter érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/logs/exports')
                .send({ roles: 'invalid_role_format' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'roles' || e.path === 'roles[0]')).toBe(true);
        });

        it('HIBA - 400, ha az activities paraméter érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/logs/exports')
                .send({ activities: 'invalid_activity_format' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'activities' || e.path === 'activities[0]')).toBe(true);
        });

        it('HIBA - 404, ha nincs exportálható adat', async () => {
            db.sortedLogs.mockResolvedValue({ total: 0, rows: [] });
            await request(app).post('/api/admin/logs/exports').send({}).expect(404);
        });

        it('HIBA - 404, tömb paraméterek (több filter) kezelésének ellenőrzése üres eredménynél', async () => {
            db.sortedLogs.mockResolvedValue({ total: 0, rows: [] });
            await request(app)
                .post('/api/admin/logs/exports')
                .send({ roles: ['ADMIN', 'MOD'], activities: ['Login'] })
                .expect(404);

            expect(db.sortedLogs).toHaveBeenCalledWith(undefined, undefined, undefined, ['ADMIN', 'MOD'], ['Login'], 1, 999999);
        });

        it('SIKER - 200, CSV generálása', async () => {
            const mockDate = "2026-04-25T14:00:00.000Z";
            db.sortedLogs.mockResolvedValue({
                total: 1,
                rows: [
                    { username: 'Admin', victim: 'User1', activity: 'Ban', happened_at: mockDate }
                ]
            });
            const res = await request(app).post('/api/admin/logs/exports').send({}).expect(200);
            expect(res.header['content-type']).toContain('text/csv');
            expect(res.text).toContain('Admin;User1;Ban;2026-04-25 14:00:00');
        });

        it('HIBA - 500, ha hiba történik az exportálás során', async () => {
            db.sortedLogs.mockRejectedValue(new Error("Export failure"));
            const res = await request(app).post('/api/admin/logs/exports').send({}).expect(500);
            expect(res.body.error).toBe(enTranslations.logsApi.export_error);
        });
    });
});