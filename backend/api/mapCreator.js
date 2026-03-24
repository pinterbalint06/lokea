const express = require("express");
const router = express.Router();
const multer = require("multer");
const { deleteFile } = require("../utils/fileUtils.js");

const mapsEndpoints = require("./mapcreator/maps");
const pointsEndpoints = require("./mapcreator/points");
const connectionsEndpoints = require("./mapcreator/connections");

router.use("/", mapsEndpoints);
router.use("/", pointsEndpoints);
router.use("/", connectionsEndpoints);

router.use(async (error, request, response, next) => {
    if (error instanceof multer.MulterError) {
        if (request.file && request.file.path) {
            try {
                await deleteFile(file.path);
            } catch (deleteErr) {
                console.error("Error deleting temporary uploaded file:", deleteErr);
            }
        }
        if (error.code == "LIMIT_FILE_SIZE") {
            return response.status(413).json({
                success: false,
                error: "Túl nagy fájlméret! (Max 10MB)"
            });
        }
        return response.status(400).json({
            success: false,
            error: "Fájlfeltöltési hiba történt!"
        });
    }
    next(error);
});

module.exports = router;
