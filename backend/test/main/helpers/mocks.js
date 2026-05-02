jest.mock('sharp', () => {
    const sharpMock = jest.fn(() => ({
        rotate: jest.fn().mockReturnThis(),
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({ width: 400, height: 400 }),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image-data'))
    }));
    sharpMock.cache = jest.fn();
    return sharpMock;
});

jest.mock('fs/promises');
jest.mock('bcrypt');
jest.mock('#sql/main/databaseMain.js');
jest.mock('#sql/main/databaseSettings.js');
jest.mock('#utils/auth.js', () => {
    const helpers = require('./helpers.js');
    return { checkAuth: helpers.mockCheckAuth };
});