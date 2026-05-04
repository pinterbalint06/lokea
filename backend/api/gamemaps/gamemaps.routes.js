const express = require("express");
const router = express.Router();
const multer = require("multer");
const { validateRequest } = require("#middlewares/validation.js");
const { checkAuth } = require("#middlewares/auth.js");
const AppError = require("#utils/app-error.js");
const ERRORS = require("#utils/error-messages.js");
const { deleteFile } = require("#utils/file-utils.js");
const gamemapRoutes = require("#gamemaps/gamemap/gamemap.routes.js");
const imagesRoutes = require("#gamemaps/images/images.routes.js");
const pathsRoutes = require("#gamemaps/paths/paths.routes.js");
const commentsRoutes = require("#gamemaps/comments/comments.routes.js");
const coverImageRoutes = require("#gamemaps/cover-image/cover-image.routes.js");
const favoriteRoutes = require("#gamemaps/favorite/favorite.routes.js");
const schemas = require("#gamemaps/shared/schemas/gamemaps.schemas.js");

router.use(
    "/:gameMapID/cover-image",
    validateRequest(schemas.gameMapIDParamsOnlySchema),
    coverImageRoutes
);

router.use(checkAuth);

router.use("/", imagesRoutes);

router.use("/", pathsRoutes);

router.use(
    "/:gameMapID",
    validateRequest(schemas.gameMapIDParamsOnlySchema),
    favoriteRoutes
);

router.use(
    "/:gameMapID",
    validateRequest(schemas.gameMapIDParamsOnlySchema),
    commentsRoutes
);

router.use(
    "/",
    gamemapRoutes
);

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
            error: request.t(errorMessage)
        });
    }
});

module.exports = router;
