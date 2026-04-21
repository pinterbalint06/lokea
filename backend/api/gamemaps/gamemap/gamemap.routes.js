const express = require("express");
const router = express.Router({ mergeParams: true });
const { upload } = require("#config/mapdatas-upload-config.js");
const { validateRequest } = require("#utils/validation.js");
const schemas = require("#gamemaps/gamemap/gamemap.schemas.js");
const controller = require("#gamemaps/gamemap/gamemap.controller.js");

//?GET /api/game-maps/:gameMapID
router.get(
    "/",
    validateRequest(schemas.getGameMapDetailsSchema),
    controller.getGameMapDetails
);

//?PUT /api/game-maps/:gameMapID
router.put(
    "/",
    upload.none(),
    validateRequest(schemas.updateGameMapSchema),
    controller.updateGameMap
);

//?DELETE /api/game-maps/:gameMapID
router.delete(
    "/",
    validateRequest(schemas.deleteGameMapSchema),
    controller.deleteGameMap
);

module.exports = router;
