require('./helpers/mocks.js');

const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const db = require('#sql/admin/databaseUsers.js');
const dbLogs = require('#sql/admin/databaseLogs.js');
const auth = require('#middlewares/auth.js');
const multer = require('multer');
const sharp = require('sharp');
const enTranslations = require('#locales/en/admin.json');
const huTranslations = require('#locales/hu/admin.json');
const { mockI18nMiddleware, testRequiresAdminOrAuth, suppressConsoleErrors } = require('./helpers/helpers.js');

const { sendWelcomeEmail, sendChangeEmail, sendDeleteEmail } = require('#utils/mails.js');

const app = express();
app.use(express.json());

app.use(mockI18nMiddleware);

app.use('/api/admin', require('#admin/index.js'));

describe('Admin Users API-tesztek', () => {
    suppressConsoleErrors();
    beforeEach(() => {
        fs.unlink.mockResolvedValue(undefined);
    });

    describe('GET /api/admin/users', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/users'));

        it('SIKER - 200, felhasználók lekérése', async () => {
            const mockUsers = { rows: [{ deleted_at: null, user_id: 1, username: 'User1', email: 'user1@example.com', role: 'user' }], total: 1 };
            db.getUsers.mockResolvedValue(mockUsers);
            const res = await request(app).get('/api/admin/users').expect(200);
            expect(res.body.users).toHaveLength(1);
            expect(res.body.total).toBe(1);
        });

        it('SIKER - 200, nincs felhasználó', async () => {
            const mockUsers = { rows: [], total: 0 };
            db.getUsers.mockResolvedValue(mockUsers);
            const res = await request(app).get('/api/admin/users').expect(200);
            expect(res.body.users).toHaveLength(0);
            expect(res.body.total).toBe(0);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.getUsers.mockRejectedValue(new Error('Database error'));
            const res = await request(app).get('/api/admin/users').expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.fetch_all_error);
        });
    });

    describe('GET /api/admin/users/sorted', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/users/sorted'));

        it('HIBA - 400, ha a keresési típus (mireKeresek) érvénytelen', async () => {
            const res = await request(app)
                .get('/api/admin/users/sorted')
                .query({ mireKeresek: 'invalid', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true, page: 1 })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'mireKeresek')).toBe(true);
        });

        it('HIBA - 400, ha a státusz érvénytelen', async () => {
            const res = await request(app)
                .get('/api/admin/users/sorted')
                .query({ mireKeresek: 'username', mit: 'a', status: 'invalid', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true, page: 1 })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'status')).toBe(true);
        });

        it('HIBA - 400, ha az oldalszám (page) érvénytelen', async () => {
            const res = await request(app)
                .get('/api/admin/users/sorted')
                .query({ mireKeresek: 'username', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true, page: -1 })
                .expect(400);
            expect(res.body.errors.some(e => e.msg === enTranslations.usersApi.validation_page_number_invalid)).toBe(true);
        });

        it('SIKER - 200, szűrt felhasználók lekérése', async () => {
            const mockUsers = { rows: [{ deleted_at: null, user_id: 1, username: 'User1', email: 'user1@example.com', role: 'user' }], total: 1 };
            db.sortedUsers.mockResolvedValue(mockUsers);
            const res = await request(app)
                .get('/api/admin/users/sorted')
                .query({ mireKeresek: 'username', mit: 'User', status: 'statusAny', adminChecked: 'true', modChecked: 'true', userChecked: 'true', lordChecked: 'true', page: 1 })
                .expect(200);
            expect(res.body.users).toHaveLength(1);
            expect(res.body.total).toBe(1);
        });

        it('SIKER - 200, nincs szűrt felhasználó', async () => {
            const mockUsers = { rows: [], total: 0 };
            db.sortedUsers.mockResolvedValue(mockUsers);
            const res = await request(app)
                .get('/api/admin/users/sorted')
                .query({ mireKeresek: 'username', mit: 'User', status: 'statusAny', adminChecked: 'true', modChecked: 'true', userChecked: 'true', lordChecked: 'true', page: 1 })
                .expect(200);
            expect(res.body.users).toHaveLength(0);
            expect(res.body.total).toBe(0);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.sortedUsers.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .get('/api/admin/users/sorted')
                .query({ mireKeresek: 'username', mit: 'User', status: 'statusAny', adminChecked: 'true', modChecked: 'true', userChecked: 'true', lordChecked: 'true', page: 1 })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.fetch_sorted_error);
        });
    });

    describe('GET /api/admin/users/:id', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/users/1'));

        it('HIBA - 400, ha érvénytelen query paraméter', async () => {
            const res = await request(app)
                .get('/api/admin/users/invalid')
                .expect(400);
            expect(res.body.errors[0].msg).toBe(enTranslations.usersApi.validation_user_id_invalid);
        });

        it('HIBA - 404, ha nincs ilyen felhasználó', async () => {
            db.getUser.mockResolvedValue([]);
            const res = await request(app)
                .get('/api/admin/users/1')
                .expect(404);
            expect(res.body.error).toBe(enTranslations.usersApi.not_found);
        });

        it('SIKER - 200, felhasználó lekérése', async () => {
            const mockUser = [{ user_id: 1, username: 'User1', email: 'user1@example.com', role: 'user' }];
            db.getUser.mockResolvedValue(mockUser);
            const res = await request(app)
                .get('/api/admin/users/1')
                .expect(200);
            expect(res.body.user).toEqual(mockUser[0]);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.getUser.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .get('/api/admin/users/1')
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.fetch_one_error);
        });
    });

    describe('POST /api/admin/users', () => {
        testRequiresAdminOrAuth(() => request(app).post('/api/admin/users'));

        it('HIBA - 400, ha a username érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .send({ username: '', email: 'valid@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'username')).toBe(true);
        });

        it('HIBA - 400, ha az email érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .send({ username: 'ValidUser', email: 'invalid', password: 'StrongPassword123', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'email')).toBe(true);
        });

        it('HIBA - 400, ha a jelszó érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .send({ username: 'ValidUser', email: 'valid@example.com', password: 'short', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'password')).toBe(true);
        });

        it('HIBA - 400, ha a szerepkör (role) érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .send({ username: 'ValidUser', email: 'valid@example.com', password: 'StrongPassword123', role: 'invalid' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'role')).toBe(true);
        });

        it('SIKER - 201, új felhasználó létrehozása', async () => {
            db.newUserFromAdmin.mockResolvedValue({ success: true, insertId: 100 });
            const res = await request(app)
                .post('/api/admin/users')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe(enTranslations.usersApi.signup_success);
            expect(sendWelcomeEmail).toHaveBeenCalledTimes(1);
            expect(sendWelcomeEmail).toHaveBeenCalledWith('newuser@example.com', 'NewUser');
        });

        it('HIBA - 403, ha ADMIN próbál ADMIN-t létrehozni', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .send({ username: 'NewAdmin', email: 'admin@example.com', password: 'StrongPassword123', role: 'ADMIN' })
                .expect(403);
            expect(res.body.error).toBe(enTranslations.usersApi.permission_denied);
            expect(sendWelcomeEmail).not.toHaveBeenCalled();
        });

        it('HIBA - 403, ha ADMIN próbál LORD-ot létrehozni', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .send({ username: 'NewLord', email: 'lord@example.com', password: 'StrongPassword123', role: 'LORD' })
                .expect(403);
            expect(res.body.error).toBe(enTranslations.usersApi.permission_denied);
        });

        it('SIKER - 201, ha LORD hoz létre ADMIN-t', async () => {
            db.newUserFromAdmin.mockResolvedValue({ success: true, insertId: 101 });
            const res = await request(app)
                .post('/api/admin/users')
                .set('simulaterole', 'LORD')
                .send({ username: 'NewAdmin', email: 'admin@example.com', password: 'StrongPassword123', role: 'ADMIN' })
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(sendWelcomeEmail).toHaveBeenCalledTimes(1);
        });

        it('HIBA - 409, foglalt felhasználónév vagy e-mail esetén', async () => {
            db.newUserFromAdmin.mockResolvedValue({ success: false, error: 'User exists' });
            const res = await request(app)
                .post('/api/admin/users')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(409);
            expect(res.body.error).toBe(enTranslations.usersApi.error_user_exists);
            expect(sendWelcomeEmail).not.toHaveBeenCalled();
        });

        it('HIBA - 500, sikertelen regisztráció', async () => {
            db.newUserFromAdmin.mockResolvedValue({ success: false });
            const res = await request(app)
                .post('/api/admin/users')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.signup_error);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.newUserFromAdmin.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .post('/api/admin/users')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.signup_error);
        });
    });

    describe('POST /api/admin/users/exports', () => {
        testRequiresAdminOrAuth(() => request(app).post('/api/admin/users/exports'));

        it('HIBA - 400, ha a keresési típus (mireKeresek) érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/users/exports')
                .send({ mireKeresek: 'invalid', mit: '', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'mireKeresek')).toBe(true);
        });

        it('HIBA - 400, ha a státusz érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/users/exports')
                .send({ mireKeresek: 'username', mit: '', status: 'invalid', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'status')).toBe(true);
        });

        it('HIBA - 400, ha a checkbox paraméter nem boolean', async () => {
            const res = await request(app)
                .post('/api/admin/users/exports')
                .send({ mireKeresek: 'username', mit: '', status: 'statusAny', adminChecked: 'notbool', modChecked: true, userChecked: true, lordChecked: true })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'adminChecked')).toBe(true);
        });

        it('SIKER - 200, felhasználók exportálása', async () => {
            const mockRows = [{ deleted_at: null, user_id: 1, username: 'User1', email: 'user1@example.com', role: 'user' }];
            db.sortedUsers.mockResolvedValue({ rows: mockRows, total: 1 });
            const res = await request(app)
                .post('/api/admin/users/exports')
                .send({ mireKeresek: 'username', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true })
                .expect(200);
            expect(res.header['content-type']).toContain('text/csv');
            expect(res.text).toContain('ID;Username;Email;Status;Role');
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.sortedUsers.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .post('/api/admin/users/exports')
                .send({ mireKeresek: 'username', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.export_error);
        });
    });

    describe('PUT /api/admin/users/:id', () => {
        testRequiresAdminOrAuth(() => request(app).put('/api/admin/users/1'));

        it('HIBA - 400, ha a user_id érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/users/-1')
                .send({ username: 'ValidUser', email: 'valid@example.com', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'id')).toBe(true);
        });

        it('HIBA - 400, ha a username érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/users/1')
                .send({ username: '', email: 'valid@example.com', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'username')).toBe(true);
        });

        it('HIBA - 400, ha az email érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/users/1')
                .send({ username: 'ValidUser', email: 'invalid', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'email')).toBe(true);
        });

        it('HIBA - 400, ha a szerepkör (role) érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/users/1')
                .send({ username: 'ValidUser', email: 'valid@example.com', role: 'invalid' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'role')).toBe(true);
        });

        it('SIKER - 200, felhasználó adatainak frissítése', async () => {
            db.getUser.mockResolvedValue([{ role: 'user' }]);
            db.updateUserByAdmin.mockResolvedValue(1);
            await request(app)
                .put('/api/admin/users/1')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com', role: 'user' })
                .expect(200);
            expect(sendChangeEmail).toHaveBeenCalledTimes(1);
            expect(sendChangeEmail).toHaveBeenCalledWith('updateduser@example.com', 'UpdatedUser');
        });

        it('HIBA - 403, ha ADMIN próbál ADMIN rangot adni valakinek', async () => {
            db.getUser.mockResolvedValue([{ role: 'user' }]);
            const res = await request(app)
                .put('/api/admin/users/2')
                .send({ username: 'UpdatedUser', email: 'updated@example.com', role: 'ADMIN' })
                .expect(403);
            expect(res.body.error).toBe(enTranslations.usersApi.permission_denied);
            expect(sendChangeEmail).not.toHaveBeenCalled();
        });

        it('SIKER - 200, ha LORD módosít valakit ADMIN-ná', async () => {
            db.getUser.mockResolvedValue([{ role: 'user' }]);
            db.updateUserByAdmin.mockResolvedValue(1);
            const res = await request(app)
                .put('/api/admin/users/2')
                .set('simulaterole', 'LORD')
                .send({ username: 'UpdatedUser', email: 'updated@example.com', role: 'ADMIN' })
                .expect(200);
            expect(res.body.message).toBe(enTranslations.usersApi.update_success);
            expect(sendChangeEmail).toHaveBeenCalledTimes(1);
        });

        it('HIBA - 409, foglalt felhasználónév vagy e-mail esetén', async () => {
            db.getUser.mockResolvedValue([{ role: 'user' }]);
            db.updateUserByAdmin.mockResolvedValue('User exists');
            const res = await request(app)
                .put('/api/admin/users/1')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com', role: 'user' })
                .expect(409);
            expect(res.body.error).toBe(enTranslations.usersApi.error_user_exists);
            expect(sendChangeEmail).not.toHaveBeenCalled();
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.getUser.mockResolvedValue([{ role: 'user' }]);
            db.updateUserByAdmin.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .put('/api/admin/users/1')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com', role: 'user' })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.update_error);
        });
    });

    describe('PUT /api/admin/users/self', () => {
        testRequiresAdminOrAuth(() => request(app).put('/api/admin/users/self'));

        it('HIBA - 400, ha a username érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/users/self')
                .send({ username: '', email: 'valid@example.com' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'username')).toBe(true);
        });

        it('HIBA - 400, ha az email érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/users/self')
                .send({ username: 'ValidUser', email: 'invalid' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'email')).toBe(true);
        });

        it('SIKER - 200, saját adatainak frissítése', async () => {
            db.getUser.mockResolvedValue([{ email: 'old@example.com', username: 'OldUser' }]);
            db.updateUserByAdmin.mockResolvedValue(1);
            await request(app)
                .put('/api/admin/users/self')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com' })
                .expect(200);
            expect(sendChangeEmail).toHaveBeenCalledTimes(1);
            expect(sendChangeEmail).toHaveBeenCalledWith('updateduser@example.com', 'UpdatedUser');
        });

        it('HIBA - 409, foglalt felhasználónév vagy e-mail esetén', async () => {
            db.getUser.mockResolvedValue([{ email: 'old@example.com', username: 'OldUser' }]);
            db.updateUserByAdmin.mockResolvedValue('User exists');
            const res = await request(app)
                .put('/api/admin/users/self')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com' })
                .expect(409);
            expect(res.body.error).toBe(enTranslations.usersApi.error_user_exists);
            expect(sendChangeEmail).not.toHaveBeenCalled();
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.getUser.mockResolvedValue([{ email: 'old@example.com', username: 'OldUser' }]);
            db.updateUserByAdmin.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .put('/api/admin/users/self')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com' })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.update_error);
        });
    });

    describe('PUT /api/admin/users/:id/profile-picture', () => {
        testRequiresAdminOrAuth(() => request(app).put('/api/admin/users/123/profile-picture'));

        it('HIBA 400 - érvénytelen user_id', async () => {
            const res = await request(app)
                .put('/api/admin/users/-1/profile-picture')
                .attach('profilePic', Buffer.from('fake-image'), 'test.jpg')
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'id')).toBe(true);
        });

        it('HIBA 400 - nem képfájl lett feltöltve (pl. PDF)', async () => {
            const res = await request(app)
                .put('/api/admin/users/123/profile-picture')
                .attach('profilePic', Buffer.from('fake-pdf-content'), 'teszt.pdf')
                .expect(400);
            expect(res.body.error).toBe('Érvénytelen fájltípus! Csak képeket tölthetsz fel.');
        });

        it('HIBA 400 - nincs kép feltöltve', async () => {
            const res = await request(app)
                .put('/api/admin/users/123/profile-picture')
                .set('simulate-no-file', 'true')
                .expect(400);
            expect(res.body.error).toBe(enTranslations.usersApi.no_image_provided);
        });

        it('SIKER 201 - sikeresen frissíti a profilképet', async () => {
            const sharpMock = {
                rotate: jest.fn().mockReturnThis(),
                resize: jest.fn().mockReturnThis(),
                toFormat: jest.fn().mockReturnThis(),
                toFile: jest.fn().mockResolvedValue({ width: 400, height: 400 })
            };
            sharp.mockReturnValue(sharpMock);
            db.uploadProfilePic.mockResolvedValue('old.webp');

            const res = await request(app)
                .put('/api/admin/users/123/profile-picture')
                .attach('profilePic', Buffer.from('fake-image'), 'test.jpg')
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(db.uploadProfilePic).toHaveBeenCalled();
            expect(fs.unlink).toHaveBeenCalled();
        });

        it('HIBA 500 - Sharp feldolgozási hiba, törli a feltöltött fájlt', async () => {
            sharp.mockImplementationOnce(() => {
                throw new Error('Sharp processing failed');
            });

            const res = await request(app)
                .put('/api/admin/users/123/profile-picture')
                .attach('profilePic', Buffer.from('fake-image'), 'test.jpg')
                .expect(500);

            expect(fs.unlink).toHaveBeenCalled();
            expect(res.body.error).toBe(enTranslations.usersApi.profile_pic_update_error);
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        testRequiresAdminOrAuth(() => request(app).delete('/api/admin/users/1'));

        it('HIBA - 400, ha a szerepkör (role) érvénytelen', async () => {
            const res = await request(app)
                .delete('/api/admin/users/1')
                .send({ role: 'invalid_role', deleted: false })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'role')).toBe(true);
        });

        it('HIBA - 400, ha a deleted paraméter nem boolean', async () => {
            const res = await request(app)
                .delete('/api/admin/users/1')
                .send({ role: 'user', deleted: 'nem_boolean' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'deleted')).toBe(true);
        });

        it('HIBA - 403, ha ADMIN próbál törölni egy ADMIN-t', async () => {
            db.getUser.mockResolvedValue([{ role: 'ADMIN' }]);
            const res = await request(app)
                .delete('/api/admin/users/2')
                .send({ role: 'ADMIN', deleted: false })
                .expect(403);
            expect(res.body.error).toBe(enTranslations.usersApi.permission_denied);
            expect(sendDeleteEmail).not.toHaveBeenCalled();
        });

        it('HIBA - 403, ha ADMIN próbál törölni egy LORD-ot', async () => {
            db.getUser.mockResolvedValue([{ role: 'LORD' }]);
            const res = await request(app)
                .delete('/api/admin/users/3')
                .send({ role: 'LORD', deleted: false })
                .expect(403);
            expect(res.body.error).toBe(enTranslations.usersApi.permission_denied);
        });

        it('SIKER - 200, ha LORD töröl egy ADMIN-t', async () => {
            db.getUser.mockResolvedValue([{ role: 'ADMIN' }]);
            db.userToInactive.mockResolvedValue({ affectedRows: 1, email: 'admin@example.com', username: 'AdminUser', filepath: null });
            const res = await request(app)
                .delete('/api/admin/users/2')
                .set('simulaterole', 'LORD')
                .send({ role: 'ADMIN', deleted: false })
                .expect(200);
            expect(res.body.message).toBe(enTranslations.usersApi.update_success);
            expect(sendDeleteEmail).toHaveBeenCalledTimes(1);
        });

        it('SIKER - 200, felhasználó inaktívvá tétele', async () => {
            db.getUser.mockResolvedValue([{ role: 'user' }]);
            db.userToInactive.mockResolvedValue({ affectedRows: 1, email: 'torolt@example.com', username: 'ToroltUser', filepath: 'testpic.webp' });
            await request(app)
                .delete('/api/admin/users/1')
                .send({ role: 'user', deleted: false })
                .expect(200);
            expect(sendDeleteEmail).toHaveBeenCalledTimes(1);
            expect(sendDeleteEmail).toHaveBeenCalledWith('torolt@example.com', 'ToroltUser');
            expect(fs.unlink).toHaveBeenCalled();
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.getUser.mockResolvedValue([{ role: 'user' }]);
            db.userToInactive.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .delete('/api/admin/users/1')
                .send({ role: 'user', deleted: false })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.deactivate_error);
        });
    });

    describe('DELETE /api/admin/users/:id/profile-picture', () => {
        testRequiresAdminOrAuth(() => request(app).delete('/api/admin/users/123/profile-picture'));

        it('HIBA 400 - érvénytelen user_id', async () => {
            const res = await request(app)
                .delete('/api/admin/users/-1/profile-picture')
                .send({})
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'id')).toBe(true);
        });

        it('SIKER 200 - sikeresen törli a profilképet', async () => {
            db.deleteProfilePic.mockResolvedValue('old-pic.webp');
            const res = await request(app)
                .delete('/api/admin/users/123/profile-picture')
                .send({})
                .expect(200);
            expect(res.body.success).toBe(true);
            expect(fs.unlink).toHaveBeenCalled();
        });

        it('SIKER 200 - nincs törlendő profilkép', async () => {
            db.deleteProfilePic.mockResolvedValue(null);
            const res = await request(app)
                .delete('/api/admin/users/123/profile-picture')
                .send({})
                .expect(200);
            expect(res.body.message).toEqual(enTranslations.usersApi.profile_pic_already_default);
        });

        it('HIBA 500 - adatbázis hiba', async () => {
            db.deleteProfilePic.mockRejectedValue(new Error('DB Error'));
            const res = await request(app)
                .delete('/api/admin/users/123/profile-picture')
                .send({})
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.profile_pic_delete_error);
        });
    });
});
