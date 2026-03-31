const express = require("express");
const router = express.Router();
const pointsController = require("#mapcreator/points/points.controller.js");
const schemas = require("#mapcreator/points/points.schemas.js");
const { validateRequest } = require("#utils/validation.js");
const upload = require("#mapcreator/shared/middlewares/uploadConfig.js");

// !Endpoints:
// ?GET /api/map-creator/maps/:mapID/points
router.get(
    "/maps/:mapID/points",
    validateRequest(schemas.getPointsSchema),
    pointsController.getPoints
);

//?PUT /api/map-creator/points/:pointID
router.put(
    "/points/:pointID",
    upload.single("equirectangularImage"),
    validateRequest(schemas.updatePointSchema),
    pointsController.updatePoint
);

// ?POST /api/map-creator/maps/:mapID/points
router.post(
    "/maps/:mapID/points",
    upload.single("equirectangularImage"),
    validateRequest(schemas.createPointSchema),
    pointsController.createPoint
);

//?DELETE /api/map-creator/points/:pointID
router.delete(
    "/points/:pointID",
    validateRequest(schemas.deletePointSchema),
    pointsController.deletePoint
);

module.exports = router;