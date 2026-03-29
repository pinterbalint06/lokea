const express = require("express");
const router = express.Router();
const multer = require("multer");
const { deleteFile } = require("../../utils/fileUtils.js");
const AppError = require("../../utils/AppError.js");

const mapsEndpoints = require("./maps/maps.routes.js");
const pointsEndpoints = require("./points/points.routes.js");
const connectionsEndpoints = require("./connections/connections.route.js");

router.use("/", mapsEndpoints);
router.use("/", pointsEndpoints);
router.use("/", connectionsEndpoints);

router.use(async (error, request, response, next) => {
    let statusCode = 500;
    let errorMessage = "Váratlan hiba történt!";

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
            errorMessage = "Túl nagy fájlméret! (Max 10MB)";
        } else {
            statusCode = 400;
            errorMessage = "Fájlfeltöltési hiba történt!";
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
