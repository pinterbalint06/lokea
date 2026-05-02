//!Module-ok importálása
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const i18next = require('i18next');
const i18n_Backend = require('i18next-fs-backend');
const i18n_Middleware = require('i18next-http-middleware');

// belső importok
const { doesGameMapExist } = require('#gamemaps/shared/queries/gamemaps.queries.js');
const auth = require('#utils/auth.js');
const { idSchema } = require('./utils/schemas.js');
const ERRORS = require('./utils/error-messages.js');
const { assertUserOwnsGameMap } = require('./api/mapcreator/shared/utils/mapcreator.utils.js');
const AppError = require('#utils/app-error.js');
const { buildErrorHtml } = require('./utils/error-template.js');

const IP = process.env.SERVER_IP || '127.0.0.1';
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'session_titok';


//! Szerver inicializálása
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const onlineUsers = new Map();


//! i18next beállítása
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
            loadPath: path.join(__dirname, '/locales/{{lng}}/{{ns}}.json'),
        },
        detection: {
            order: ['customDetector', 'querystring', 'cookie'],
            caches: ['cookie']
        }
    });


//! Middleware-ek
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// Session beállítása
const sessionMiddleware = session({
    name: 'geo.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV == 'production',
        maxAge: 60 * 60 * 1000
    }
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.use(i18n_Middleware.handle(i18next));

// statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../private/frontend')));
app.use('/locales', express.static(path.join(__dirname, 'locales')));


//! frontend oldalak
app.get(['/', '/main'], (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/main.html')));
app.get('/register_page', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/register.html')));
app.get('/equirectangular', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/test-equirectangular.html')));
app.get('/map', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/test-map.html')));

app.get('/admin', auth.checkRole("ADMIN", "LORD"), (req, res) => res.sendFile(path.join(__dirname, '../private/frontend/html/admin.html')));

app.get('/game-maps', auth.checkAuthPage, (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/game-choosing.html')));

app.get('/game', auth.checkGameSessionPage, (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/game-page.html')));

// pályaszerkesztő
app.get('/game-maps/:gameMapId/edit', auth.checkAuthPage, async (req, res, next) => {
    try {
        const gameMapId = await idSchema(ERRORS.GAMEMAP.INVALID_ID).validateAsync(
            req.params.gameMapId, { abortEarly: true, stripUnknown: true, convert: true }
        );
        await assertUserOwnsGameMap(req.session.userid, gameMapId);
        res.sendFile(path.join(__dirname, '../frontend/html/map-creator.html'));
    } catch (error) {
        next(error.isJoi ? new AppError(error.details[0].message, 400) : error);
    }
});

// pálya oldal
app.get('/game-maps/:gameMapId', auth.checkAuthPage, async (req, res, next) => {
    try {
        await idSchema(ERRORS.GAMEMAP.INVALID_ID).validateAsync(req.params.gameMapId, {
            abortEarly: true, stripUnknown: true, convert: true
        });

        const gameMapExists = await doesGameMapExist(req.params.gameMapId);
        if (!gameMapExists) {
            throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
        }

        res.sendFile(path.join(__dirname, '../frontend/html/game-map.html'));
    } catch (error) {
        next(error.isJoi ? new AppError(error.details[0].message, 400) : error);
    }
});


//! API routing
const adminEndpoints = require('./api/admin/index.js');
app.use('/api/admin', adminEndpoints);

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

// nem létező API végpontok
app.use('/api', (req, res) => {
    res.status(404).json({ error: ERRORS.COMMON.ENDPOINT_NOT_FOUND });
});

// nem létező Frontend oldalak (404)
app.use((req, res, next) => {
    next(new AppError("A keresett oldal nem található.", 404));
});


//! global error handler
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = statusCode >= 500 ? ERRORS.COMMON.UNEXPECTED_ERROR : (error.message || ERRORS.COMMON.UNEXPECTED_ERROR);

    if (statusCode >= 500) {
        console.error(`Unhandled Server Error: ${req.method} ${req.originalUrl}\n`, error);
    }

    if (!res.headersSent) {
        if (req.originalUrl.startsWith('/api')) {
            res.status(statusCode).json({ error: message });
        } else {
            const finalHtml = buildErrorHtml(statusCode, message);
            res.status(statusCode).send(finalHtml);
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
    server.listen(PORT, IP, () => {
        console.log(`Szerver elérhetősége: http://${IP}:${PORT}`);
    });
}).catch(err => {
    console.error("Hiba az i18next inicializálása közben:", err);
});
