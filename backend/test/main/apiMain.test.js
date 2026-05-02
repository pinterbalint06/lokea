require('./helpers/mocks.js');

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const database = require('#sql/database.js');
const apiMain = require('#main/apiMain.js');
const { mockI18nMiddleware, suppressConsoleErrors } = require('./helpers/helpers.js');

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
            database.newUser.mockResolvedValue({ success: false });

            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser).expect(409);
            expect(res.body.error).toBe('main:apiMain.signup.user_exists');
        });

        it('SIKER - 201, sikeres regisztráció', async () => {
            bcrypt.hash.mockResolvedValue('hashed');
            database.newUser.mockResolvedValue({ success: true, insertId: 1 });
            database.addLog.mockResolvedValue();

            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(database.addLog).toHaveBeenCalledWith(1, 'Sign up');
        });

        it('HIBA - 500, szerver/DB hiba', async () => {
            database.newUser.mockRejectedValue(new Error('DB hiba'));
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser).expect(500);
            expect(res.body.error).toBe('main:apiMain.signup.error');
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
            database.getUserByUsername.mockResolvedValue([]);
            const res = await request(app)
                .post('/api/auth/login')
                .send(validLogin)
                .expect(401);
            expect(res.body.error).toBe('main:apiMain.login.invalid_credentials');
        });

        it('HIBA - 401, hibás jelszó', async () => {
            database.getUserByUsername.mockResolvedValue([{ deleted_at: null, password: 'db_hash' }]);
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post('/api/auth/login')
                .send(validLogin)
                .expect(401);
            expect(res.body.error).toBe('main:apiMain.login.invalid_credentials');
        });

        it('SIKER - 200, sikeres bejelentkezés (username alapján)', async () => {
            database.getUserByUsername.mockResolvedValue([{ user_id: 1, username: 'TesztElek', role: 'user', language: 'hu', deleted_at: null, password: 'db_hash' }]);
            bcrypt.compare.mockResolvedValue(true);
            database.addLog.mockResolvedValue();

            const res = await request(app)
                .post('/api/auth/login')
                .send(validLogin)
                .expect(200);
            expect(res.body.message).toBe('main:apiMain.login.success');
            expect(res.body.role).toBe('user');
        });

        it('SIKER - 200, sikeres bejelentkezés e-mail címmel (validator.isEmail)', async () => {
            database.getUserByEmail.mockResolvedValue([{ user_id: 2, username: 'Elek', role: 'ADMIN', language: 'en', deleted_at: null, password: 'db_hash' }]);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'teszt@elek.hu', password: 'StrongPassword1' })
                .expect(200);
            expect(database.getUserByEmail).toHaveBeenCalledWith('teszt@elek.hu');
            expect(res.body.role).toBe('ADMIN');
        });
    });
    describe('Végpont: DELETE /auth/logout', () => {
        testRequiresAuth(() => request(app).put('/api/auth/logout'));

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

            database.getUserNameProfile.mockResolvedValue([{ username: 'Elek' }]);

            const res = await request(loggedInApp)
                .get('/api/auth/status')
                .expect(200);
            expect(res.body.login).toBe(true);
            expect(res.body.user.username).toBe('Elek');
            expect(res.body.adminLink).toBeUndefined();
        });
    });

    describe('Végpont: GET /language', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/language'));

        it('SIKER - 200, nyelv lekérése', async () => {
            const res = await request(app)
                .get('/api/language')
                .expect(200);
            expect(res.body.language).toBe("en");
        });

        it('HIBA - 401, ha nincs session (biztonsági ellenőrzés)', async () => {
            const tempApp = express();
            tempApp.use(mockI18nMiddleware);
            tempApp.use((req, res, next) => {
                delete req.session;
                next();
            });
            // tempApp.use('/api/admin', require('#admin/apiAdmin.js'));
            const res = await request(tempApp)
                .get('/api/language')
                .expect(401);
            expect(res.body.error).toBe(enTranslations.adminApi.language_fetch_error);
        });

        it('HIBA - 500, ha valami váratlan hiba történik (catch ág)', async () => {
            const tempApp = express();
            tempApp.use(mockI18nMiddleware);
            tempApp.use((req, res, next) => {
                delete req.session;
                Object.defineProperty(req, 'session', {
                    get: () => { throw new Error('Szimulált hiba a catch ág eléréséhez'); }
                });
                next();
            });
            // tempApp.use('/api/admin', require('#admin/apiAdmin.js'));
            const res = await request(tempApp)
                .get('/api/language')
                .expect(500);
            expect(res.body.error).toBe(enTranslations.adminApi.language_fetch_error);
        });
    });
});