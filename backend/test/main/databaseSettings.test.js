const pool = require('../../sql/main/connection.js');
const bcrypt = require('bcrypt');
const databaseSettings = require('../../sql/main/databaseSettings.js');
const { suppressConsoleErrors, expectSuccessfulTransaction, expectRollback } = require('./helpers/helpers.js');

// Mockok
jest.mock('bcrypt');
jest.mock('../../sql/main/connection.js', () => {
    const mockConnection = {
        execute: jest.fn(),
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn()
    };
    return {
        execute: jest.fn(),
        getConnection: jest.fn().mockResolvedValue(mockConnection),
        _mockConnection: mockConnection
    };
});

describe('Adatbázis Settings Tesztek (databaseSettings.js)', () => {
    suppressConsoleErrors();

    let mockConn;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConn = pool._mockConnection;
    });

    describe('getUser()', () => {
        it('SIKER - Felhasználó adatainak lekérése', async () => {
            const mockData = [{ user_id: 1, username: 'TesztElek' }];
            pool.execute.mockResolvedValue([mockData]);

            const result = await databaseSettings.getUser(1);

            expect(result).toEqual(mockData);
            expect(pool.execute).toHaveBeenCalledWith(expect.any(String), [1]);
        });
    });

    describe('updateUser()', () => {
        it('SIKER - Nincs frissítendő adat (nem fut le adatbázis hívás)', async () => {
            const result = await databaseSettings.updateUser(1, null, null, null, null);
            expect(result).toBe(0);
            expect(pool.getConnection).not.toHaveBeenCalled();
        });

        it('SIKER - Dinamikus lekérdezés generálása és adatok frissítése', async () => {
            mockConn.execute.mockResolvedValue([{ affectedRows: 1 }]);

            const result = await databaseSettings.updateUser(1, 'UjNev', null, 'en', null);

            expect(result).toBe(1);
            expectSuccessfulTransaction(mockConn);
            expect(mockConn.execute).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users  SET users.username = ? , users.language = ? WHERE users.user_id = ?'),
                ['UjNev', 'en', 1]
            );
        });

        it('HIBA - Tranzakció visszavonása adatbázis hiba esetén', async () => {
            mockConn.execute.mockRejectedValue(new Error('DB hiba'));

            await expect(databaseSettings.updateUser(1, 'Nev', null, null, null)).rejects.toThrow('DB hiba');
            expectRollback(mockConn);
        });
    });

    describe('updatePassword()', () => {
        it('HIBA - Felhasználó nem található', async () => {
            pool.execute.mockResolvedValue([[]]);
            await expect(databaseSettings.updatePassword(1, 'oldPass', 'newPass')).rejects.toThrow('Felhasználó nem található!');
            expect(pool.getConnection).not.toHaveBeenCalled();
        });

        it('HIBA - Régi jelszó nem egyezik', async () => {
            pool.execute.mockResolvedValue([[{ password: 'hashed_db_pass' }]]);
            bcrypt.compare.mockResolvedValue(false); 

            await expect(databaseSettings.updatePassword(1, 'wrongOld', 'newPass')).rejects.toThrow('Nem ez a régi jelszavad!');
            expect(pool.getConnection).not.toHaveBeenCalled();
        });

        it('SIKER - Sikeres jelszócsere', async () => {
            pool.execute.mockResolvedValue([[{ username: 'Elek', email: 'e@e.hu', password: 'hashed_db_pass' }]]);
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('hashed_new_pass');
            mockConn.execute.mockResolvedValue([{ affectedRows: 1 }]);

            const result = await databaseSettings.updatePassword(1, 'correctOld', 'newPass');

            expect(result).toEqual({ username: 'Elek', email: 'e@e.hu' });
            expectSuccessfulTransaction(mockConn);
            expect(mockConn.execute).toHaveBeenCalledWith(expect.any(String), ['hashed_new_pass', 1]);
        });
    });

    describe('userToInactive()', () => {
        it('HIBA - Felhasználó nem található', async () => {
            pool.execute.mockResolvedValue([[]]);
            await expect(databaseSettings.userToInactive(1)).rejects.toThrow('Felhasználó nem található!');
        });

        it('SIKER - Felhasználó törlése (deleted_at beállítása)', async () => {
            pool.execute.mockResolvedValue([[{ username: 'Elek', email: 'e@e.hu' }]]);
            mockConn.execute.mockResolvedValue([{ affectedRows: 1 }]);

            const result = await databaseSettings.userToInactive(1);

            expect(result).toEqual({ username: 'Elek', email: 'e@e.hu' });
            expectSuccessfulTransaction(mockConn);
            expect(mockConn.execute).toHaveBeenCalledWith(expect.any(String), [1]);
        });
    });

    describe('uploadProfilePic()', () => {
        it('HIBA - Felhasználó nem található', async () => {
            pool.execute.mockResolvedValue([[]]);
            await expect(databaseSettings.uploadProfilePic('path.webp', 100, 100, 1)).rejects.toThrow('Felhasználó nem található!');
        });

        it('SIKER - Új kép feltöltése, régi kép nélkül', async () => {
            pool.execute.mockResolvedValue([[{ filepath: null, image_id: null }]]);
            mockConn.execute.mockResolvedValueOnce([{ insertId: 5 }]);
            mockConn.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await databaseSettings.uploadProfilePic('new.webp', 100, 100, 1);

            expect(result).toBe(null);
            expectSuccessfulTransaction(mockConn);
            expect(mockConn.execute).toHaveBeenCalledTimes(2);
        });

        it('SIKER - Új kép feltöltése, régi kép megléte esetén (törléssel együtt)', async () => {
            pool.execute.mockResolvedValue([[{ filepath: 'old.webp', image_id: 2 }]]);
            mockConn.execute.mockResolvedValueOnce([{ insertId: 5 }]);
            mockConn.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockConn.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await databaseSettings.uploadProfilePic('new.webp', 100, 100, 1);

            expect(result).toBe('old.webp');
            expectSuccessfulTransaction(mockConn);
            expect(mockConn.execute).toHaveBeenCalledTimes(3);
        });
    });

    describe('deleteProfilePic()', () => {
        it('HIBA - Felhasználó nem található', async () => {
            pool.execute.mockResolvedValue([[]]);
            await expect(databaseSettings.deleteProfilePic(1)).rejects.toThrow('Felhasználó nem található!');
        });

        it('SIKER - Meglévő kép törlése', async () => {
            pool.execute.mockResolvedValue([[{ filepath: 'törlendő.webp', image_id: 10 }]]);
            mockConn.execute.mockResolvedValue([{ affectedRows: 1 }]);

            const result = await databaseSettings.deleteProfilePic(1);

            expect(result).toBe('törlendő.webp');
            expectSuccessfulTransaction(mockConn);
            expect(mockConn.execute).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM images'), [10]);
        });
    });
});