const express = require("express");
const router = express.Router();
const { validateRequest } = require("#middlewares/validation.js");
const schemas = require("#gamemaps/images/images.schemas.js");
const controller = require("#gamemaps/images/images.controller.js");
const { isAllowedToGetMapImage, isAllowedToAccessPoint } = require("#gamemaps/shared/middlewares/gamemaps.middleware.js");

//?GET /api/game-maps/points/:pointID/image
router.get(
    "/points/:pointID/image",
    validateRequest(schemas.getPointImageSchema),
    isAllowedToAccessPoint,
    controller.getPointImage
);

//?GET /api/game-maps/maps/:mapID/image
router.get(
    "/maps/:mapID/image",
    validateRequest(schemas.getMapImageSchema),
    isAllowedToGetMapImage,
    controller.getMapImage
);

module.exports = router;
