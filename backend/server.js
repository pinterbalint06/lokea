//!Module-ok importálása
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const path = require('path');
const cors = require('cors');
const database = require("./sql/database.js");
const auth = require('./auth.js')

//!Beállítások
const app = express();
const router = express.Router();

const ip = '127.0.0.1';
const port = 3000;

app.use(cors());
app.use(express.json()); //?Middleware JSON
app.set('trust proxy', 1); //?Middleware Proxy

//!Session beállítása:
app.use(session({
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
}));


async function hasPermissionToEdit(request, gameMapID) {
    const userId = request.session.userid;
    const isTheirs = await database.checkUserOwnsGameMap(userId, gameMapID);
    return isTheirs;
}


//!Routing
//?Főoldal:
router.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/index.html'));
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
router.get('/maps/:gameMapId/edit', auth.checkAuth, async (request, response) => {
    try {
        let gameMapID = Number(request.params.gameMapId);
        if (!Number.isInteger(gameMapID) || gameMapID <= 0) {
            response.status(400).send();
        }
        let hasPermission = await hasPermissionToEdit(request, gameMapID);
        if (hasPermission) {
            response.sendFile(path.join(__dirname, '../frontend/html/map-creator.html'));
        } else {
            response.status(403).send();
        }
    } catch (error) {
        console.error(error);
        response.status(500).send();
    }
});
router.get('/login_page', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/login.html'));
});
router.get('/admin', auth.checkRole("ADMIN"), (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/admin.html'));
});
router.get('/choose_game', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/game-choosing.html'));
});
router.use((request, response) => {
    response.status(404).sendFile(path.join(__dirname, '../frontend/html/notfound.html'));
});

//!API endpoints
app.use(express.static(path.join(__dirname, '../frontend')));
const adminEndpoints = require('./api/admin.js');
app.use('/api/admin', adminEndpoints);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);
//!Map Creation API endpoints
const mapCreationEndpoints = require('./api/mapCreatorAPI.js');
app.use('/api/map-creator', mapCreationEndpoints);
//!game maps API endpoints
const gameMapsEndpoints = require('./api/gameMaps.js');
app.use('/api/game-maps', gameMapsEndpoints);
app.use('/', router);


//!Szerver futtatása
app.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K
