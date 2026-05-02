const express = require("express");
const router = express.Router();
const connectionsController = require("#mapcreator/connections/connections.controller.js");
const schemas = require("#mapcreator/connections/connections.schemas.js");
const { validateRequest } = require("#utils/validation.js");
const { upload } = require("#config/mapdatas-upload-config.js");

//!Endpoints:
//?GET /api/map-creator/game-maps/:gameMapID/connections
router.get(
    "/game-maps/:gameMapID/connections",
    validateRequest(schemas.getConnectionsSchema),
    connectionsController.getConnections
);

//?PUT /api/map-creator/connections/:connectionID
router.put(
    "/connections/:connectionID",
    upload.none(),
    validateRequest(schemas.updateConnectionSchema),
    connectionsController.updateConnection
);

//?POST /api/map-creator/game-maps/:gameMapID/connections
router.post(
    "/game-maps/:gameMapID/connections",
    upload.none(),
    validateRequest(schemas.createConnectionSchema),
    connectionsController.createConnection
);

//?DELETE /api/map-creator/connections/:connectionID
router.delete(
    "/connections/:connectionID",
    validateRequest(schemas.deleteConnectionSchema),
    connectionsController.deleteConnection
);

module.exports = router;
