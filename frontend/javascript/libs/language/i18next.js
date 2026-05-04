import i18next from '../i18next/i18next.js';
import HttpBackend from '../i18next/httpBackend.js';

export async function initI18next(nyelv = 'hu') {
    await i18next
        .use(HttpBackend)
        .init({
            lng: nyelv,
            fallbackLng: 'en',
            ns: ['main', 'common', 'errors', 'game-maps', 'game'],
            defaultNS: 'main',
            backend: {
                loadPath: '/locales/{{lng}}/{{ns}}.json'
            }
        });
    return i18next;
}

export default i18next;