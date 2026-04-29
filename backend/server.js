//!Module-ok importálása
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const path = require('path');
const cors = require('cors');
const database = require("./sql/database.js");
const auth = require('./utils/auth.js')
const { Server } = require("socket.io");
const http = require('http');
const nodemailer = require("nodemailer");
const { Chart, registerables } = require('chart.js');
const i18next = require('i18next');
const i18n_Backend = require('i18next-fs-backend');
const i18n_Middleware = require('i18next-http-middleware');
const { idSchema } = require('./utils/schemas.js');
const ERRORS = require('./utils/error-messages.js');
const { assertUserOwnsGameMap } = require('./api/mapcreator/shared/utils/mapcreator.utils.js');
const AppError = require('#utils/app-error.js');

//!Beállítások
const app = express();
const router = express.Router();

const ip = '127.0.0.1';
const port = 3000;
const server = http.createServer(app);
const onlineUsers = new Map();
const io = new Server(server);

const lngDetector = new i18n_Middleware.LanguageDetector();
lngDetector.addDetector({
    name: 'customDetector',
    lookup(req, res, options) {
        if (req.session && req.session.userLanguage) {
            return req.session.userLanguage;
        }
        return null;
    }
});

i18next
    .use(i18n_Backend)
    .use(lngDetector)
    .init({
        fallbackLng: 'en',
        ns: ['admin', 'common'],
        defaultNS: 'common',
        backend: {
            loadPath: path.join(__dirname, '/locales/{{lng}}/{{ns}}.json'),
        },
        detection: {
            order: ['customDetector', 'querystring', 'cookie'],
            caches: ['cookie']
        }
    });

app.use(cors());
app.use(express.json()); //?Middleware JSON
app.set('trust proxy', 1); //?Middleware Proxy


//!Session beállítása:
const sessionMiddleware = session({
    name: 'geo.sid',
    secret: "sijufhiu78fz87843",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        maxAge: 60 * 60 * 1000
    }
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);
app.use(i18n_Middleware.handle(i18next));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../private/frontend')));
app.use('/locales', express.static(path.join(__dirname, 'locales')));

//!Routing
//?Főoldal:
router.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/main.html'));
});
router.get('/main', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/main.html'));
});
router.get('/register_page', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/register.html'));
});
router.get('/equirectangular', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/test-equirectangular.html'));
});
router.get('/map', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/test-map.html'));
});
router.get('/game-maps/:gameMapId/edit',
    auth.checkAuth,
    async (request, response) => {
        try {
            const gameMapId = await idSchema(ERRORS.GAMEMAP.INVALID_ID).validateAsync(
                request.params.gameMapId,
                {
                    abortEarly: true,
                    stripUnknown: true,
                    convert: true
                }
            );

            await assertUserOwnsGameMap(request.session.userid, gameMapId);

            response.sendFile(path.join(__dirname, '../frontend/html/map-creator.html'));
        } catch (error) {
            if (error.isJoi) {
                // TODO: valami oldal ennek
                response.status(400).json({ error: error.details[0].message });
            } else {
                if (error instanceof AppError) {
                    response.status(error.statusCode).send();
                } else {
                    console.error(error);
                    response.status(500).send();
                }
            }
        }
    }
);

router.get('/admin', auth.checkRole("ADMIN", "LORD"), (request, response) => {
    response.sendFile(path.join(__dirname, '../private/frontend/html/admin.html'));
});
router.get('/choose_game', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/game-choosing.html'));
});
router.get(
    '/game-maps/:gameMapId',
    auth.checkAuth,
    async (request, response) => {
        try {
            await idSchema(ERRORS.GAMEMAP.INVALID_ID).validateAsync(request.params.gameMapId, {
                abortEarly: true,
                stripUnknown: true,
                convert: true
            });

            const doesGameMapExist = await database.doesGameMapExist(request.params.gameMapId);
            if (!doesGameMapExist) {
                throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
            }

            response.sendFile(path.join(__dirname, '../frontend/html/game-map.html'));
        } catch (error) {
            if (error.isJoi) {
                // TODO: valami oldal ennek
                response.status(400).json({ error: error.details[0].message });
            } else {
                if (error instanceof AppError && error.statusCode == 404) {
                    response.status(404).sendFile(path.join(__dirname, '../frontend/html/notfound.html'));
                } else {
                    console.error(error);
                    response.status(500).send();
                }
            }
        }
    }
);
router.use((request, response) => {
    response.status(404).sendFile(path.join(__dirname, '../frontend/html/notfound.html'));
});

//!API endpoints
const adminEndpoints = require('./api/admin/index.js');
app.use('/api/admin', auth.checkAuth, auth.checkRole("ADMIN", "LORD"), adminEndpoints);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);
//!Map Creation API endpoints
const mapCreationEndpoints = require('./api/mapcreator/mapcreator.js');
app.use('/api/map-creator', mapCreationEndpoints);
//!game maps API endpoints
const gameMapsEndpoints = require('./api/gamemaps/gamemaps.routes.js');
app.use('/api/game-maps', gameMapsEndpoints);
app.use('/', router);

//Socket.io

io.on("connection", (socket) => {
    const session = socket.request.session;
    const userId = session ? session.userid : null;

    socket.emit("totalOnline", onlineUsers.size);

    if (userId) {
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
            onlineUsers.get(userId).add(socket.id);

            io.emit("totalOnline", onlineUsers.size);
        } else {
            onlineUsers.get(userId).add(socket.id);
        }
    }

    socket.on("disconnect", () => {
        if (userId && onlineUsers.has(userId)) {
            const userSockets = onlineUsers.get(userId);
            userSockets.delete(socket.id);

            if (userSockets.size === 0) {
                onlineUsers.delete(userId);
            }

            io.emit("totalOnline", onlineUsers.size);
        }
    });
});

//!Szerver futtatása
server.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K