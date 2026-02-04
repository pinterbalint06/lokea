//!Module-ok importálása
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const path = require('path');
const cors = require('cors');

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
router.get('/login_page', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/login.html'));
});
router.get('/palyavalasztas', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/jatek-valsztas.html'));
});



//!API endpoints
app.use('/', router);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);

//!Szerver futtatása
app.use(express.static(path.join(__dirname, '../frontend'))); //?frontend mappa tartalmának betöltése az oldal működéséhez
app.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K
