const express = require("express");
const router = express.Router();
const { validateRequest } = require("#utils/validation.js");
const { checkAuth } = require("#root/auth.js");
const AppError = require("#utils/AppError.js");
const schemas = require("#gamemaps/gamemaps.schemas.js");
const controller = require("#gamemaps/gamemaps.controller.js");
const { isAllowedToGetMapImage, isAllowedToAccessPoint } = require("#gamemaps/gamemaps.middleware.js");
const ERRORS = require("#utils/errorMessages.js");

router.use(checkAuth);

//!Endpoints:
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
    controller.getMapImage);

//?GET /api/game-maps/points/:pointID/connections
router.get(
    "/points/:pointID/connections",
    validateRequest(schemas.getPointConnectionsSchema),
    isAllowedToAccessPoint,
    controller.getPointConnections);

router.use(async (error, request, response, next) => {
    let statusCode = 500;
    let errorMessage = ERRORS.COMMON.UNEXPECTED_ERROR;

    if (error instanceof AppError) {
        statusCode = error.statusCode;
        errorMessage = error.message;
    } else {
        console.error("Unexpected error in map creator endpoints:", error);
    }

    if (!response.headersSent) {
        response.status(statusCode).json({
            error: errorMessage
        });
    }
});

module.exports = router;
