const express = require("express");
const router = express.Router();
const database = require("../sql/database.js");
const fs = require("fs/promises");

const path = require('path');

function getMimeTypeFromPath(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    let result = "application/octet-stream";
    if (extension === ".jpg" || extension === ".jpeg") {
        result = "image/jpeg";
    }
    if (extension === ".png") {
        result = "image/png";
    }
    if (extension === ".gif") {
        result = "image/gif";
    }
    if (extension === ".webp") {
        result = "image/webp";
    }
    return result;
}

function resolvePathInsideUploadRoot(filePath) {
    const rootPath = path.resolve('./uploads');
    const fullPath = path.resolve(rootPath, filePath);
    if (!fullPath.startsWith(rootPath)) {
        const error = new Error("Invalid image path");
        error.statusCode = 400;
        throw error;
    }
    return fullPath;
}


//ENDPOINTS

router.get("/get_random_point", async (request, response) => {
    const sessionId = request.session?.activeSessionId || 1; //TODO: törlés amikor login kész lesz
    try {
        let point = await database.getRandomPoint(sessionId);
        if (!point) {
            await database.incrementCycle(sessionId);
            point = await database.getRandomPoint(sessionId);
        }
        const imageFullPath = resolvePathInsideUploadRoot(point.filepath);
        const imageBuffer = await fs.readFile(imageFullPath);
        const mimeType = getMimeTypeFromPath(point.filepath);

        point = {
            point_id: point.point_id,
            north_direction: point.north_direction,
            image: {
                id: point.image_id,
                mime_type: mimeType,
                base64: imageBuffer.toString("base64"),
                width: point.width,
                height: point.height
            }
        };
        response.status(200).json({ success: true, point: point });
    } catch (error) {
        console.error("Error fetching random point:", error);
        response.status(500).json({ success: false, message: "Error fetching random point" });
    }
});

router.get("/get_all_maps", async (request, response) => {
    const sessionId = request.session?.activeSessionId || 1; //TODO: törlés amikor login kész lesz
    try {
        const maps = await database.getAllMaps(sessionId);

        let mapObjects = [];

        for (const map of maps) {
            const imageFullPath = resolvePathInsideUploadRoot(map.filepath);
            const imageBuffer = await fs.readFile(imageFullPath);
            const mimeType = getMimeTypeFromPath(map.filepath);

            mapObjects.push({
                map_id: map.map_id,
                title: map.title,
                image: {
                    id: map.image_id,
                    mime_type: mimeType,
                    base64: imageBuffer.toString("base64"),
                    width: map.width,
                    height: map.height
                }
            });
        }

        response.status(200).json({ success: true, maps: mapObjects });
    } catch (error) {
        console.error("Error fetching all maps:", error);
        response.status(500).json({ success: false, message: "Error fetching all maps" });
    }
});

module.exports = router;