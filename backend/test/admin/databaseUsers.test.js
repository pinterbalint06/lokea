const { mockConnection, setupDbMocks } = require('./helpers/mocks.js');
const pool = require('#sql/connection.js');
const databaseUsers = jest.requireActual('#sql/admin/databaseUsers.js');

describe('Admin Database: databaseUsers.js', () => {
    beforeEach(() => {
        setupDbMocks();
    });

    describe('getUsers', () => {
        it('SIKER', async () => {
            pool.execute
                .mockResolvedValueOnce([[{ total: 5 }]])
                .mockResolvedValueOnce([[{ username: 'Test' }]]);
            const result = await databaseUsers.getUsers();
            expect(result.total).toBe(5);
            expect(result.rows).toHaveLength(1);
        });

        it('HIBA', async () => {
            pool.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseUsers.getUsers()).rejects.toThrow('DB hiba');
        });
    });

    describe('sortedUsers', () => {
        it('SIKER paraméterekkel', async () => {
            pool.execute
                .mockResolvedValueOnce([[{ total: 2 }]])
                .mockResolvedValueOnce([[{ username: 'Test' }]]);
            const result = await databaseUsers.sortedUsers('username', 'Test', 'statusActive', true, false, true, false, 1, 10);
            expect(result.total).toBe(2);
            expect(result.rows).toHaveLength(1);
        });

        it('HIBA', async () => {
            pool.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseUsers.sortedUsers()).rejects.toThrow('DB hiba');
        });
    });

    describe('getUser', () => {
        it('SIKER', async () => {
            pool.execute.mockResolvedValue([[{ username: 'User1' }]]);
            const result = await databaseUsers.getUser(1);
            expect(result).toEqual([{ username: 'User1' }]);
        });

        it('HIBA', async () => {
            pool.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseUsers.getUser(1)).rejects.toThrow('DB hiba');
        });
    });

    describe('getOldPicturePath', () => {
        it('SIKER', async () => {
            pool.execute.mockResolvedValue([[{ image_id: 1, filepath: 'old.webp' }]]);
            const result = await databaseUsers.getOldPicturePath(1);
            expect(result).toEqual({ image_id: 1, filepath: 'old.webp' });
        });

        it('HIBA', async () => {
            pool.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseUsers.getOldPicturePath(1)).rejects.toThrow('DB hiba');
        });
    });

    describe('getUserNameProfile', () => {
        it('SIKER', async () => {
            pool.execute.mockResolvedValue([[{ username: 'Test', darkmode: 1 }]]);
            const res = await databaseUsers.getUserNameProfile(1);
            expect(res).toEqual([{ username: 'Test', darkmode: 1 }]);
        });

        it('HIBA', async () => {
            pool.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseUsers.getUserNameProfile(1)).rejects.toThrow('DB hiba');
        });
    });

    describe('newUserFromAdmin', () => {
        it('SIKER - új felhasználó létrehozása', async () => {
            mockConnection.execute.mockResolvedValue([{ affectedRows: 1, insertId: 10 }]);
            const result = await databaseUsers.newUserFromAdmin('Test', 'test@test.com', 'hashed', 'USER');
            expect(result).toEqual({ success: true, insertId: 10 });
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('HIBA - duplikált email vagy username (ER_DUP_ENTRY)', async () => {
            const dupError = new Error('Dup');
            dupError.code = 'ER_DUP_ENTRY';
            mockConnection.execute.mockRejectedValue(dupError);

            const result = await databaseUsers.newUserFromAdmin('Test', 'test@test.com', 'hashed', 'USER');
            expect(result).toEqual({ success: false, error: 'User exists' });
            expect(mockConnection.rollback).toHaveBeenCalled();
        });

        it('HIBA - egyéb hiba esetén rollback és dobja a hibát', async () => {
            mockConnection.execute.mockRejectedValue(new Error('Egyéb hiba'));
            await expect(databaseUsers.newUserFromAdmin('Test', 'test@test.com', 'hashed', 'USER')).rejects.toThrow('Egyéb hiba');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });

        it('HIBA - insert failed (affectedRows != 1)', async () => {
            mockConnection.execute.mockResolvedValue([{ affectedRows: 0 }]);
            await expect(databaseUsers.newUserFromAdmin('Test', 'test@test.com', 'hashed', 'USER')).rejects.toThrow('Insert failed');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('uploadProfilePic', () => {
        it('SIKER, régi kép is volt', async () => {
            pool.execute.mockResolvedValueOnce([[{ image_id: 1, filepath: 'old.webp' }]]); // getOldPicturePath
            mockConnection.execute
                .mockResolvedValueOnce([{ insertId: 2 }])
                .mockResolvedValueOnce([{ affectedRows: 1 }])
                .mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await databaseUsers.uploadProfilePic('new.webp', 400, 400, 1);
            expect(result).toBe('old.webp');
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('HIBA esetén rollback', async () => {
            pool.execute.mockResolvedValueOnce([[{ image_id: 1, filepath: 'old.webp' }]]);
            mockConnection.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseUsers.uploadProfilePic('new.webp', 400, 400, 1)).rejects.toThrow('DB hiba');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('deleteProfilePic', () => {
        it('SIKER', async () => {
            pool.execute.mockResolvedValueOnce([[{ image_id: 1, filepath: 'old.webp' }]]);
            mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

            const result = await databaseUsers.deleteProfilePic(1);
            expect(result).toBe('old.webp');
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('HIBA esetén rollback', async () => {
            pool.execute.mockResolvedValueOnce([[{ image_id: 1, filepath: 'old.webp' }]]);
            mockConnection.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseUsers.deleteProfilePic(1)).rejects.toThrow('DB hiba');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('updateUserByAdmin', () => {
        it('SIKER - frissíti az adatokat, ha nincs törölve a user', async () => {
            pool.execute.mockResolvedValueOnce([[{ deleted_at: null }]]);
            mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);

            const affected = await databaseUsers.updateUserByAdmin(1, 'NewName', 'new@email.com', 'ADMIN');
            expect(affected).toBe(1);
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('HIBA - duplikáció a frissítésnél (ER_DUP_ENTRY)', async () => {
            pool.execute.mockResolvedValueOnce([[{ deleted_at: null }]]);
            const dupError = new Error('Dup');
            dupError.code = 'ER_DUP_ENTRY';
            mockConnection.execute.mockRejectedValue(dupError);

            const result = await databaseUsers.updateUserByAdmin(1, 'NewName', 'new@email.com');
            expect(result).toBe('User exists');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });

        it('HIBA - nincs frissítendő mező (kivételt dob a validáció miatt)', async () => {
            pool.execute.mockResolvedValueOnce([[{ deleted_at: null }]]);
            await expect(databaseUsers.updateUserByAdmin(1, null, null, null)).rejects.toThrow('Nincs frissítendő mező');
        });

        it('SIKER - a felhasználó már törölt (nem történik frissítés)', async () => {
            pool.execute.mockResolvedValueOnce([[{ deleted_at: '2024-01-01' }]]);
            const res = await databaseUsers.updateUserByAdmin(1, 'NewName', null, null);
            expect(res).toBe(0);
            expect(mockConnection.execute).not.toHaveBeenCalled();
        });
    });

    describe('userToInactive', () => {
        it('SIKER - inaktiválja a felhasználót, és visszaadja az emaijét is', async () => {
            mockConnection.execute
                .mockResolvedValueOnce([[{ email: 'a@a.hu', username: 'A' }]])
                .mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await databaseUsers.userToInactive(1);
            expect(result).toEqual({ email: 'a@a.hu', username: 'A', affectedRows: 1 });
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('HIBA - rollback adatbázis hiba esetén', async () => {
            mockConnection.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseUsers.userToInactive(1)).rejects.toThrow('DB hiba');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });
});
