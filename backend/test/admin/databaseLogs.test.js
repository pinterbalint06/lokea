const { mockConnection, setupDbMocks } = require('./helpers/mocks.js');
const pool = require('#sql/connection.js');
const databaseLogs = jest.requireActual('#sql/admin/databaseLogs.js');

describe('Admin Database: databaseLogs.js', () => {
    beforeEach(() => {
        setupDbMocks();
    });

    describe('addLog', () => {
        it('SIKER - áldozat nélkül menti a logot', async () => {
            await databaseLogs.addLog(1, 'Login');
            expect(pool.getConnection).toHaveBeenCalled();
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(mockConnection.execute).toHaveBeenCalledWith(expect.any(String), [1, 'Login']);
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('SIKER - áldozattal menti a logot', async () => {
            await databaseLogs.addLog(1, 'Ban', 2);
            expect(mockConnection.execute).toHaveBeenCalledWith(expect.any(String), [1, 2, 'Ban']);
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('HIBA - adatbázis hiba esetén rollback-el', async () => {
            mockConnection.execute.mockRejectedValue(new Error('SQL Hiba'));
            await expect(databaseLogs.addLog(1, 'Login')).rejects.toThrow('SQL Hiba');
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });
    });

    describe('getLogs', () => {
        it('SIKER - lekéri a logokat és a darabszámot', async () => {
            pool.execute
                .mockResolvedValueOnce([[{ total: 5 }]])
                .mockResolvedValueOnce([[{ activity: 'Login' }]]);

            const res = await databaseLogs.getLogs(10);
            expect(res.total).toBe(5);
            expect(res.rows).toHaveLength(1);
            expect(pool.execute).toHaveBeenCalledTimes(2);
        });

        it('HIBA - adatbázis hiba esetén kivételt dob', async () => {
            pool.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseLogs.getLogs()).rejects.toThrow('DB hiba');
        });
    });

    describe('sortedLogs', () => {
        it('SIKER - minden paraméterrel megfelelően lekéri a logokat', async () => {
            pool.execute
                .mockResolvedValueOnce([[{ total: 10 }]])
                .mockResolvedValueOnce([[{ activity: 'Login' }]]);

            const res = await databaseLogs.sortedLogs('user', '2023-01-01', '2023-12-31', ['ADMIN'], ['Login'], 1, 15);
            expect(res.total).toBe(10);
            expect(pool.execute).toHaveBeenCalledTimes(2);
        });

        it('SIKER - üres paraméterekkel is működik', async () => {
            pool.execute
                .mockResolvedValueOnce([[{ total: 0 }]])
                .mockResolvedValueOnce([[]]);

            const res = await databaseLogs.sortedLogs(null, null, null, null, null, 1, 15);
            expect(res.total).toBe(0);
            expect(res.rows).toEqual([]);
        });

        it('HIBA - adatbázis hiba a rendezett logoknál', async () => {
            pool.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseLogs.sortedLogs()).rejects.toThrow('DB hiba');
        });
    });
});
