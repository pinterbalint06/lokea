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

jest.mock('#sql/admin/databaseUsers.js');
jest.mock('#sql/admin/databaseLogs.js');
jest.mock('#sql/admin/databaseAdmin.js');
jest.mock('#sql/admin/databaseSettings.js');

jest.mock('#config/mapdatas-upload-config.js', () => {
    const multer = require('multer');
    return {
        UPLOAD_ROOT: 'uploads',
        upload: multer({
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (request, file, callback) => {
                if (file.mimetype && file.mimetype.startsWith('image/')) {
                    callback(null, true);
                } else {
                    request.fileValidationError = 'Érvénytelen fájltípus! Csak képeket tölthetsz fel.';
                    callback(null, false);
                }
            }
        })
    };
}, { virtual: true });

jest.mock('#utils/auth.js', () => {
    const helpers = require('./helpers.js');
    return {
        checkAuth: helpers.mockCheckAuth,
        checkRole: helpers.mockCheckRole
    };
});

const pool = require('#sql/connection.js');

jest.mock('#sql/connection.js', () => ({
    execute: jest.fn(),
    getConnection: jest.fn()
}));

const mockConnection = {
    beginTransaction: jest.fn(),
    execute: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
};

function setupDbMocks() {
    jest.clearAllMocks();
    pool.getConnection.mockResolvedValue(mockConnection);
}

module.exports = { mockConnection, setupDbMocks };
