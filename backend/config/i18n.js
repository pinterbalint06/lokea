const path = require('path');
const i18next = require('i18next');
const i18n_Backend = require('i18next-fs-backend');
const i18n_Middleware = require('i18next-http-middleware');

const lngDetector = new i18n_Middleware.LanguageDetector();

lngDetector.addDetector({
    name: 'customDetector',
    lookup(req, res, options) {
        return (req.session && req.session.userLanguage) ? req.session.userLanguage : null;
    }
});

const i18nInitPromise = i18next
    .use(i18n_Backend)
    .use(lngDetector)
    .init({
        fallbackLng: 'en',
        ns: ['admin', 'common'],
        defaultNS: 'common',
        backend: {
            loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
        },
        detection: {
            order: ['customDetector', 'querystring', 'cookie'],
            caches: ['cookie']
        }
    });

module.exports = {
    i18next,
    i18n_Middleware,
    i18nInitPromise
};
