const express = require('express');
const path = require('path');
const cors = require('cors');

// belső importok
const sessionMiddleware = require('#config/session.js');
const { i18next, i18n_Middleware } = require('#config/i18n.js');
const viewRoutes = require('./routes/views.routes.js');
const auth = require('#middlewares/auth.js');
const { notFoundHandler, globalErrorHandler } = require('#middlewares/error-handler.js');

const app = express();

//! middlewarek
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// session és i18n middlewarek használata
app.use(sessionMiddleware);
app.use(i18n_Middleware.handle(i18next));

//! statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(
    "/private",
    auth.checkRole("ADMIN", "LORD"),
    express.static(path.join(__dirname, '../private/frontend'))
);
app.use('/locales', express.static(path.join(__dirname, 'locales')));

//! Routing: HTML nézetek
app.use('/', viewRoutes);

//! Routing: API végpontok
const adminEndpoints = require('#root/api/admin/index.js');
app.use('/api/admin', adminEndpoints);

const endpoints = require('#main/index.js');
app.use('/api', endpoints);

const gameChoosingEndpoints = require('#root/api/gameflow/gamelobby.js');
app.use('/api/choose-game', gameChoosingEndpoints);

const mapCreationEndpoints = require('#root/api/mapcreator/mapcreator.js');
app.use('/api/map-creator', mapCreationEndpoints);

const gameMapsEndpoints = require('#root/api/gamemaps/gamemaps.routes.js');
app.use('/api/game-maps', gameMapsEndpoints);

const gameEndpoints = require('#root/api/gameflow/game.js');
app.use('/api/game', gameEndpoints);

//! Hibakezelők
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
