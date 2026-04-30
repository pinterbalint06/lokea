import i18next from 'https://cdn.jsdelivr.net/npm/i18next@23.7.16/+esm';
import HttpBackend from 'https://cdn.jsdelivr.net/npm/i18next-http-backend@2.4.2/+esm';

export async function initI18next(nyelv = 'hu') {
    await i18next
        .use(HttpBackend)
        .init({
            lng: nyelv,
            fallbackLng: 'en',
            ns: ['main'],
            defaultNS: 'main',
            backend: {
                loadPath: '/locales/{{lng}}/{{ns}}.json'
            }
        });
    return i18next;
}

export default i18next;