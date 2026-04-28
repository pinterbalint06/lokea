const database = require("#sql/database.js");
const { mockConnection } = database;
const enTranslations = require('../../../locales/en/admin.json');
const huTranslations = require('../../../locales/hu/admin.json');

jest.mock('../../../utils/mails.js', () => ({
    sendWelcomeEmail: jest.fn().mockResolvedValue(),
    sendChangeEmail: jest.fn().mockResolvedValue(),
    sendDeleteEmail: jest.fn().mockResolvedValue(),
    sendPasswordChangeEmail: jest.fn().mockResolvedValue()
}));

const mockCheckAuth = (req, res, next) => {
    if (req.headers.unauthenticated) {
        return res.status(401).json({ message: "Bejelentkezés szükséges!" });
    }
    if (!req.session) req.session = {};
    req.session.userid = 99;
    req.session.role = "ADMIN";
    req.session.userLanguage = "en";
    next();
};

const mockCheckRole = (...roles) => (req, res, next) => {
    if (req.headers.notadmin) {
        return res.status(404).send("Not Found HTML");
    }
    next();
};

const mockI18nMiddleware = (req, res, next) => {
    if (!req.session) req.session = { userLanguage: 'en' };
    req.t = (key) => {
        const lang = req.session.userLanguage || 'en';
        const translations = lang === 'en' ? enTranslations : huTranslations;
        const [namespace, ...keys] = key.split(':');
        const keyPath = keys.join(':');

        if (namespace !== 'admin') return key;
        const result = keyPath.split('.').reduce((obj, k) => obj && obj[k] !== undefined ? obj[k] : undefined, translations);
        return result || key;
    };
    next();
};

function testRequiresAdminOrAuth(requestCallback) {
    it('HIBA - 401, ha nincs bejelentkezve', async () => {
        await requestCallback().set('unauthenticated', 'true').expect(401);
    });

    it('HIBA - 404, ha nem admin', async () => {
        await requestCallback().set('notadmin', 'true').expect(404);
    });
}

module.exports = {
    mockCheckAuth,
    mockCheckRole,
    mockI18nMiddleware,
    testRequiresAdminOrAuth
};