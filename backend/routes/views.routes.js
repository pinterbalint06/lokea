const express = require('express');
const path = require('path');
const auth = require('#middlewares/auth.js');
const { doesGameMapExist } = require('#gamemaps/shared/queries/gamemaps.queries.js');
const { idSchema } = require('#utils/schemas.js');
const ERRORS = require('#utils/error-messages.js');
const { assertUserOwnsGameMap } = require('#root/api/mapcreator/shared/utils/mapcreator.utils.js');
const AppError = require('#utils/app-error.js');

const router = express.Router();

const FRONTEND_PATH = path.join(__dirname, '../../frontend/html');
const PRIVATE_FRONTEND_PATH = path.join(__dirname, '../../private/frontend/html');

router.get(['/', '/main'], (request, response) => response.sendFile(path.join(FRONTEND_PATH, 'main.html')));
router.get('/register_page', (request, response) => response.sendFile(path.join(FRONTEND_PATH, 'register.html')));
router.get('/equirectangular', (request, response) => response.sendFile(path.join(FRONTEND_PATH, 'test-equirectangular.html')));
router.get('/map', (request, response) => response.sendFile(path.join(FRONTEND_PATH, 'test-map.html')));

router.get('/admin', auth.checkRole("ADMIN", "LORD"), (request, response) => response.sendFile(path.join(PRIVATE_FRONTEND_PATH, 'admin.html')));
router.get('/game-maps', auth.checkAuthPage, (request, response) => response.sendFile(path.join(FRONTEND_PATH, 'game-choosing.html')));
router.get('/game', auth.checkGameSessionPage, (request, response) => response.sendFile(path.join(FRONTEND_PATH, 'game-page.html')));

// pályaszerkesztő
router.get('/game-maps/:gameMapId/edit', auth.checkAuthPage, async (request, response, next) => {
    try {
        const gameMapId = await idSchema(ERRORS.GAMEMAP.INVALID_ID).validateAsync(
            request.params.gameMapId, { abortEarly: true, stripUnknown: true, convert: true }
        );
        await assertUserOwnsGameMap(request.session.userid, gameMapId);
        response.sendFile(path.join(FRONTEND_PATH, 'map-creator.html'));
    } catch (error) {
        next(error.isJoi ? new AppError(error.details[0].message, 400) : error);
    }
});

// pálya oldal
router.get('/game-maps/:gameMapId', auth.checkAuthPage, async (request, response, next) => {
    try {
        await idSchema(ERRORS.GAMEMAP.INVALID_ID).validateAsync(request.params.gameMapId, {
            abortEarly: true, stripUnknown: true, convert: true
        });

        const gameMapExists = await doesGameMapExist(request.params.gameMapId);
        if (!gameMapExists) throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);

        response.sendFile(path.join(FRONTEND_PATH, 'game-map.html'));
    } catch (error) {
        next(error.isJoi ? new AppError(error.details[0].message, 400) : error);
    }
});

module.exports = router;
