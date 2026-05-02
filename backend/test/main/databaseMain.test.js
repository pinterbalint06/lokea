const pool = require('../../sql/main/connection.js');
const databaseMain = require('../../sql/main/databaseMain.js');
const { suppressConsoleErrors, expectSuccessfulTransaction, expectRollback } = require('./helpers/helpers.js');

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

describe('Adatbázis Main Tesztek (databaseMain.js)', () => {
    suppressConsoleErrors();

    let mockConn;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConn = pool._mockConnection;
    });

    describe('newUser()', () => {
        it('SIKER - Új felhasználó létrehozása (affectedRows: 1)', async () => {
            mockConn.execute.mockResolvedValue([{ affectedRows: 1, insertId: 10 }]);
            const result = await databaseMain.newUser('TesztElek', 'teszt@elek.hu', 'hashedpass');

            expect(result).toEqual({ success: true, insertId: 10 });
            expectSuccessfulTransaction(mockConn);
            expect(mockConn.execute).toHaveBeenCalledWith(expect.any(String), ['TesztElek', 'teszt@elek.hu', 'hashedpass']);
        });

        it('HIBA - Nincs érintett sor beszúráskor (affectedRows: 0)', async () => {
            mockConn.execute.mockResolvedValue([{ affectedRows: 0 }]);
            const result = await databaseMain.newUser('TesztElek', 'teszt@elek.hu', 'hashedpass');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Hiba történt a regisztráció során!');
            expectRollback(mockConn);
        });

        it('HIBA - Foglalt felhasználónév vagy e-mail (ER_DUP_ENTRY)', async () => {
            const error = new Error('Duplicate');
            error.code = 'ER_DUP_ENTRY';
            mockConn.execute.mockRejectedValue(error);

            const result = await databaseMain.newUser('TesztElek', 'teszt@elek.hu', 'hashedpass');

            expect(result.success).toBe(false);
            expect(result.error).toBe('A felhasználónév vagy az e-mail cím már foglalt!');
            expectRollback(mockConn);
        });

        it('HIBA - Általános adatbázis hiba', async () => {
            mockConn.execute.mockRejectedValue(new Error('DB hiba'));

            const result = await databaseMain.newUser('TesztElek', 'teszt@elek.hu', 'hashedpass');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Hiba történt a regisztráció során!');
            expectRollback(mockConn);
        });
    });

    const selectTests = [
        { name: 'getUserByUsername', func: databaseMain.getUserByUsername, arg: 'TesztElek' },
        { name: 'getUserByEmail', func: databaseMain.getUserByEmail, arg: 'teszt@elek.hu' },
        { name: 'getUserNameProfile', func: databaseMain.getUserNameProfile, arg: 1 }
    ];

    selectTests.forEach(({ name, func, arg }) => {
        describe(`${name}()`, () => {
            it(`SIKER - Adat lekérése paraméter alapján (${arg})`, async () => {
                const mockRow = [{ testData: 'data' }];
                pool.execute.mockResolvedValue([mockRow]);

                const result = await func(arg);
                expect(result).toEqual(mockRow);
                expect(pool.execute).toHaveBeenCalledWith(expect.any(String), [arg]);
            });

            it('HIBA - Kivétel dobása hiba esetén', async () => {
                pool.execute.mockRejectedValue(new Error('DB hiba'));
                await expect(func(arg)).rejects.toThrow('DB hiba');
            });
        });
    });

    describe('addLog()', () => {
        it('SIKER - Log hozzáadása victim_id nélkül', async () => {
            mockConn.execute.mockResolvedValue([{ affectedRows: 1 }]);

            await databaseMain.addLog(1, 'Login');
            expect(mockConn.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO log (user_id, activity)'), [1, 'Login']);
            expect(mockConn.commit).toHaveBeenCalledTimes(1);
        });

        it('SIKER - Log hozzáadása victim_id megadásával', async () => {
            mockConn.execute.mockResolvedValue([{ affectedRows: 1 }]);

            await databaseMain.addLog(1, 'Modositas', 2);
            expect(mockConn.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO log (user_id, victim_id, activity)'), [1, 2, 'Modositas']);
            expect(mockConn.commit).toHaveBeenCalledTimes(1);
        });

        it('HIBA - Tranzakció visszavonása adatbázis hiba esetén', async () => {
            mockConn.execute.mockRejectedValue(new Error('DB hiba'));

            await expect(databaseMain.addLog(1, 'Login')).rejects.toThrow('DB hiba');
            expectRollback(mockConn);
        });
    });
});