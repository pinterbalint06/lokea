const { expectSuccessfulTransaction, expectRollback, suppressConsoleErrors } = require("#testhelpers/helpers.js");
const enMainTranslations = require('#locales/en/main.json');
const enAdminTranslations = require('#locales/en/admin.json');

const mockCheckAuth = (req, res, next) => {
    if (req.headers.unauthenticated) {
        return res.status(401).json({ message: "Bejelentkezés szükséges!" });
    }
    if (!req.session) req.session = {};
    req.session.userid = 1;
    req.session.role = req.headers.simulaterole || "user";
    req.session.destroy = jest.fn(cb => cb(null));
    req.session.userLanguage = "en";
    next();
};

const mockI18nMiddleware = (req, res, next) => {
    if (!req.session) {
        req.session = {
            destroy: jest.fn(cb => cb(null)),
            cookie: {}
        };
    }
    req.t = (key) => {
        let val = enMainTranslations;
        let path = key;
        if (key.startsWith('main:')) {
            path = key.replace(/^main:/, '');
        } else if (key.startsWith('admin:')) {
            val = enAdminTranslations;
            path = key.replace(/^admin:/, '');
        }
        const parts = path.split('.');
        for (let p of parts) {
            if (val) val = val[p];
            else break;
        }
        return val || key;
    };
    next();
};

function testRequiresAuth(requestCallback) {
    it('HIBA - 401, ha nincs bejelentkezve', async () => {
        await requestCallback().set('unauthenticated', 'true').expect(401);
    });
}

module.exports = {
    mockCheckAuth,
    mockI18nMiddleware,
    suppressConsoleErrors,
    testRequiresAuth,
    expectSuccessfulTransaction,
    expectRollback,
    suppressConsoleErrors
};