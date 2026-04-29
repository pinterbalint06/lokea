require('./helpers/mocks.js');

const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const db = require('../../sql/admin/databaseUsers.js');
const dbLogs = require('../../sql/admin/databaseLogs.js');
const auth = require('../../utils/auth.js');
const multer = require('multer');
const sharp = require('sharp');
const enTranslations = require('../../locales/en/admin.json');
const huTranslations = require('../../locales/hu/admin.json');
const { mockI18nMiddleware, testRequiresAdminOrAuth } = require('./helpers/helpers.js');

const { sendWelcomeEmail, sendChangeEmail, sendDeleteEmail } = require('../../utils/mails.js');

const app = express();
app.use(express.json());

app.use(mockI18nMiddleware);

app.use('/api/admin', auth.checkAuth, auth.checkRole("ADMIN"), require('../../api/admin/index.js'));

describe('Admin Users API-tesztek', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fs.unlink.mockResolvedValue(undefined);
    });

    describe('GET /api/admin/getUsers', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/getUsers'));

        it('SIKER - 200, felhasználók lekérése', async () => {
            const mockUsers = { rows: [{ deleted_at: null, user_id: 1, username: 'User1', email: 'user1@example.com', role: 'user' }], total: 1 };
            db.getUsers.mockResolvedValue(mockUsers);
            const res = await request(app).get('/api/admin/getUsers').expect(200);
            expect(res.body.users).toHaveLength(1);
            expect(res.body.total).toBe(1);
        });

        it('SIKER - 200, nincs felhasználó', async () => {
            const mockUsers = { rows: [], total: 0 };
            db.getUsers.mockResolvedValue(mockUsers);
            const res = await request(app).get('/api/admin/getUsers').expect(200);
            expect(res.body.users).toHaveLength(0);
            expect(res.body.total).toBe(0);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.getUsers.mockRejectedValue(new Error('Database error'));
            const res = await request(app).get('/api/admin/getUsers').expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.fetch_all_error);
        });
    });

    describe('GET /api/admin/sortedUsers', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/sortedUsers'));

        it('HIBA - 400, ha a keresési típus (mireKeresek) érvénytelen', async () => {
            const res = await request(app)
                .get('/api/admin/sortedUsers')
                .query({ mireKeresek: 'invalid', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true, page: 1 })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'mireKeresek')).toBe(true);
        });

        it('HIBA - 400, ha a státusz érvénytelen', async () => {
            const res = await request(app)
                .get('/api/admin/sortedUsers')
                .query({ mireKeresek: 'username', mit: 'a', status: 'invalid', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true, page: 1 })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'status')).toBe(true);
        });

        it('HIBA - 400, ha az oldalszám (page) érvénytelen', async () => {
            const res = await request(app)
                .get('/api/admin/sortedUsers')
                .query({ mireKeresek: 'username', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true, page: -1 })
                .expect(400);
            expect(res.body.errors.some(e => e.msg === enTranslations.usersApi.validation_page_number_invalid)).toBe(true);
        });

        it('SIKER - 200, szűrt felhasználók lekérése', async () => {
            const mockUsers = { rows: [{ deleted_at: null, user_id: 1, username: 'User1', email: 'user1@example.com', role: 'user' }], total: 1 };
            db.sortedUsers.mockResolvedValue(mockUsers);
            const res = await request(app)
                .get('/api/admin/sortedUsers')
                .query({ mireKeresek: 'username', mit: 'User', status: 'statusAny', adminChecked: 'true', modChecked: 'true', userChecked: 'true', lordChecked: 'true', page: 1 })
                .expect(200);
            expect(res.body.users).toHaveLength(1);
            expect(res.body.total).toBe(1);
        });

        it('SIKER - 200, nincs szűrt felhasználó', async () => {
            const mockUsers = { rows: [], total: 0 };
            db.sortedUsers.mockResolvedValue(mockUsers);
            const res = await request(app)
                .get('/api/admin/sortedUsers')
                .query({ mireKeresek: 'username', mit: 'User', status: 'statusAny', adminChecked: 'true', modChecked: 'true', userChecked: 'true', lordChecked: 'true', page: 1 })
                .expect(200);
            expect(res.body.users).toHaveLength(0);
            expect(res.body.total).toBe(0);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.sortedUsers.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .get('/api/admin/sortedUsers')
                .query({ mireKeresek: 'username', mit: 'User', status: 'statusAny', adminChecked: 'true', modChecked: 'true', userChecked: 'true', lordChecked: 'true', page: 1 })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.fetch_sorted_error);
        });
    });

    describe('GET /api/admin/getUser', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/admin/getUser'));

        it('HIBA - 400, ha érvénytelen query paraméter', async () => {
            const res = await request(app)
                .get('/api/admin/getUser')
                .query({ id: 'invalid' })
                .expect(400);
            expect(res.body.errors[0].msg).toBe(enTranslations.usersApi.validation_user_id_invalid);
        });

        it('HIBA - 404, ha nincs ilyen felhasználó', async () => {
            db.getUser.mockResolvedValue([]);
            const res = await request(app)
                .get('/api/admin/getUser')
                .query({ id: 1 })
                .expect(404);
            expect(res.body.error).toBe(enTranslations.usersApi.not_found);
        });

        it('SIKER - 200, felhasználó lekérése', async () => {
            const mockUser = [{ user_id: 1, username: 'User1', email: 'user1@example.com', role: 'user' }];
            db.getUser.mockResolvedValue(mockUser);
            const res = await request(app)
                .get('/api/admin/getUser')
                .query({ id: 1 })
                .expect(200);
            expect(res.body.users).toEqual(mockUser);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.getUser.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .get('/api/admin/getUser')
                .query({ id: 1 })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.fetch_one_error);
        });
    });

    describe('POST /api/admin/signupFromAdmin', () => {
        testRequiresAdminOrAuth(() => request(app).post('/api/admin/signupFromAdmin'));

        it('HIBA - 400, ha a username érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: '', email: 'valid@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'username')).toBe(true);
        });

        it('HIBA - 400, ha az email érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'ValidUser', email: 'invalid', password: 'StrongPassword123', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'email')).toBe(true);
        });

        it('HIBA - 400, ha a jelszó érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'ValidUser', email: 'valid@example.com', password: 'short', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'password')).toBe(true);
        });

        it('HIBA - 400, ha a szerepkör (role) érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'ValidUser', email: 'valid@example.com', password: 'StrongPassword123', role: 'invalid' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'role')).toBe(true);
        });

        it('SIKER - 201, új felhasználó létrehozása', async () => {
            db.newUserFromAdmin.mockResolvedValue({ success: true, insertId: 100 });
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe(enTranslations.usersApi.signup_success);
            expect(sendWelcomeEmail).toHaveBeenCalledTimes(1);
            expect(sendWelcomeEmail).toHaveBeenCalledWith('newuser@example.com', 'NewUser');
        });

        it('HIBA - 403, ha ADMIN próbál ADMIN-t létrehozni', async () => {
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'NewAdmin', email: 'admin@example.com', password: 'StrongPassword123', role: 'ADMIN' })
                .expect(403);
            expect(res.body.error).toBe(enTranslations.usersApi.permission_denied);
            expect(sendWelcomeEmail).not.toHaveBeenCalled();
        });

        it('HIBA - 403, ha ADMIN próbál LORD-ot létrehozni', async () => {
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'NewLord', email: 'lord@example.com', password: 'StrongPassword123', role: 'LORD' })
                .expect(403);
            expect(res.body.error).toBe(enTranslations.usersApi.permission_denied);
        });

        it('SIKER - 201, ha LORD hoz létre ADMIN-t', async () => {
            db.newUserFromAdmin.mockResolvedValue({ success: true, insertId: 101 });
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .set('simulaterole', 'LORD')
                .send({ username: 'NewAdmin', email: 'admin@example.com', password: 'StrongPassword123', role: 'ADMIN' })
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(sendWelcomeEmail).toHaveBeenCalledTimes(1);
        });

        it('HIBA - 409, foglalt felhasználónév vagy e-mail esetén', async () => {
            db.newUserFromAdmin.mockResolvedValue({ success: false, error: 'User exists' });
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(409);
            expect(res.body.error).toBe("A felhasználónév vagy e-mail cím már foglalt!");
            expect(sendWelcomeEmail).not.toHaveBeenCalled();
        });

        it('HIBA - 500, sikertelen regisztráció', async () => {
            db.newUserFromAdmin.mockResolvedValue({ success: false });
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.signup_error);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.newUserFromAdmin.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.signup_error);
        });
    });

    describe('POST /api/admin/exportUsers', () => {
        testRequiresAdminOrAuth(() => request(app).post('/api/admin/exportUsers'));

        it('HIBA - 400, ha a keresési típus (mireKeresek) érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/exportUsers')
                .send({ mireKeresek: 'invalid', mit: '', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'mireKeresek')).toBe(true);
        });

        it('HIBA - 400, ha a státusz érvénytelen', async () => {
            const res = await request(app)
                .post('/api/admin/exportUsers')
                .send({ mireKeresek: 'username', mit: '', status: 'invalid', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'status')).toBe(true);
        });

        it('HIBA - 400, ha a checkbox paraméter nem boolean', async () => {
            const res = await request(app)
                .post('/api/admin/exportUsers')
                .send({ mireKeresek: 'username', mit: '', status: 'statusAny', adminChecked: 'notbool', modChecked: true, userChecked: true, lordChecked: true })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'adminChecked')).toBe(true);
        });

        it('SIKER - 200, felhasználók exportálása', async () => {
            const mockRows = [{ deleted_at: null, user_id: 1, username: 'User1', email: 'user1@example.com', role: 'USER' }];
            db.sortedUsers.mockResolvedValue({ rows: mockRows, total: 1 });
            const res = await request(app)
                .post('/api/admin/exportUsers')
                .send({ mireKeresek: 'username', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true })
                .expect(200);
            expect(res.header['content-type']).toContain('text/csv');
            expect(res.text).toContain('ID;Username;Email;Status;Role');
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.sortedUsers.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .post('/api/admin/exportUsers')
                .send({ mireKeresek: 'username', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, lordChecked: true })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.export_error);
        });
    });

    describe('PUT /api/admin/updateUserFromAdmin', () => {
        testRequiresAdminOrAuth(() => request(app).put('/api/admin/updateUserFromAdmin'));

        it('HIBA - 400, ha a user_id érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: -1, username: 'ValidUser', email: 'valid@example.com', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'user_id')).toBe(true);
        });

        it('HIBA - 400, ha a username érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: 1, username: '', email: 'valid@example.com', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'username')).toBe(true);
        });

        it('HIBA - 400, ha az email érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: 1, username: 'ValidUser', email: 'invalid', role: 'user' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'email')).toBe(true);
        });

        it('HIBA - 400, ha a szerepkör (role) érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: 1, username: 'ValidUser', email: 'valid@example.com', role: 'invalid' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'role')).toBe(true);
        });

        it('SIKER - 200, felhasználó adatainak frissítése', async () => {
            db.updateUserByAdmin.mockResolvedValue(1);
            await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: 1, username: 'UpdatedUser', email: 'updateduser@example.com', role: 'user' })
                .expect(200);
            expect(sendChangeEmail).toHaveBeenCalledTimes(1);
            expect(sendChangeEmail).toHaveBeenCalledWith('updateduser@example.com', 'UpdatedUser');
        });

        it('HIBA - 403, ha ADMIN próbál ADMIN rangot adni valakinek', async () => {
            const res = await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: 2, username: 'UpdatedUser', email: 'updated@example.com', role: 'ADMIN' })
                .expect(403);
            expect(res.body.error).toBe(enTranslations.usersApi.permission_denied);
            expect(sendChangeEmail).not.toHaveBeenCalled();
        });

        it('SIKER - 200, ha LORD módosít valakit ADMIN-ná', async () => {
            db.updateUserByAdmin.mockResolvedValue(1);
            const res = await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .set('simulaterole', 'LORD')
                .send({ user_id: 2, username: 'UpdatedUser', email: 'updated@example.com', role: 'ADMIN' })
                .expect(200);
            expect(res.body.message).toBe(enTranslations.usersApi.update_success);
            expect(sendChangeEmail).toHaveBeenCalledTimes(1);
        });

        it('HIBA - 409, foglalt felhasználónév vagy e-mail esetén', async () => {
            db.updateUserByAdmin.mockResolvedValue('User exists');
            const res = await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: 1, username: 'UpdatedUser', email: 'updateduser@example.com', role: 'user' })
                .expect(409);
            expect(res.body.error).toBe("A felhasználónév vagy e-mail cím már foglalt!");
            expect(sendChangeEmail).not.toHaveBeenCalled();
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.updateUserByAdmin.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: 1, username: 'UpdatedUser', email: 'updateduser@example.com', role: 'user' })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.update_error);
        });
    });

    describe('PUT /api/admin/userSelfUpdate', () => {
        testRequiresAdminOrAuth(() => request(app).put('/api/admin/userSelfUpdate'));

        it('HIBA - 400, ha a username érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/userSelfUpdate')
                .send({ username: '', email: 'valid@example.com' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'username')).toBe(true);
        });

        it('HIBA - 400, ha az email érvénytelen', async () => {
            const res = await request(app)
                .put('/api/admin/userSelfUpdate')
                .send({ username: 'ValidUser', email: 'invalid' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'email')).toBe(true);
        });

        it('SIKER - 200, saját adatainak frissítése', async () => {
            db.updateUserByAdmin.mockResolvedValue(1);
            await request(app)
                .put('/api/admin/userSelfUpdate')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com' })
                .expect(200);
            expect(sendChangeEmail).toHaveBeenCalledTimes(1);
            expect(sendChangeEmail).toHaveBeenCalledWith('updateduser@example.com', 'UpdatedUser');
        });

        it('HIBA - 409, foglalt felhasználónév vagy e-mail esetén', async () => {
            db.updateUserByAdmin.mockResolvedValue('User exists');
            const res = await request(app)
                .put('/api/admin/userSelfUpdate')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com' })
                .expect(409);
            expect(res.body.error).toBe("A felhasználónév vagy e-mail cím már foglalt!");
            expect(sendChangeEmail).not.toHaveBeenCalled();
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.updateUserByAdmin.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .put('/api/admin/userSelfUpdate')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com' })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.update_error);
        });
    });

    describe('PUT /api/admin/updateProfilePicFromAdmin', () => {
        testRequiresAdminOrAuth(() => request(app).put('/api/admin/updateProfilePicFromAdmin'));

        it('HIBA 400 - érvénytelen user_id', async () => {
            const res = await request(app)
                .put('/api/admin/updateProfilePicFromAdmin')
                .field('user_id', -1)
                .attach('profilePic', Buffer.from('fake-image'), 'test.jpg')
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'user_id')).toBe(true);
        });

        it('HIBA 400 - nem képfájl lett feltöltve (pl. PDF)', async () => {
            const res = await request(app)
                .put('/api/admin/updateProfilePicFromAdmin')
                .field('user_id', 123)
                .attach('profilePic', Buffer.from('fake-pdf-content'), 'teszt.pdf')
                .expect(400);
        });

        it('HIBA 400 - nincs kép feltöltve', async () => {
            const res = await request(app)
                .put('/api/admin/updateProfilePicFromAdmin')
                .set('simulate-no-file', 'true')
                .field('user_id', 123)
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
                .put('/api/admin/updateProfilePicFromAdmin')
                .attach('profilePic', Buffer.from('fake-image'), 'test.jpg')
                .field('user_id', 123)
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
                .put('/api/admin/updateProfilePicFromAdmin')
                .attach('profilePic', Buffer.from('fake-image'), 'test.jpg')
                .field('user_id', 123)
                .expect(500);

            expect(fs.unlink).toHaveBeenCalled();
            expect(res.body.error).toBe(enTranslations.usersApi.profile_pic_update_error);
        });
    });

    describe('DELETE /api/admin/userToInactive', () => {
        testRequiresAdminOrAuth(() => request(app).delete('/api/admin/userToInactive'));

        it('HIBA - 400, ha a szerepkör (role) érvénytelen', async () => {
            const res = await request(app)
                .delete('/api/admin/userToInactive')
                .send({ userId: 1, role: 'invalid_role', deleted: false })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'role')).toBe(true);
        });

        it('HIBA - 400, ha a deleted paraméter nem boolean', async () => {
            const res = await request(app)
                .delete('/api/admin/userToInactive')
                .send({ userId: 1, role: 'user', deleted: 'nem_boolean' })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'deleted')).toBe(true);
        });

        it('HIBA - 403, ha ADMIN próbál törölni egy ADMIN-t', async () => {
            const res = await request(app)
                .delete('/api/admin/userToInactive')
                .send({ userId: 2, role: 'ADMIN', deleted: false })
                .expect(403);
            expect(res.body.error).toBe(enTranslations.usersApi.permission_denied);
            expect(sendDeleteEmail).not.toHaveBeenCalled();
        });

        it('HIBA - 403, ha ADMIN próbál törölni egy LORD-ot', async () => {
            const res = await request(app)
                .delete('/api/admin/userToInactive')
                .send({ userId: 3, role: 'LORD', deleted: false })
                .expect(403);
            expect(res.body.error).toBe(enTranslations.usersApi.permission_denied);
        });

        it('SIKER - 200, ha LORD töröl egy ADMIN-t', async () => {
            db.userToInactive.mockResolvedValue({ affectedRows: 1, email: 'admin@example.com', username: 'AdminUser' });
            const res = await request(app)
                .delete('/api/admin/userToInactive')
                .set('simulaterole', 'LORD')
                .send({ userId: 2, role: 'ADMIN', deleted: false })
                .expect(200);
            expect(res.body.message).toBe(enTranslations.usersApi.update_success);
            expect(sendDeleteEmail).toHaveBeenCalledTimes(1);
        });

        it('SIKER - 200, felhasználó inaktívvá tétele', async () => {
            db.userToInactive.mockResolvedValue({ affectedRows: 1, email: 'torolt@example.com', username: 'ToroltUser' });
            await request(app)
                .delete('/api/admin/userToInactive')
                .send({ userId: 1, role: 'user', deleted: false })
                .expect(200);
            expect(sendDeleteEmail).toHaveBeenCalledTimes(1);
            expect(sendDeleteEmail).toHaveBeenCalledWith('torolt@example.com', 'ToroltUser');
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.userToInactive.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .delete('/api/admin/userToInactive')
                .send({ userId: 1, role: 'user', deleted: false })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.deactivate_error);
        });
    });

    describe('DELETE /api/admin/deleteProfilePicFromAdmin', () => {
        testRequiresAdminOrAuth(() => request(app).delete('/api/admin/deleteProfilePicFromAdmin'));

        it('HIBA 400 - érvénytelen user_id', async () => {
            const res = await request(app)
                .delete('/api/admin/deleteProfilePicFromAdmin')
                .send({ user_id: -1 })
                .expect(400);
            expect(res.body.errors.some(e => e.path === 'user_id')).toBe(true);
        });

        it('SIKER 201 - sikeresen törli a profilképet', async () => {
            db.deleteProfilePic.mockResolvedValue('old-pic.webp');
            const res = await request(app)
                .delete('/api/admin/deleteProfilePicFromAdmin')
                .send({ user_id: 123 })
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(fs.unlink).toHaveBeenCalled();
        });

        it('SIKER 200 - nincs törlendő profilkép', async () => {
            db.deleteProfilePic.mockResolvedValue(null);
            const res = await request(app)
                .delete('/api/admin/deleteProfilePicFromAdmin')
                .send({ user_id: 123 })
                .expect(200);
            expect(res.body.message).toEqual(enTranslations.usersApi.profile_pic_already_default);
        });

        it('HIBA 500 - adatbázis hiba', async () => {
            db.deleteProfilePic.mockRejectedValue(new Error('DB Error'));
            const res = await request(app)
                .delete('/api/admin/deleteProfilePicFromAdmin')
                .send({ user_id: 123 })
                .expect(500);
            expect(res.body.error).toBe(enTranslations.usersApi.profile_pic_delete_error);
        });
    });
});