const express = require("express");
const router = express.Router();
const mapsController = require("./maps.controller.js");
const schemas = require("./maps.schemas.js");
const { validateRequest } = require('../../../utils/validation.js');
const upload = require("../shared/middlewares/uploadConfig.js");


// !Endpoints:
//?GET /api/map-creator/game-maps/:gameMapID/maps
router.get(
    "/game-maps/:gameMapID/maps",
    validateRequest(schemas.getMapsSchema),
    mapsController.getMaps
);

//?PUT /api/map-creator/maps/:mapID
router.put(
    "/maps/:mapID",
    upload.none(),
    validateRequest(schemas.updateMapSchema),
    mapsController.updateMap
);

//?POST /api/map-creator/game-maps/:gameMapID/maps
router.post(
    "/game-maps/:gameMapID/maps",
    upload.single("mapImage"),
    validateRequest(schemas.createMapSchema),
    mapsController.createMap
);

//?DELETE /api/map-creator/maps/:mapID
router.delete(
    "/maps/:mapID",
    validateRequest(schemas.deleteMapSchema),
    mapsController.deleteMap
);

module.exports = router;