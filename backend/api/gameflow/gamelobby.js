const express = require("express");
const router = express.Router();
const { getGameMaps, getImagePath } = require("#gameflow/gamelobby.queries.js");
const AppError = require("#utils/app-error.js");
const path = require("path");
const sessionsRoutes = require("./sessions/sessions.routes.js");

const UPLOADS_DIR = path.join(__dirname, "../../uploads/mapdatas");

const FALLBACK_COVER_IMAGE = "/assets/not_found.webp";

router.get("/", async (request, response) => {
    try {
        const sort = String(request.query.sort || "created").toLowerCase();
        let offset = 0;
        if (request.query.offset !== undefined) {
            offset = Number(request.query.offset);
            if (!Number.isInteger(offset) || offset < 0) {
                throw new AppError("Érvénytelen offset. Pozitív egész számnak kell lennie.", 400);
            }
        }

        const validSorts = ["created", "rating", "plays", "favorites"];
        if (!validSorts.includes(sort)) {
            throw new AppError("Érvénytelen rendezés. Használható: created, rating, plays, favorites", 400);
        }

        const userId = request.session?.userid;
        const palyak = await getGameMaps(sort, userId, offset);
        response.status(200).json({ results: palyak });
    } catch (error) {
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ message: error.message });
        } else {
            response.status(500).json({ message: "Error fetching game maps" });
        }
    }
});

router.get("/cover-images/:cover_image_id", async (request, response) => {
    //TODO: képek visszadásának átdolgozása majd a lowhighres szerint
    try {
        let filePath = FALLBACK_COVER_IMAGE;
        if (request.params.cover_image_id) {
            const dbPath = await getImagePath(request.params.cover_image_id);
            if (dbPath) filePath = dbPath;
        }
        response.sendFile(path.join(UPLOADS_DIR, filePath));
    } catch (error) {
        response.status(500).json({ message: "Error fetching cover image" });
    }
});

router.use("/", sessionsRoutes);

module.exports = router;
