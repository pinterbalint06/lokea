const { mockConnection, setupDbMocks } = require('./helpers/mocks.js');
const pool = require('../../sql/connection.js');
const databaseSettings = jest.requireActual('../../sql/admin/databaseSettings.js');

describe('Admin Database: databaseSettings.js', () => {
    beforeEach(() => {
        setupDbMocks();
    });

    describe('getAdminSettings', () => {
        it('SIKER - visszaadja a beállításokat, ha léteznek', async () => {
            pool.execute.mockResolvedValue([[{ darkmode: 1, selected_chart: 'activity-day' }]]);
            const result = await databaseSettings.getAdminSettings(1);
            expect(result).toEqual({ darkmode: 1, selectedChart: 'activity-day' });
        });

        it('SIKER - undefined-dal tér vissza, ha nincs beállítás mentve', async () => {
            pool.execute.mockResolvedValue([[]]);
            const result = await databaseSettings.getAdminSettings(1);
            expect(result).toBeUndefined();
        });

        it('HIBA - adatbázis hiba esetén kivételt dob', async () => {
            pool.execute.mockRejectedValue(new Error('DB hiba'));
            await expect(databaseSettings.getAdminSettings(1)).rejects.toThrow('DB hiba');
        });
    });

    describe('updateAdminSettings', () => {
        it('SIKER - frissíti a beállításokat (vagy beszúrja)', async () => {
            mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);
            const affected = await databaseSettings.updateAdminSettings(1, true, 'activity-week');
            expect(affected).toBe(1);
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('HIBA - rollback adatbázis hiba esetén', async () => {
            mockConnection.execute.mockRejectedValue(new Error('Hiba a mentésnél'));
            await expect(databaseSettings.updateAdminSettings(1, true, 'x')).rejects.toThrow('Hiba a mentésnél');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('updateDarkMode', () => {
        it('SIKER - módosítja a darkmode-ot a felhasználónak', async () => {
            mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);
            const affected = await databaseSettings.updateDarkMode(1, false);
            expect(affected).toBe(1);
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('HIBA - rollback adatbázis hiba esetén', async () => {
            mockConnection.execute.mockRejectedValue(new Error('Hiba a darkmode-nál'));
            await expect(databaseSettings.updateDarkMode(1, true)).rejects.toThrow('Hiba a darkmode-nál');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });

    describe('updateLanguage', () => {
        it('SIKER - módosítja a nyelvet', async () => {
            mockConnection.execute.mockResolvedValue([{ affectedRows: 1 }]);
            const affected = await databaseSettings.updateLanguage(1, 'hu');
            expect(affected).toBe(1);
            expect(mockConnection.commit).toHaveBeenCalled();
        });

        it('SIKER - nem csinál semmit, ha a nyelv null', async () => {
            const affected = await databaseSettings.updateLanguage(1, null);
            expect(affected).toBe(0);
            expect(pool.getConnection).not.toHaveBeenCalled();
        });

        it('HIBA - rollback adatbázis hiba esetén (nyelv)', async () => {
            mockConnection.execute.mockRejectedValue(new Error('Hiba a nyelvnél'));
            await expect(databaseSettings.updateLanguage(1, 'hu')).rejects.toThrow('Hiba a nyelvnél');
            expect(mockConnection.rollback).toHaveBeenCalled();
        });
    });
});