const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const db = require('../../sql/admin/databaseUsers.js');
const dbLogs = require('../../sql/admin/databaseLogs.js');
const auth = require('../../utils/auth.js');
const multer = require('multer');
const sharp = require('sharp');

jest.mock('multer', () => {
    const multerMock = jest.fn(() => ({
        single: jest.fn(() => (req, res, next) => {
            if (!req.body) req.body = {};
            req.body.user_id = req.body.user_id || 123;

            if (req.headers['simulate-no-file']) {
                req.file = undefined;
            } else {
                req.file = { path: 'test-temp.jpg', originalname: 'test.jpg' };
            }
            next();
        })
    }));
    multerMock.diskStorage = jest.fn().mockReturnValue({});
    return multerMock;
});

jest.mock('sharp', () => {
    const sharpMock = jest.fn(() => ({
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({ width: 400, height: 400 })
    }));
    sharpMock.cache = jest.fn();
    return sharpMock;
});
jest.mock('../../sql/admin/databaseUsers.js');
jest.mock('../../sql/admin/databaseLogs.js');
jest.mock('fs/promises');

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
    if (!req.session) req.session = {};
    next();
});

app.use('/api/admin', auth.checkAuth, auth.checkRole("ADMIN"), require('../../api/admin/index.js'));

describe('Admin Users API-tesztek', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fs.unlink.mockResolvedValue(undefined);
    });

    describe('GET /api/admin/getUsers', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .get('/api/admin/getUsers')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .get('/api/admin/getUsers')
                .set('notadmin', 'true')
                .expect(404);
        });

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
            expect(res.body.error).toBe("Hiba történt a felhasználók lekérése során!");
        });
    });

    describe('GET /api/admin/sortedUsers', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .get('/api/admin/sortedUsers')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .get('/api/admin/sortedUsers')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('HIBA - 400, ha érvénytelen query paraméter', async () => {
            const res = await request(app)
                .get('/api/admin/sortedUsers')
                .query({ mireKeresek: 'invalid', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true, page: -1 })
                .expect(400);
            expect(res.body.errors.some(e => e.msg === "Az oldalszám nem megfelelő!")).toBe(true);
        });

        it('SIKER - 200, szűrt felhasználók lekérése', async () => {
            const mockUsers = { rows: [{ deleted_at: null, user_id: 1, username: 'User1', email: 'user1@example.com', role: 'user' }], total: 1 };
            db.sortedUsers.mockResolvedValue(mockUsers);
            const res = await request(app)
                .get('/api/admin/sortedUsers')
                .query({ mireKeresek: 'username', mit: 'User', status: 'statusAny', adminChecked: 'true', modChecked: 'true', userChecked: 'true', page: 1 })
                .expect(200);
            expect(res.body.users).toHaveLength(1);
            expect(res.body.total).toBe(1);
        });

        it('SIKER - 200, nincs szűrt felhasználó', async () => {
            const mockUsers = { rows: [], total: 0 };
            db.sortedUsers.mockResolvedValue(mockUsers);
            const res = await request(app)
                .get('/api/admin/sortedUsers')
                .query({ mireKeresek: 'username', mit: 'User', status: 'statusAny', adminChecked: 'true', modChecked: 'true', userChecked: 'true', page: 1 })
                .expect(200);
            expect(res.body.users).toHaveLength(0);
            expect(res.body.total).toBe(0);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.sortedUsers.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .get('/api/admin/sortedUsers')
                .query({ mireKeresek: 'username', mit: 'User', status: 'statusAny', adminChecked: 'true', modChecked: 'true', userChecked: 'true', page: 1 })
                .expect(500);
            expect(res.body.error).toBe("Hiba történt a szűrt felhasználók lekérése során!");
        });
    });

    describe('GET /api/admin/getUser', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .get('/api/admin/getUser')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .get('/api/admin/getUser')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('HIBA - 400, ha érvénytelen query paraméter', async () => {
            const res = await request(app)
                .get('/api/admin/getUser')
                .query({ id: 'invalid' })
                .expect(400);
            expect(res.body.errors[0].msg).toBe("A user ID nem megfelelő!");
        });

        it('HIBA - 404, ha nincs ilyen felhasználó', async () => {
            db.getUser.mockResolvedValue([]);
            await request(app)
                .get('/api/admin/getUser')
                .query({ id: 1 })
                .expect(404);
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
            expect(res.body.error).toBe("Hiba történt a felhasználó lekérése során!");
        });
    });

    describe('POST /api/admin/signupFromAdmin', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .post('/api/admin/signupFromAdmin')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .post('/api/admin/signupFromAdmin')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('HIBA - 400, ha érvénytelen body paraméter', async () => {
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: '', email: 'invalid', password: 'short', role: 'invalid' })
                .expect(400);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it('SIKER - 201, új felhasználó létrehozása', async () => {
            db.newUserFromAdmin.mockResolvedValue({ success: true, insertId: 100 });
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Sikeres regisztráció!");
        });

        it('HIBA - 500, sikertelen regisztráció', async () => {
            db.newUserFromAdmin.mockResolvedValue({ success: false });
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(500);
            expect(res.body.error).toBe("Hiba a regisztráció során!");
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.newUserFromAdmin.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .post('/api/admin/signupFromAdmin')
                .send({ username: 'NewUser', email: 'newuser@example.com', password: 'StrongPassword123', role: 'user' })
                .expect(500);
            expect(res.body.error).toBe("Hiba a regisztráció során!");
        });
    });

    describe('POST /api/admin/exportUsers', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .post('/api/admin/exportUsers')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .post('/api/admin/exportUsers')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('HIBA - 400, ha érvénytelen body paraméter', async () => {
            const res = await request(app)
                .post('/api/admin/exportUsers')
                .send({ mireKeresek: 'invalid', mit: '', status: 'invalid', adminChecked: 'notbool', modChecked: 'notbool', userChecked: 'notbool' })
                .expect(400);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it('SIKER - 200, felhasználók exportálása', async () => {
            const mockRows = [{ deleted_at: null, user_id: 1, username: 'User1', email: 'user1@example.com', role: 'USER' }];
            db.sortedUsers.mockResolvedValue({ rows: mockRows, total: 1 });
            const res = await request(app)
                .post('/api/admin/exportUsers')
                .send({ mireKeresek: 'username', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true })
                .expect(200);
            expect(res.header['content-type']).toContain('text/csv');
            expect(res.text).toContain('ID;Username;Email;Status;Role');
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.sortedUsers.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .post('/api/admin/exportUsers')
                .send({ mireKeresek: 'username', mit: 'a', status: 'statusAny', adminChecked: true, modChecked: true, userChecked: true })
                .expect(500);
            expect(res.body.error).toBe('Hiba az exportálás során!');
        });
    });

    describe('PUT /api/admin/updateUserFromAdmin', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('HIBA - 400, ha érvénytelen body paraméter', async () => {
            const res = await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: -1, username: '', email: 'invalid', role: 'invalid' })
                .expect(400);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it('SIKER - 204, felhasználó adatainak frissítése', async () => {
            db.updateUserByAdmin.mockResolvedValue(1);
            await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: 1, username: 'UpdatedUser', email: 'updateduser@example.com', role: 'user' })
                .expect(204);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.updateUserByAdmin.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .put('/api/admin/updateUserFromAdmin')
                .send({ user_id: 1, username: 'UpdatedUser', email: 'updateduser@example.com', role: 'user' })
                .expect(500);
            expect(res.body.error).toBe('Hiba a felhasználó frissítésekor!');
        });
    });

    describe('PUT /api/admin/userSelfUpdate', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .put('/api/admin/userSelfUpdate')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .put('/api/admin/userSelfUpdate')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('HIBA - 400, ha érvénytelen body paraméter', async () => {
            const res = await request(app)
                .put('/api/admin/userSelfUpdate')
                .send({ username: '', email: 'invalid' })
                .expect(400);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it('SIKER - 204, saját adatainak frissítése', async () => {
            db.updateUserByAdmin.mockResolvedValue(1);
            await request(app)
                .put('/api/admin/userSelfUpdate')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com' })
                .expect(204);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.updateUserByAdmin.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .put('/api/admin/userSelfUpdate')
                .send({ username: 'UpdatedUser', email: 'updateduser@example.com' })
                .expect(500);
            expect(res.body.error).toBe('Hiba a felhasználó frissítésekor!');
        });
    });

    describe('PUT /api/admin/updateProfilePicFromAdmin', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .put('/api/admin/updateProfilePicFromAdmin')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .put('/api/admin/updateProfilePicFromAdmin')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('HIBA 400 - nincs kép feltöltve', async () => {
            const res = await request(app)
                .put('/api/admin/updateProfilePicFromAdmin')
                .set('simulate-no-file', 'true')
                .field('user_id', 123)
                .expect(400);
            expect(res.body.message).toBe('Nincs kép!');
        });

        it('SIKER 201 - sikeresen frissíti a profilképet', async () => {
            const sharpMock = {
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
            expect(res.body.error).toBe("Hiba a profilkép frissítésekor!");
        });
    });

    describe('DELETE /api/admin/userToInactive', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .delete('/api/admin/userToInactive')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .delete('/api/admin/userToInactive')
                .set('notadmin', 'true')
                .expect(404);
        });

        it('HIBA - 400, ha érvénytelen body paraméter', async () => {
            const res = await request(app)
                .delete('/api/admin/userToInactive')
                .send({ role: 'ADMIN', deleted: false })
                .expect(400);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it('SIKER - 204, felhasználó inaktívvá tétele', async () => {
            db.userToInactive.mockResolvedValue(1);
            await request(app)
                .delete('/api/admin/userToInactive')
                .send({ userId: 1, role: 'user', deleted: true })
                .expect(204);
        });

        it('HIBA - 500, adatbázis hiba', async () => {
            db.userToInactive.mockRejectedValue(new Error('Database error'));
            const res = await request(app)
                .delete('/api/admin/userToInactive')
                .send({ userId: 1, role: 'user', deleted: true })
                .expect(500);
            expect(res.body.error).toBe("Hiba a felhasználó inaktiválásakor!");
        });
    });

    describe('DELETE /api/admin/deleteProfilePicFromAdmin', () => {
        it('HIBA - 401, ha nincs bejelentkezve', async () => {
            await request(app)
                .delete('/api/admin/deleteProfilePicFromAdmin')
                .set('unauthenticated', 'true')
                .expect(401);
        });

        it('HIBA - 404, ha nem admin', async () => {
            await request(app)
                .delete('/api/admin/deleteProfilePicFromAdmin')
                .set('notadmin', 'true')
                .expect(404);
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
            expect(res.body.message).toContain('alapértelmezett');
        });

        it('HIBA 500 - adatbázis hiba', async () => {
            db.deleteProfilePic.mockRejectedValue(new Error('DB Error'));
            const res = await request(app)
                .delete('/api/admin/deleteProfilePicFromAdmin')
                .send({ user_id: 123 })
                .expect(500);
            expect(res.body.error).toBe('Hiba a profilkép törlésekor!');
        });
    });
});