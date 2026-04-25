const request = require('supertest');
const express = require('express');
const db = require('../../private/backend/sql/databaseLogs.js');
const auth = require('../../private/backend/auth.js');

jest.mock('../../private/backend/sql/databaseLogs.js');

jest.mock('../../private/backend/auth.js', () => ({
    checkAuth: (req, res, next) => {
        if (req.headers.unauthenticated) {
            return res.status(401).json({ message: "Bejelentkezés szükséges!" });
        }
        if (!req.session) req.session = {};
        req.session.userid = 99;
        req.session.role = "ADMIN";
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

describe('Admin Logs API Átfogó Tesztek', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Végpont: GET /getLogs', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .get('/api/admin/getLogs')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .get('/api/admin/getLogs')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('SIKER - 200, alapértelmezett adatok lekérése', async () => {
            db.getLogs.mockResolvedValue({ total: 2, rows: [{}, {}] });
            const res = await request(app).get('/api/admin/getLogs').expect(200);
            expect(res.body.message).toBe("Sikeres lekérés");
            expect(res.body.logs).toHaveLength(2);
        });

        it('HIBA - 500, ha az adatbázis összeomlik', async () => {
            db.getLogs.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app).get('/api/admin/getLogs').expect(500);
            expect(res.body.error).toBe("Hiba a lekérdezés során");
        });
    });

    describe('Végpont: GET /sortedLogs', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .get('/api/admin/sortedLogs')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .get('/api/admin/sortedLogs')
                .set('notadmin', 'true')
                .expect(404);
        });

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
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .post('/api/admin/addLog')
                .set('unauthenticated', 'true')
                .send({ activity: 'VALID_ACTIVITY' })
                .expect(401);
        });

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
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .post('/api/admin/exportLogs')
                .set('unauthenticated', 'true')
                .expect(401);
        });

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
            expect(res.body.error).toBe("Export error");
        });
    });
});