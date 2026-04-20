const express = require("express");
const router = express.Router();
const multer = require("multer");
const { validateRequest } = require("#utils/validation.js");
const { checkAuth } = require("#root/auth.js");
const AppError = require("#utils/AppError.js");
const schemas = require("#gamemaps/gamemaps.schemas.js");
const controller = require("#gamemaps/gamemaps.controller.js");
const { isAllowedToGetMapImage, isAllowedToAccessPoint } = require("#gamemaps/gamemaps.middleware.js");
const ERRORS = require("#utils/errorMessages.js");
const upload = require("#mapcreator/shared/middlewares/uploadConfig.js"); // TODO: egyenlore a mapcreator uploadja van hasznalva van mert jo ide is lehet azt ki kene szervezni
const { deleteFile } = require("#utils/fileUtils.js");

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

//?GET /api/game-maps/:gameMapID
router.get(
    "/:gameMapID",
    validateRequest(schemas.getGameMapDetailsSchema),
    controller.getGameMapDetails);

//?GET /api/game-maps/:gameMapID/cover-image
router.get(
    "/:gameMapID/cover-image",
    validateRequest(schemas.getGameMapCoverImageSchema),
    controller.getGameMapCoverImage);

//?PUT /api/game-maps/:gameMapID/cover-image
router.put(
    "/:gameMapID/cover-image",
    upload.single("coverImage"),
    validateRequest(schemas.putGameMapCoverImageSchema),
    controller.updateGameMapCoverImage);

//?DELETE /api/game-maps/:gameMapID/cover-image
router.delete(
    "/:gameMapID/cover-image",
    validateRequest(schemas.deleteGameMapCoverImageSchema),
    controller.deleteGameMapCoverImage);

//?PUT /api/game-maps/:gameMapID
router.put(
    "/:gameMapID",
    upload.none(),
    validateRequest(schemas.updateGameMapSchema),
    controller.updateGameMap);

//?GET /api/game-maps/:gameMapID/comments
router.get(
    "/:gameMapID/comments",
    validateRequest(schemas.getGameMapCommentsSchema),
    controller.getGameMapComments);

//?POST /api/game-maps/:gameMapID/comments
router.post(
    "/:gameMapID/comments",
    upload.none(),
    validateRequest(schemas.postGameMapCommentsSchema),
    controller.postGameMapComments);

router.use(async (error, request, response, next) => {
    let statusCode = 500;
    let errorMessage = ERRORS.COMMON.UNEXPECTED_ERROR;

    if (error instanceof multer.MulterError) {
        if (request.file && request.file.path) {
            try {
                await deleteFile(request.file.path);
            } catch (deleteErr) {
                console.error("Error deleting temporary uploaded file:", deleteErr);
            }
        }

        if (error.code == "LIMIT_FILE_SIZE") {
            statusCode = 413;
            errorMessage = ERRORS.COMMON.FILE_TOO_LARGE;
        } else {
            statusCode = 400;
            errorMessage = ERRORS.COMMON.FILE_UPLOAD_ERROR;
        }
    } else {
        if (error instanceof AppError) {
            statusCode = error.statusCode;
            errorMessage = error.message;
        } else {
            console.error("Unexpected error in map creator endpoints:", error);
        }
    }

    if (!response.headersSent) {
        response.status(statusCode).json({
            error: errorMessage
        });
    }
});

module.exports = router;
