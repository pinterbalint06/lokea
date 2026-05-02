const { expectSuccessfulTransaction, expectRollback, suppressConsoleErrors } = require("#testhelpers/helpers.js");


jest.mock('#utils/mails.js', () => ({
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
    req.session.userid = 1;
    req.session.role = req.headers.simulaterole || "user";
    req.session.destroy = jest.fn(cb => cb(null));
    next();
};

const mockI18nMiddleware = (req, res, next) => {
    if (!req.session) {
        req.session = {
            destroy: jest.fn(cb => cb(null)),
            cookie: {}
        };
    }
    req.t = (key) => key;
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