const express = require("express");
const router = express.Router();
const connectionsController = require("./connections.controller.js");
const schemas = require("./connections.schemas.js");
const { checkAuth } = require("../../../auth.js");
const { validateRequest } = require("../shared/middlewares/validation.js");
const upload = require("../shared/middlewares/uploadConfig.js");

//!Endpoints:
//?GET /api/map-creator/game-maps/:gameMapID/connections
router.get(
    "/game-maps/:gameMapID/connections",
    checkAuth,
    validateRequest(schemas.getConnectionsSchema),
    connectionsController.getConnections
);

//?PUT /api/map-creator/connections/:connectionID
router.put(
    "/connections/:connectionID",
    checkAuth,
    upload.none(),
    validateRequest(schemas.updateConnectionSchema),
    connectionsController.updateConnection
);

//?POST /api/map-creator/game-maps/:gameMapID/connections
router.post(
    "/game-maps/:gameMapID/connections",
    checkAuth,
    upload.none(),
    validateRequest(schemas.createConnectionSchema),
    connectionsController.createConnection
);

//?DELETE /api/map-creator/connections/:connectionID
router.delete(
    "/connections/:connectionID",
    checkAuth,
    validateRequest(schemas.deleteConnectionSchema),
    connectionsController.deleteConnection
);

module.exports = router;
