const express = require("express");
const router = express.Router();
const multer = require("multer");
const { deleteFile } = require("#utils/file-utils.js");
const AppError = require("#utils/app-error.js");
const { checkAuth } = require("#utils/auth.js");
const ERRORS = require("#utils/error-messages.js");

const mapsEndpoints = require("#mapcreator/maps/maps.routes.js");
const pointsEndpoints = require("#mapcreator/points/points.routes.js");
const connectionsEndpoints = require("#mapcreator/connections/connections.routes.js");

router.use("/", checkAuth, mapsEndpoints);
router.use("/", checkAuth, pointsEndpoints);
router.use("/", checkAuth, connectionsEndpoints);

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

    response.status(statusCode).json({
        error: errorMessage
    });
});

module.exports = router;
