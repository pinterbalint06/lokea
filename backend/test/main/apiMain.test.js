const request = require('supertest');
const express = require('express');
const db = require('../../sql/main/databaseMain.js');
const auth = require('../../utils/auth.js');
const enTranslations = require('../../locales/en/admin.json');
const huTranslations = require('../../locales/hu/admin.json');
const { mockI18nMiddleware, testRequiresAdminOrAuth } = require('./helpers/helpers.js');

const app = express();
app.use(express.json());

app.use(mockI18nMiddleware);

app.use('/api', auth.checkAuth, require('../../api/main/index.js'));

describe('Main API-tesztek', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Végpont: GET /getLanguage', () => {
        testRequiresAdminOrAuth(() => request(app).get('/api/getLanguage'));

        it('SIKER - 200, nyelv lekérése', async () => {
            const res = await request(app).get('/api/getLanguage').expect(200);
            expect(res.body.language).toBe("en");
        });
    });
});