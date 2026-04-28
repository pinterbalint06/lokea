//!Module-ok importálása
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const path = require('path');
const cors = require('cors');
const database = require("./sql/database.js");
const auth = require('./auth.js')
const { Server } = require("socket.io");
const http = require('http');
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
router.get('/terrain', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/test-terrain.html'));
});
router.get('/equirectangular', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/test-equirectangular.html'));
});
router.get('/webgl', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/test-webgl.html'));
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

router.get('/admin', auth.checkRole("ADMIN"), (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/admin.html'));
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
app.use(express.static(path.join(__dirname, '../frontend')));
const adminEndpoints = require('./api/admin.js');
app.use('/api/admin', adminEndpoints);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);
//!Game choosing API endpoints
const gameChoosingEndpoints = require('./api/gameflow/gameChoosing.js');
app.use('/api/choose-game', gameChoosingEndpoints);
//!Map Creation API endpoints
const mapCreationEndpoints = require('./api/mapcreator/mapcreator.js');
app.use('/api/map-creator', mapCreationEndpoints);
//!game maps API endpoints
const gameMapsEndpoints = require('./api/gamemaps/gamemaps.routes.js');
app.use('/api/game-maps', gameMapsEndpoints);
//!game API endpoints
const gameEndpoints = require('./api/gameflow/gameApi.js');
app.use('/api/game', gameEndpoints);
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
