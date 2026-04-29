const express = require("express");
const router = express.Router();
const { validateRequest } = require("#utils/validation.js");
const schemas = require("#gamemaps/connections/connections.schemas.js");
const controller = require("#gamemaps/connections/connections.controller.js");
const { isAllowedToAccessPoint } = require("#gamemaps/shared/middlewares/gamemaps.middleware.js");

//?GET /api/game-maps/points/:pointID/connections
router.get(
    "/points/:pointID/connections",
    validateRequest(schemas.getPointConnectionsSchema),
    isAllowedToAccessPoint,
    controller.getPointConnections
);

module.exports = router;
