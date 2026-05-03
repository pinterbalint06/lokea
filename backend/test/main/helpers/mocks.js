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

jest.mock('fs/promises');
jest.mock('bcrypt');
jest.mock('#sql/main/databaseMain.js');
jest.mock('#sql/main/databaseSettings.js');
jest.mock('#sql/admin/databaseLogs.js');

jest.mock('#middlewares/auth.js', () => ({
    checkAuth: require('./helpers.js').mockCheckAuth
}));

jest.mock('#utils/mails.js', () => ({
    sendWelcomeEmail: jest.fn().mockResolvedValue(),
    sendChangeEmail: jest.fn().mockResolvedValue(),
    sendDeleteEmail: jest.fn().mockResolvedValue(),
    sendPasswordChangeEmail: jest.fn().mockResolvedValue()
}));