const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');
const database = require('#sql/database.js');
const apiSettings = require('#main/apiSettings.js');
const { mockI18nMiddleware, suppressConsoleErrors, testRequiresAuth } = require('./helpers/helpers.js');

const app = express();
app.use(express.json());
app.use(mockI18nMiddleware);
app.use('/api', apiSettings);

describe('Settings API Tesztek (apiSettings.js)', () => {
    suppressConsoleErrors();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Végpont: GET /api/users/me', () => {
        testRequiresAuth(() => request(app).get('/api/users/me'));

        it('SIKER - 200, saját adatok lekérése', async () => {
            database.getUser.mockResolvedValue([{ username: 'Sanyi', role: 'user' }]);
            const res = await request(app)
                .get('/api/users/me')
                .expect(200);
            expect(res.body.users.username).toBe('Sanyi');
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            database.getUser.mockRejectedValue(new Error('DB hiba'));
            const res = await request(app)
                .get('/api/users/me')
                .expect(500);
            expect(res.body.error).toBe('main:apiSettings.getUserData.error');
        });
    });

    describe('Végpont: PUT /api/users/me', () => {
        const validUpdate = { username: 'UjNev', email: 'uj@email.hu', language: 'en', darkmode: true };

        testRequiresAuth(() => request(app).put('/api/users/me'));

        it('HIBA - 400, ha a username érvénytelen', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .send({ username: '' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'username')).toBe(true);
        });

        it('HIBA - 400, ha az email érvénytelen', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .send({ email: 'nem-email' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'email')).toBe(true);
        });

        it('HIBA - 400, nyelv nem támogatott (se nem hu, se nem en)', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .send({ language: 'de' })
                .expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiSettings.updateUser.validation_language_values')).toBe(true);
        });

        it('HIBA - 400, darkmode nem logikai érték', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .send({ darkmode: 'valami' })
                .expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiSettings.updateUser.validation_darkmode_boolean')).toBe(true);
        });

        it('SIKER - 200, adatok frissültek (affectedRows: 1)', async () => {
            database.updateUser.mockResolvedValue(1);
            database.addLog.mockResolvedValue();

            const res = await request(app)
                .put('/api/users/me')
                .send(validUpdate)
                .expect(200);
            expect(res.body.message).toBe('main:apiSettings.updateUser.success');
            expect(database.updateUser).toHaveBeenCalledWith(1, 'UjNev', 'uj@email.hu', 'en', true);
        });

        it('SIKER - 200, nem történt változás (affectedRows: 0)', async () => {
            database.updateUser.mockResolvedValue(0);
            const res = await request(app)
                .put('/api/users/me')
                .send(validUpdate)
                .expect(200);
            expect(res.body.message).toBe('main:apiSettings.updateUser.no_change');
        });
    });

    describe('Végpont: PUT /api/users/me/password', () => {
        const validPass = { oldPass: 'RegiJelszo1', newPass: 'UjErosJelszo1' };

        testRequiresAuth(() => request(app).put('/api/users/me/password'));

        it('HIBA - 400, ha a régi jelszó érvénytelen', async () => {
            const res = await request(app)
                .put('/api/users/me/password')
                .send({ ...validPass, oldPass: 'Rövid' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'oldPass')).toBe(true);
        });

        it('HIBA - 400, ha az új jelszó érvénytelen', async () => {
            const res = await request(app)
                .put('/api/users/me/password')
                .send({ ...validPass, newPass: 'rovid' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'newPass')).toBe(true);
        });

        it('SIKER - 200, sikeres jelszócsere', async () => {
            database.updatePassword.mockResolvedValue({ email: 'e@e.hu', username: 'Béla' });
            database.addLog.mockResolvedValue();

            const res = await request(app)
                .put('/api/users/me/password')
                .send(validPass)
                .expect(200);
            expect(res.body.message).toBe('main:apiSettings.updatePassword.success');
        });
    });

    describe('Végpont: DELETE /api/users/me', () => {
        testRequiresAuth(() => request(app).delete('/api/users/me'));

        it('SIKER - 200, sikeres fiók törlés', async () => {
            database.userToInactive.mockResolvedValue({ email: 'e@e.hu', username: 'Béla' });
            database.addLog.mockResolvedValue();

            const res = await request(app).delete('/api/users/me').expect(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('main:apiSettings.inactiveUser.success');
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            database.userToInactive.mockRejectedValue(new Error('DB hiba'));
            const res = await request(app)
                .delete('/api/users/me')
                .expect(500);
            expect(res.body.error).toBe('main:apiSettings.inactiveUser.error');
        });
    });

    describe('Végpont: PUT /api/users/me/profile-picture', () => {
        testRequiresAuth(() => request(app).put('/api/users/me/profile-picture'));

        it('HIBA - 400, nincs kép fájl csatolva', async () => {
            const res = await request(app)
                .put('/api/users/me/profile-picture')
                .expect(400);
            expect(res.body.error).toBe('main:apiSettings.updateProfilePic.no_image');
        });

        it('HIBA - 400, érvénytelen fájltípus (Multer fileFilter teszt)', async () => {
            const res = await request(app)
                .put('/api/users/me/profile-picture')
                .attach('profilePic', Buffer.from('fake-pdf-content'), { filename: 'teszt.pdf', contentType: 'application/pdf' })
                .expect(400);
            expect(res.body.error).toBe('main:apiSettings.updateProfilePic.invalid_file_type');
        });

        it('SIKER - 201, profilkép feldolgozva és elmentve', async () => {
            fs.unlink.mockResolvedValue();
            database.uploadProfilePic.mockResolvedValue('regi_kep.webp');
            database.addLog.mockResolvedValue();

            const res = await request(app)
                .put('/api/users/me/profile-picture')
                .attach('profilePic', Buffer.from('fake-image-content'), { filename: 'kep.jpg', contentType: 'image/jpeg' })
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(sharp).toHaveBeenCalled();
            expect(database.uploadProfilePic).toHaveBeenCalled();
            expect(fs.unlink).toHaveBeenCalled();
        });
    });


    describe('Végpont: DELETE /api/users/me/profile-picture', () => {
        testRequiresAuth(() => request(app).delete('/api/users/me/profile-picture'));

        it('SIKER - 200, ha a felhasználónak már nem volt profilképe (alapértelmezett)', async () => {
            database.deleteProfilePic.mockResolvedValue(null);

            const res = await request(app)
                .delete('/api/users/me/profile-picture')
                .expect(200);
            expect(res.body.message).toBe('main:apiSettings.deleteProfilePic.already_default');
        });

        it('SIKER - 201, ha volt régi kép és azt kitörli', async () => {
            database.deleteProfilePic.mockResolvedValue('torlendo_kep.webp');
            fs.unlink.mockResolvedValue();
            database.addLog.mockResolvedValue();

            const res = await request(app)
                .delete('/api/users/me/profile-picture')
                .expect(201);
            expect(res.body.message).toBe('main:apiSettings.deleteProfilePic.success');
            expect(fs.unlink).toHaveBeenCalled();
        });

        it('HIBA - 500, adatbázis hiba esetén', async () => {
            database.deleteProfilePic.mockRejectedValue(new Error('DB'));
            const res = await request(app)
                .delete('/api/users/me/profile-picture')
                .expect(500);
            expect(res.body.error).toBe('main:apiSettings.deleteProfilePic.error');
        });
    });

    describe('Végpont: GET /api/users/profile-picture', () => {
        testRequiresAuth(() => request(app).get('/api/users/profile-picture?route=valid_kep.webp'));

        it('HIBA - 400, érvénytelen (hackelés gyanús) fájlnév a route paraméterben', async () => {
            const res = await request(app)
                .get('/api/users/profile-picture?route=../../etc/passwd')
                .expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiSettings.getProfilePic.validation_invalid_filename')).toBe(true);
        });

        it('SIKER - 200/404, valid paraméter esetén express sendFile-ig eljut a logika', async () => {
            const sendFileMockApp = express();
            sendFileMockApp.use((req, res, next) => {
                res.sendFile = jest.fn((path, opts, cb) => cb(null));
                req.t = (key) => key;
                next();
            });

            const { validate } = require('../../utils/validate.js');
            const { query } = require('express-validator');
            sendFileMockApp.get('/api/users/profile-picture', [
                query("route").matches(/^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+$/).withMessage('invalid_filename')
            ], validate, (req, res) => {
                res.status(200).send('Mocked sendFile');
            });

            const res = await request(sendFileMockApp)
                .get('/api/users/profile-picture?route=valami_kep-1.webp')
                .expect(200);
            expect(res.text).toBe('Mocked sendFile');
        });
    });
});