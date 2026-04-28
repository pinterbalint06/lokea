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
        toFile: jest.fn().mockResolvedValue({ width: 400, height: 400 }),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image-data'))
    }));
    sharpMock.cache = jest.fn();
    return sharpMock;
});

jest.mock('fs/promises');

jest.mock('skia-canvas', () => ({
    Canvas: jest.fn().mockImplementation(() => ({
        getContext: jest.fn().mockReturnValue({}),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-raw-data'))
    }))
}));

jest.mock('chart.js', () => {
    const ChartMock = jest.fn().mockImplementation(() => ({
        destroy: jest.fn()
    }));
    ChartMock.register = jest.fn();
    return { Chart: ChartMock, registerables: [] };
});

jest.mock('../../../sql/admin/databaseUsers.js');
jest.mock('../../../sql/admin/databaseLogs.js');
jest.mock('../../../sql/admin/databaseAdmin.js');
jest.mock('../../../sql/admin/databaseSettings.js');

jest.mock('../../../utils/auth.js', () => {
    const helpers = require('./helpers.js');
    return {
        checkAuth: helpers.mockCheckAuth,
        checkRole: helpers.mockCheckRole
    };
});