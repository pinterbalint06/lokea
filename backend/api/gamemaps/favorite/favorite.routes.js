const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateRequest } = require("#utils/validation.js");
const schemas = require("#gamemaps/favorite/favorite.schemas.js");
const controller = require("#gamemaps/favorite/favorite.controller.js");

//?GET /api/game-maps/:gameMapID/favorite
router.get(
    "/favorite",
    validateRequest(schemas.favoriteSchema),
    controller.getFavoriteStatus
);

//?POST /api/game-maps/:gameMapID/favorite
router.post(
    "/favorite",
    validateRequest(schemas.favoriteSchema),
    controller.addFavorite
);

//?DELETE /api/game-maps/:gameMapID/favorite
router.delete(
    "/favorite",
    validateRequest(schemas.favoriteSchema),
    controller.removeFavorite
);

module.exports = router;
