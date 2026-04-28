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

    describe('Végpont: GET /getLogs', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/getLogs'));

        it('SIKER - 200, alapértelmezett adatok lekérése', async () => {
            db.getLogs.mockResolvedValue({ total: 2, rows: [{}, {}] });
            const res = await request(app).get('/api/admin/getLogs').expect(200);
            expect(res.body.message).toBe(enTranslations.logsApi.fetch_success);
            expect(res.body.logs).toHaveLength(2);
        });

        it('HIBA - 500, ha az adatbázis összeomlik', async () => {
            db.getLogs.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app).get('/api/admin/getLogs').expect(500);
            expect(res.body.error).toBe(enTranslations.logsApi.fetch_error);
        });
    });

    describe('Végpont: GET /sortedLogs', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/sortedLogs'));

        it('HIBA - 400, ha a dátum intervallum hibás', async () => {
            await request(app)
                .get('/api/admin/sortedLogs')
                .query({ periodFrom: '2024-05-10', periodTo: '2024-05-01' })
                .expect(400);
        });

        it('SIKER - 200, ha nincs találat (üres lista)', async () => {
            db.sortedLogs.mockResolvedValue({ total: 0, rows: [] });
            const res = await request(app).get('/api/admin/sortedLogs').expect(200);
            expect(res.body.logs).toHaveLength(0);
        });

        it('SIKER - 200, szűrés ellenőrzése egy paraméterrel', async () => {
            db.sortedLogs.mockResolvedValue({ total: 1, rows: [] });
            await request(app)
                .get('/api/admin/sortedLogs')
                .query({ roles: 'user', activities: 'login', page: 2 })
                .expect(200);

            expect(db.sortedLogs).toHaveBeenCalledWith(
                undefined, undefined, undefined, ['user'], ['login'], "2"
            );
        });

        it('HIBA - 500 hibaüzenet ellenőrzése', async () => {
            db.sortedLogs.mockRejectedValue(new Error('SQL Error'));
            const res = await request(app).get('/api/admin/sortedLogs').expect(500);
            expect(res.body.error).toBe("SQL Error");
        });
    });

    describe('Végpont: POST /addLog', () => {
        testRequiresAdminOrAuth(() => request(app).post('/api/admin/addLog'));

        it('HIBA - 400, ha az activity hiányzik vagy rövid', async () => {
            await request(app).post('/api/admin/addLog').send({ activity: 'a' }).expect(400);
        });

        it('SIKER - 200, új log mentése session userid-vel', async () => {
            db.addLog.mockResolvedValue();
            await request(app)
                .post('/api/admin/addLog')
                .send({ victimid: 5, activity: 'MUTE_USER' })
                .expect(200);
            expect(db.addLog).toHaveBeenCalledWith(99, 'MUTE_USER', 5);
        });

        it('SIKER - 200, mentés áldozat nélkül', async () => {
            db.addLog.mockResolvedValue();
            await request(app)
                .post('/api/admin/addLog')
                .send({ activity: 'SERVER_RESTART' })
                .expect(200);
            expect(db.addLog).toHaveBeenCalledWith(99, 'SERVER_RESTART', undefined);
        });
    });

    describe('Végpont: POST /exportLogs', () => {
        testRequiresAdminOrAuth(() => request(app).post('/api/admin/exportLogs'));

        it('HIBA - 404, ha nincs exportálható adat', async () => {
            db.sortedLogs.mockResolvedValue({ total: 0, rows: [] });
            await request(app).post('/api/admin/exportLogs').send({}).expect(404);
        });

        it('SIKER - 200, CSV generálása', async () => {
            const mockDate = "2026-04-25T14:00:00.000Z";
            db.sortedLogs.mockResolvedValue({
                total: 1,
                rows: [
                    { username: 'Admin', victim: 'User1', activity: 'Ban', happened_at: mockDate }
                ]
            });
            const res = await request(app).post('/api/admin/exportLogs').send({}).expect(200);
            expect(res.header['content-type']).toContain('text/csv');
            expect(res.text).toContain('Admin;User1;Ban;2026-04-25 14:00:00');
        });

        it('HIBA - 500, ha hiba történik az exportálás során', async () => {
            db.sortedLogs.mockRejectedValue(new Error("Export failure"));
            const res = await request(app).post('/api/admin/exportLogs').send({}).expect(500);
            expect(res.body.error).toBe(enTranslations.logsApi.export_error);
        });
    });
});