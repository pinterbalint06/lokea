const express = require("express");
const router = express.Router();
const { validateRequest } = require("#middlewares/validation.js");
const schemas = require("#gamemaps/paths/paths.schemas.js");
const controller = require("#gamemaps/paths/paths.controller.js");
const { isAllowedToAccessPoint } = require("#gamemaps/shared/middlewares/gamemaps.middleware.js");

//?GET /api/game-maps/points/:pointID/paths
router.get(
    "/points/:pointID/paths",
    validateRequest(schemas.getPointPathsSchema),
    isAllowedToAccessPoint,
    controller.getPointPaths
);

module.exports = router;
