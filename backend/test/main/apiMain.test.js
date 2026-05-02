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
app.use('/api/main', apiMain);

describe('Main API Tesztek (apiMain.js)', () => {
    suppressConsoleErrors();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/main/auth/register', () => {
        const validUser = { username: 'TesztElek', email: 'teszt@elek.hu', password: 'StrongPassword1' };

        it('HIBA - 400, username email formátumú', async () => {
            const res = await request(app).post('/api/main/auth/register').send({ ...validUser, username: 'email@form.hu' }).expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiMain.signup.validation_username_no_email')).toBe(true);
        });

        it('HIBA - 400, username érvénytelen karaktereket tartalmaz', async () => {
            const res = await request(app).post('/api/main/auth/register').send({ ...validUser, username: 'Teszt Elek!' }).expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiMain.signup.validation_username_invalid_chars')).toBe(true);
        });

        it('HIBA - 400, username túl rövid (0 karakter)', async () => {
            const res = await request(app).post('/api/main/auth/register').send({ ...validUser, username: '' }).expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiMain.signup.validation_username_length')).toBe(true);
        });

        it('HIBA - 400, email formátum érvénytelen', async () => {
            const res = await request(app).post('/api/main/auth/register').send({ ...validUser, email: 'nem-email' }).expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiMain.signup.validation_email_format')).toBe(true);
        });

        it('HIBA - 400, jelszó túl rövid', async () => {
            const res = await request(app).post('/api/main/auth/register').send({ ...validUser, password: 'Rovid1A' }).expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiMain.signup.validation_password_length')).toBe(true);
        });

        it('HIBA - 400, jelszóban nincs szám', async () => {
            const res = await request(app).post('/api/main/auth/register').send({ ...validUser, password: 'StrongPasswordWithoutNum' }).expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiMain.signup.validation_password_digit')).toBe(true);
        });

        it('HIBA - 400, jelszóban nincs nagybetű', async () => {
            const res = await request(app).post('/api/main/auth/register').send({ ...validUser, password: 'strongpassword1' }).expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiMain.signup.validation_password_uppercase')).toBe(true);
        });

        it('HIBA - 409, felhasználónév vagy e-mail már foglalt', async () => {
            bcrypt.hash.mockResolvedValue('hashed');
            database.newUser.mockResolvedValue({ success: false });

            const res = await request(app).post('/api/main/auth/register').send(validUser).expect(409);
            expect(res.body.error).toBe('main:apiMain.signup.user_exists');
        });

        it('SIKER - 201, sikeres regisztráció', async () => {
            bcrypt.hash.mockResolvedValue('hashed');
            database.newUser.mockResolvedValue({ success: true, insertId: 1 });
            database.addLog.mockResolvedValue();

            const res = await request(app).post('/api/main/auth/register').send(validUser).expect(201);
            expect(res.body.success).toBe(true);
            expect(database.addLog).toHaveBeenCalledWith(1, 'Sign up');
        });

        it('HIBA - 500, szerver/DB hiba', async () => {
            database.newUser.mockRejectedValue(new Error('DB hiba'));
            const res = await request(app).post('/api/main/auth/register').send(validUser).expect(500);
            expect(res.body.error).toBe('main:apiMain.signup.error');
        });
    });

    describe('POST /api/main/auth/login', () => {
        const validLogin = { username: 'TesztElek', password: 'StrongPassword1' };

        it('HIBA - 400, hiányzó felhasználónév', async () => {
            const res = await request(app).post('/api/main/auth/login').send({ password: 'StrongPassword1' }).expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiMain.login.validation_username_length')).toBe(true);
        });

        it('HIBA - 400, hiányzó jelszó', async () => {
            const res = await request(app).post('/api/main/auth/login').send({ username: 'TesztElek' }).expect(400);
            expect(res.body.errors.some(e => e.msg === 'main:apiMain.login.validation_password_length')).toBe(true);
        });

        it('HIBA - 401, nincs ilyen felhasználó (vagy törölt)', async () => {
            database.getUserByUsername.mockResolvedValue([]);
            const res = await request(app).post('/api/main/auth/login').send(validLogin).expect(401);
            expect(res.body.error).toBe('main:apiMain.login.invalid_credentials');
        });

        it('HIBA - 401, hibás jelszó', async () => {
            database.getUserByUsername.mockResolvedValue([{ deleted_at: null, password: 'db_hash' }]);
            bcrypt.compare.mockResolvedValue(false); // Nem egyezik

            const res = await request(app).post('/api/main/auth/login').send(validLogin).expect(401);
            expect(res.body.error).toBe('main:apiMain.login.invalid_credentials');
        });

        it('SIKER - 200, sikeres bejelentkezés (username alapján)', async () => {
            database.getUserByUsername.mockResolvedValue([{ user_id: 1, username: 'TesztElek', role: 'user', language: 'hu', deleted_at: null, password: 'db_hash' }]);
            bcrypt.compare.mockResolvedValue(true); // Egyezik
            database.addLog.mockResolvedValue();

            const res = await request(app).post('/api/main/auth/login').send(validLogin).expect(200);
            expect(res.body.message).toBe('main:apiMain.login.success');
            expect(res.body.role).toBe('user');
        });

        it('SIKER - 200, sikeres bejelentkezés e-mail címmel (validator.isEmail)', async () => {
            database.getUserByEmail.mockResolvedValue([{ user_id: 2, username: 'Elek', role: 'ADMIN', language: 'en', deleted_at: null, password: 'db_hash' }]);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app).post('/api/main/auth/login').send({ username: 'teszt@elek.hu', password: 'StrongPassword1' }).expect(200);
            expect(database.getUserByEmail).toHaveBeenCalledWith('teszt@elek.hu');
            expect(res.body.role).toBe('ADMIN');
        });
    });
    describe('DELETE /api/main/auth/logout', () => {
        it('SIKER - 200, sikeres kijelentkezés', async () => {
            const res = await request(app).delete('/api/main/auth/logout').expect(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /api/main/auth/status', () => {
        it('SIKER - 200, nincs bejelentkezve', async () => {
            const res = await request(app).get('/api/main/auth/status').expect(200);
            expect(res.body.login).toBe(false);
        });

        it('SIKER - 200, bejelentkezve sima userként', async () => {
            const loggedInApp = express();
            loggedInApp.use((req, res, next) => {
                req.session = { userid: 1, role: 'user' };
                next();
            });
            loggedInApp.use(mockI18nMiddleware);
            loggedInApp.use('/api/main', apiMain);

            database.getUserNameProfile.mockResolvedValue([{ username: 'Elek' }]);

            const res = await request(loggedInApp).get('/api/main/auth/status').expect(200);
            expect(res.body.login).toBe(true);
            expect(res.body.user.username).toBe('Elek');
            expect(res.body.adminLink).toBeUndefined();
        });
    });

    describe('GET /api/main/users/language', () => {
        it('SIKER - 200, nyelv lekérése', async () => {
            const loggedInApp = express();
            loggedInApp.use((req, res, next) => {
                req.session = { userLanguage: 'en' };
                next();
            });
            loggedInApp.use(mockI18nMiddleware);
            loggedInApp.use('/api/main', apiMain);

            const res = await request(loggedInApp).get('/api/main/users/language').expect(200);
            expect(res.body.language).toBe('en');
        });
    });
});