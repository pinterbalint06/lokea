const { setupDbMocks } = require('./helpers/mocks.js');
const pool = require('../../sql/connection.js');
const databaseAdmin = jest.requireActual('../../sql/admin/databaseAdmin.js');

describe('Admin Database: databaseAdmin.js', () => {
    beforeEach(() => {
        setupDbMocks();
    });

    describe('getUserCount', () => {
        it('SIKER - visszaadja a játékosok számát', async () => {
            pool.execute.mockResolvedValue([[{ jatekosok_szama: 100 }]]);
            const count = await databaseAdmin.getUserCount();
            expect(count).toBe(100);
            expect(pool.execute).toHaveBeenCalledTimes(1);
        });

        it('HIBA - adatbázis hiba esetén kivételt dob', async () => {
            pool.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseAdmin.getUserCount()).rejects.toThrow('DB hiba');
        });
    });

    describe('getActiveUserCount', () => {
        it('SIKER - visszaadja az aktív játékosok számát', async () => {
            pool.execute.mockResolvedValue([[{ egyedi_belepok_szama: 50 }]]);
            const count = await databaseAdmin.getActiveUserCount();
            expect(count).toBe(50);
        });

        it('HIBA - adatbázis hiba esetén kivételt dob', async () => {
            pool.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseAdmin.getActiveUserCount()).rejects.toThrow('DB hiba');
        });
    });

    describe('Dashboard Statisztikák (Grafikonok)', () => {
        it('getUserActivityByDay - SIKER', async () => {
            const mockData = [{ datum: '05.10.', felhasznalok_szama: 5 }];
            pool.execute.mockResolvedValue([mockData]);
            const result = await databaseAdmin.getUserActivityByDay();
            expect(result).toEqual(mockData);
        });

        it('getUserActivityByWeek - SIKER', async () => {
            const mockData = [{ het_megnevezes: '12.', bejelentkezesek_szama: 20 }];
            pool.execute.mockResolvedValue([mockData]);
            const result = await databaseAdmin.getUserActivityByWeek();
            expect(result).toEqual(mockData);
        });

        it('getRegistrationByWeek - SIKER', async () => {
            const mockData = [{ het_megnevezes: '12.', regisztraciok_szama: 10 }];
            pool.execute.mockResolvedValue([mockData]);
            const result = await databaseAdmin.getRegistrationByWeek();
            expect(result).toEqual(mockData);
        });

        it('getMatchCountByWeek - SIKER', async () => {
            const mockData = [{ het_megnevezes: '12.', meccsek_szama: 30 }];
            pool.execute.mockResolvedValue([mockData]);
            const result = await databaseAdmin.getMatchCountByWeek();
            expect(result).toEqual(mockData);
        });

        it('HIBA - kivételt dob bármelyik lekérdezésnél', async () => {
            pool.execute.mockRejectedValue(new Error('Stat hiba'));
            await expect(databaseAdmin.getUserActivityByDay()).rejects.toThrow('Stat hiba');
            await expect(databaseAdmin.getUserActivityByWeek()).rejects.toThrow('Stat hiba');
            await expect(databaseAdmin.getRegistrationByWeek()).rejects.toThrow('Stat hiba');
            await expect(databaseAdmin.getMatchCountByWeek()).rejects.toThrow('Stat hiba');
        });
    });
});