const request = require('supertest');
const express = require('express');
const db = require('../../sql/admin/databaseSettings.js');
const auth = require('../../utils/auth.js');
const enTranslations = require('../../locales/en/admin.json');
const huTranslations = require('../../locales/hu/admin.json');

jest.mock('../../sql/admin/databaseSettings.js');
jest.mock('../../sql/admin/databaseLogs.js');

jest.mock('../../utils/auth.js', () => ({
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
    if (!req.session) req.session = { userLanguage: 'en' };
    req.t = (key) => {
        const lang = req.session.userLanguage || 'en';
        const translations = lang === 'en' ? enTranslations : huTranslations;
        const [namespace, ...keys] = key.split(':');
        const keyPath = keys.join(':');

        if (namespace !== 'admin') return key;
        const result = keyPath.split('.').reduce((obj, k) => obj && obj[k] !== undefined ? obj[k] : undefined, translations);
        return result || key;
    };

    next();
});

app.use('/api/admin', auth.checkAuth, auth.checkRole("ADMIN"), require('../../api/admin/index.js'));

describe('Admin Settings API-tesztek', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Végpont: GET /getAdminSettings', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .get('/api/admin/getAdminSettings')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .get('/api/admin/getAdminSettings')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('SIKER - 200, admin beállítások lekérése', async () => {
            db.getAdminSettings.mockResolvedValue({ darkmode: 1, selectedChart: "activity-day" });
            const res = await request(app).get('/api/admin/getAdminSettings').expect(200);
            expect(res.body.darkmode).toBe(1);
            expect(res.body.selectedChart).toBe("activity-day");
        });

        it('SIKER - 200, ha nincs még admin beállítás', async () => {
            db.getAdminSettings.mockResolvedValue(undefined);
            const res = await request(app).get('/api/admin/getAdminSettings').expect(200);
            expect(res.body.darkmode).toBe(0);
            expect(res.body.selectedChart).toBe("activity-week");
        });

        it('HIBA - 500, ha az adatbázis összeomlik', async () => {
            db.getAdminSettings.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app).get('/api/admin/getAdminSettings').expect(500);
            expect(res.body.error).toBe(enTranslations.settingsApi.fetch_error);
        });
    });
    describe('Végpont: PUT /updateAdminSettings', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .put('/api/admin/updateAdminSettings')
                .set('unauthenticated', 'true')
                .send({ darkmode: true, selected_chart: "activity-day" })
                .expect(401);
        });
        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .put('/api/admin/updateAdminSettings')
                .set('notadmin', 'true')
                .send({ darkmode: true, selected_chart: "activity-day" })
                .expect(404);
        });

        it('HIBA - 400, ha a darkmode értéke nem true/false', async () => {
            await request(app)
                .put('/api/admin/updateAdminSettings')
                .send({ darkmode: "not-a-boolean", selected_chart: "activity-day" })
                .expect(400);
        });

        it('HIBA - 400, ha a selected chart nincs benne a megadott listában', async () => {
            await request(app)
                .put('/api/admin/updateAdminSettings')
                .send({ darkmode: true, selected_chart: "invalid-chart" })
                .expect(400);
        });

        it('SIKER - 200, ugyanazok a beállítások miatt nincs frissités', async () => {
            db.updateAdminSettings.mockResolvedValue(0);
            const res = await request(app)
                .put('/api/admin/updateAdminSettings')
                .send({ darkmode: true, selected_chart: "activity-day" })
                .expect(200);
            expect(res.body.message).toBe(enTranslations.settingsApi.update_no_change);
        });

        it('SIKER - 200, új beállítás beszúrása (affectedRows: 1)', async () => {
            db.updateAdminSettings.mockResolvedValue(1);

            const res = await request(app)
                .put('/api/admin/updateAdminSettings')
                .send({ darkmode: true, selected_chart: "activity-day" })
                .expect(200);

            expect(res.body.message).toBe(enTranslations.settingsApi.update_success);
        });

        it('SIKER - 200, létező beállítás módosítása (affectedRows: 2)', async () => {
            db.updateAdminSettings.mockResolvedValue(2);

            const res = await request(app)
                .put('/api/admin/updateAdminSettings')
                .send({ darkmode: false, selected_chart: "activity-week" })
                .expect(200);

            expect(res.body.message).toBe(enTranslations.settingsApi.update_success);
        });

        it('HIBA - 500, ha az adatbázis összeomlik', async () => {
            db.updateAdminSettings.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app)
                .put('/api/admin/updateAdminSettings')
                .send({ darkmode: true, selected_chart: "activity-day" })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.settingsApi.update_error);
        });
    });
    describe('Végpont: PUT /userDarkMode', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .put('/api/admin/userDarkMode')
                .set('unauthenticated', 'true')
                .send({ darkmode: true })
                .expect(401);
        });
        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .put('/api/admin/userDarkMode')
                .set('notadmin', 'true')
                .send({ darkmode: true })
                .expect(404);
        });

        it('HIBA - 400, ha a darkmode értéke nem true/false', async () => {
            await request(app)
                .put('/api/admin/userDarkMode')
                .send({ darkmode: "not-a-boolean" })
                .expect(400);
        });

        it('SIKER - 200, sikeres frissítés', async () => {
            db.updateDarkMode.mockResolvedValue(1);
            const res = await request(app)
                .put('/api/admin/userDarkMode')
                .send({ darkmode: true })
                .expect(200);
            expect(res.body.message).toBe(enTranslations.settingsApi.user_update_success);
        });

        it('SIKER - 200, ha nem történt változtatás', async () => {
            db.updateDarkMode.mockResolvedValue(0);
            const res = await request(app)
                .put('/api/admin/userDarkMode')
                .send({ darkmode: true })
                .expect(200);
            expect(res.body.message).toBe(enTranslations.settingsApi.update_no_change);
        });

        it('HIBA - 500, ha az adatbázis összeomlik', async () => {
            db.updateDarkMode.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app)
                .put('/api/admin/userDarkMode')
                .send({ darkmode: true })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.settingsApi.update_error);
        });
    });
    describe('Végpont: PUT /updateLanguage', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .put('/api/admin/updateLanguage')
                .set('unauthenticated', 'true')
                .send({ language: "en" })
                .expect(401);
        });
        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .put('/api/admin/updateLanguage')
                .set('notadmin', 'true')
                .send({ language: "en" })
                .expect(404);
        });

        it('HIBA - 400, ha a language értéke nem "en" vagy "hu"', async () => {
            await request(app)
                .put('/api/admin/updateLanguage')
                .send({ language: "de" })
                .expect(400);
        });

        it('SIKER - 200, sikeres frissítés', async () => {
            db.updateLanguage.mockResolvedValue(1);
            const res = await request(app)
                .put('/api/admin/updateLanguage')
                .send({ language: "hu" })
                .expect(200);
            expect(res.body.message).toBe(enTranslations.settingsApi.update_success);
            expect(res.body.language).toBe("hu");
        });

        it('SIKER - 200, ha nem történt változtatás', async () => {
            db.updateLanguage.mockResolvedValue(0);
            const res = await request(app)
                .put('/api/admin/updateLanguage')
                .send({ language: "en" })
                .expect(200);
            expect(res.body.message).toBe(enTranslations.settingsApi.update_no_change);
            expect(res.body.language).toBe("en");
        });

        it('HIBA - 500, ha az adatbázis összeomlik', async () => {
            db.updateLanguage.mockRejectedValue(new Error("DB hiba"));
            const res = await request(app)
                .put('/api/admin/updateLanguage')
                .send({ language: "en" })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.settingsApi.update_error);
        });
    });
});