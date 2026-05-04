const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateRequest } = require("#middlewares/validation.js");
const { upload } = require("#config/mapdatas-upload-config.js");
const schemas = require("#gamemaps/cover-image/cover-image.schemas.js");
const controller = require("#gamemaps/cover-image/cover-image.controller.js");
const { checkAuth } = require("#middlewares/auth.js");

//?GET /api/game-maps/:gameMapID/cover-image
router.get(
    "/",
    validateRequest(schemas.getGameMapCoverImageSchema),
    controller.getGameMapCoverImage
);

//?PUT /api/game-maps/:gameMapID/cover-image
router.put(
    "/",
    checkAuth,
    upload.single("coverImage"),
    validateRequest(schemas.gameMapIDParamSchema),
    controller.updateGameMapCoverImage
);

//?DELETE /api/game-maps/:gameMapID/cover-image
router.delete(
    "/",
    checkAuth,
    validateRequest(schemas.gameMapIDParamSchema),
    controller.deleteGameMapCoverImage
);

module.exports = router;
