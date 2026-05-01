//!Module-ok importálása
require('dotenv').config();
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const path = require('path');
const cors = require('cors');
const { doesGameMapExist } = require('#gamemaps/shared/queries/gamemaps.queries.js');
const auth = require('./utils/auth.js')
const { Server } = require("socket.io");
const http = require('http');
const i18next = require('i18next');
const i18n_Backend = require('i18next-fs-backend');
const i18n_Middleware = require('i18next-http-middleware');
const { idSchema } = require('./utils/schemas.js');
const ERRORS = require('./utils/error-messages.js');
const { assertUserOwnsGameMap } = require('./api/mapcreator/shared/utils/mapcreator.utils.js');
const AppError = require('#utils/app-error.js');
const { buildErrorHtml } = require('./utils/error-template.js');

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

const i18nInitPromise = i18next
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
    async (request, response, next) => {
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
                next(new AppError(error.details[0].message, 400));
            } else {
                next(error);
            }
        }
    }
);

router.get('/admin', auth.checkRole("ADMIN", "LORD"), (request, response) => {
    response.sendFile(path.join(__dirname, '../private/frontend/html/admin.html'));
});
router.get('/game-maps', auth.checkAuthPage, (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/game-choosing.html'));
});
router.get('/game', auth.checkGameSessionPage, (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/game-page.html'));
});
router.get(
    '/game-maps/:gameMapId',
    auth.checkAuth,
    async (request, response, next) => {
        try {
            await idSchema(ERRORS.GAMEMAP.INVALID_ID).validateAsync(request.params.gameMapId, {
                abortEarly: true,
                stripUnknown: true,
                convert: true
            });

            const gameMapExists = await doesGameMapExist(request.params.gameMapId);
            if (!gameMapExists) {
                throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
            }

            response.sendFile(path.join(__dirname, '../frontend/html/game-map.html'));
        } catch (error) {
            if (error.isJoi) {
                next(new AppError(error.details[0].message, 400));
            } else {
                next(error);
            }
        }
    }
);

//!API endpoints

const adminEndpoints = require('./api/admin/index.js');
app.use('/api/admin', auth.checkAuth, auth.checkRole("ADMIN", "LORD"), adminEndpoints);

const endpoints = require('./api/api.js');
app.use('/api', endpoints);

const gameChoosingEndpoints = require('./api/gameflow/gamelobby.js');
app.use('/api/choose-game', gameChoosingEndpoints);

const mapCreationEndpoints = require('./api/mapcreator/mapcreator.js');
app.use('/api/map-creator', mapCreationEndpoints);

const gameMapsEndpoints = require('./api/gamemaps/gamemaps.routes.js');
app.use('/api/game-maps', gameMapsEndpoints);

const gameEndpoints = require('./api/gameflow/game.js');
app.use('/api/game', gameEndpoints);

app.use('/api', (request, response) => {
    response.status(404).json({
        error: ERRORS.COMMON.ENDPOINT_NOT_FOUND
    });
});

app.use('/', router);

app.use((request, response, next) => {
    next(new AppError("A keresett oldal nem található.", 404));
});


//! global error handler
app.use((error, request, response, next) => {
    const statusCode = error.statusCode || 500;
    const message = statusCode >= 500 ? ERRORS.COMMON.UNEXPECTED_ERROR : (error.message || ERRORS.COMMON.UNEXPECTED_ERROR);
    if (statusCode >= 500) {
        console.error(`Unhandled Server Error: ${request.method} ${request.originalUrl}\n`, error);
    }

    if (!response.headersSent) {
        if (request.originalUrl.startsWith('/api')) {
            response.status(statusCode).json({
                error: message
            });
        } else {
            const finalHtml = buildErrorHtml(statusCode, message);
            response.status(statusCode).send(finalHtml);
        }
    } else {
        next(error);
    }
});


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
i18nInitPromise.then(() => {
    server.listen(port, ip, () => {
        console.log(`Szerver elérhetősége: http://${ip}:${port}`);
    });
}).catch(err => {
    console.error("Hiba az i18next inicializálása közben:", err);
});

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K