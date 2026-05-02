const express = require("express");
const router = express.Router();
const { upload } = require("#config/mapdatas-upload-config.js");
const { validateRequest } = require("#utils/validation.js");
const schemas = require("#gamemaps/gamemap/gamemap.schemas.js");
const controller = require("#gamemaps/gamemap/gamemap.controller.js");

//?GET /api/game-maps/:gameMapID
router.get(
    "/:gameMapID",
    validateRequest(schemas.getGameMapDetailsSchema),
    controller.getGameMapDetails
);

//?PUT /api/game-maps/:gameMapID
router.put(
    "/:gameMapID",
    upload.none(),
    validateRequest(schemas.updateGameMapSchema),
    controller.updateGameMap
);

//?POST /api/game-maps
router.post(
    "/",
    controller.createGameMap
);

//?DELETE /api/game-maps/:gameMapID
router.delete(
    "/:gameMapID",
    validateRequest(schemas.deleteGameMapSchema),
    controller.deleteGameMap
);

module.exports = router;
