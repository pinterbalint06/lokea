const express = require("express");
const router = express.Router();
const pointsController = require("./points.controller.js");
const schemas = require("./points.schemas.js");
const { checkAuth } = require("../../../auth.js");
const { validateRequest } = require("../shared/middlewares/validation.js");
const upload = require("../shared/middlewares/uploadConfig.js");

// !Endpoints:
// ?GET /api/map-creator/maps/:mapID/points
router.get(
    "/maps/:mapID/points",
    checkAuth,
    validateRequest(schemas.getPointsSchema),
    pointsController.getPoints
);

//?PUT /api/map-creator/points/:pointID
router.put(
    "/points/:pointID",
    checkAuth,
    upload.single("equirectangularImage"),
    validateRequest(schemas.updatePointSchema),
    pointsController.updatePoint
);

// ?POST /api/map-creator/maps/:mapID/points
router.post(
    "/maps/:mapID/points",
    checkAuth,
    upload.single("equirectangularImage"),
    validateRequest(schemas.createPointSchema),
    pointsController.createPoint
);

//?DELETE /api/map-creator/points/:pointID
router.delete(
    "/points/:pointID",
    checkAuth,
    validateRequest(schemas.deletePointSchema),
    pointsController.deletePoint
);

module.exports = router;