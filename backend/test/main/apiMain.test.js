require('./helpers/mocks.js');

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const apiMain = require('#main/apiMain.js');
const db = require('#sql/main/databaseMain.js');
const dbLogs = require('#sql/admin/databaseLogs.js');
const enTranslations = require('#locales/en/main.json');
const huTranslations = require('#locales/hu/main.json');
const { mockI18nMiddleware, suppressConsoleErrors, testRequiresAuth } = require('./helpers/helpers.js');

const app = express();
app.use(express.json());
app.use(mockI18nMiddleware);
app.use('/api', apiMain);

describe('Main API Tesztek (apiMain.js)', () => {
    suppressConsoleErrors();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Végpont: POST /auth/register', () => {
        const validUser = { username: 'TesztElek', email: 'teszt@elek.hu', password: 'StrongPassword1' };

        it('HIBA - 400, ha a username érvénytelen', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, username: '' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'username')).toBe(true);
        });

        it('HIBA - 400, ha az email érvénytelen', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, email: 'nem-email' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'email')).toBe(true);
        });

        it('HIBA - 400, ha a jelszó érvénytelen', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, password: 'rovid' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'password')).toBe(true);
        });

        it('HIBA - 409, felhasználónév vagy e-mail már foglalt', async () => {
            bcrypt.hash.mockResolvedValue('hashed');
            db.newUser.mockResolvedValue({ success: false });

            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser).expect(409);
            expect(res.body.error).toBe(enTranslations.apiMain.signup.user_exists);
        });

        it('SIKER - 201, sikeres regisztráció', async () => {
            bcrypt.hash.mockResolvedValue('hashed');
            db.newUser.mockResolvedValue({ success: true, insertId: 1 });
            dbLogs.addLog.mockResolvedValue();

            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(dbLogs.addLog).toHaveBeenCalledWith(1, 'Sign up');
        });

        it('HIBA - 500, szerver/DB hiba', async () => {
            db.newUser.mockRejectedValue(new Error('DB hiba'));
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser).expect(500);
            expect(res.body.error).toBe(enTranslations.apiMain.signup.error);
        });
    });

    describe('Végpont: POST /auth/login', () => {
        const validLogin = { username: 'TesztElek', password: 'StrongPassword1' };

        it('HIBA - 400, ha a username érvénytelen', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ password: 'StrongPassword1' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'username')).toBe(true);
        });

        it('HIBA - 400, ha a jelszó érvénytelen', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'TesztElek' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'password')).toBe(true);
        });

        it('HIBA - 401, nincs ilyen felhasználó (vagy törölt)', async () => {
            db.getUserByUsername.mockResolvedValue([]);
            const res = await request(app)
                .post('/api/auth/login')
                .send(validLogin)
                .expect(401);
            expect(res.body.error).toBe(enTranslations.apiMain.login.invalid_credentials);
        });

        it('HIBA - 401, hibás jelszó', async () => {
            db.getUserByUsername.mockResolvedValue([{ deleted_at: null, password: 'db_hash' }]);
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post('/api/auth/login')
                .send(validLogin)
                .expect(401);
            expect(res.body.error).toBe(enTranslations.apiMain.login.invalid_credentials);
        });

        it('SIKER - 200, sikeres bejelentkezés (username alapján)', async () => {
            db.getUserByUsername.mockResolvedValue([{ user_id: 1, username: 'TesztElek', role: 'user', language: 'hu', deleted_at: null, password: 'db_hash' }]);
            bcrypt.compare.mockResolvedValue(true);
            dbLogs.addLog.mockResolvedValue();

            const res = await request(app)
                .post('/api/auth/login')
                .send(validLogin)
                .expect(200);
            expect(res.body.message).toBe(enTranslations.apiMain.login.success);
            expect(res.body.role).toBe('user');
        });

        it('SIKER - 200, sikeres bejelentkezés e-mail címmel (validator.isEmail)', async () => {
            db.getUserByEmail.mockResolvedValue([{ user_id: 2, username: 'Elek', role: 'ADMIN', language: 'en', deleted_at: null, password: 'db_hash' }]);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'teszt@elek.hu', password: 'StrongPassword1' })
                .expect(200);
            expect(db.getUserByEmail).toHaveBeenCalledWith('teszt@elek.hu');
            expect(res.body.role).toBe('ADMIN');
        });
    });

    describe('Végpont: DELETE /auth/logout', () => {
        it('SIKER - 200, sikeres kijelentkezés', async () => {
            const res = await request(app)
                .delete('/api/auth/logout')
                .expect(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('Végpont: GET /auth/status', () => {
        it('SIKER - 200, nincs bejelentkezve', async () => {
            const res = await request(app)
                .get('/api/auth/status')
                .expect(200);
            expect(res.body.login).toBe(false);
        });

        it('SIKER - 200, bejelentkezve sima userként', async () => {
            const loggedInApp = express();
            loggedInApp.use((req, res, next) => {
                req.session = { userid: 1, role: 'user' };
                next();
            });
            loggedInApp.use(mockI18nMiddleware);
            loggedInApp.use('/api', apiMain);

            db.getUserNameProfile.mockResolvedValue([{ username: 'Elek' }]);

            const res = await request(loggedInApp)
                .get('/api/auth/status')
                .expect(200);
            expect(res.body.login).toBe(true);
            expect(res.body.user.username).toBe('Elek');
            expect(res.body.adminLink).toBeUndefined();
        });
    });

    describe('Végpont: GET /users/language', () => {
        testRequiresAuth(() => request(app).get('/api/users/language'));

        it('SIKER - 200, nyelv lekérése', async () => {
            const res = await request(app)
                .get('/api/users/language')
                .expect(200);
            expect(res.body.language).toBe("en");
        });

        it('HIBA - 500, ha valami váratlan hiba történik (catch ág)', async () => {
            const tempApp = express();
            tempApp.use(mockI18nMiddleware);
            tempApp.use((req, res, next) => {
                req.session = {};
                Object.defineProperty(req.session, 'userLanguage', {
                    get: () => { throw new Error('Szimulált hiba a catch ág eléréséhez'); },
                    set: () => { }
                });
                next();
            });
            tempApp.use('/api', apiMain);
            const res = await request(tempApp)
                .get('/api/users/language')
                .expect(500);
            expect(res.body.error).toBe(enTranslations.apiMain.language_fetch_error);
        });
    });
});