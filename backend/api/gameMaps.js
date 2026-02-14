const express = require("express");
const router = express.Router();

const path = require("path");

// TESZT
function isAllowedToGetImage(request, imageId) {
    return true;
}

//?GET /api/game_maps/getImageByPointId
router.get("/getImageByPointId", async (request, response) => {
    try {
        if (!request.query.pointId && request.query.pointId.trim() != "") {
            const error = new Error("Nem adott pont ID-t");
            error.statusCode = 400;
            throw error;
        }
        let pointId = Number(request.query.pointId);
        if (!Number.isInteger(pointId)) {
            const error = new Error("Helytelen pont ID");
            error.statusCode = 400;
            throw error;
        }
        if (!isAllowedToGetImage(request, pointId)) {
            const error = new Error("Nincs hozzáférése ehhez a ponthoz");
            error.statusCode = 403;
            throw error;
        }

        //TODO: get the image path from the db
        let imagePath = "equirectangular/Cathedral.webp"

        let options = {
            root: path.join(__dirname, "..", "..", "private")
        };
        response.set('Access-Control-Expose-Headers', 'imageWidth, imageHeight');
        response.set("imageWidth", 1920);
        response.set("imageHeight", 960);
        await new Promise(r => setTimeout(r, 2000));
        response.sendFile(imagePath, options, function (err) {
            if (err) {
                if (!response.headersSent) {
                    return response.status(404).json({
                        success: false,
                        error: "A fájl nem létezik vagy helytelen"
                    });
                }
            }
        });
    } catch (error) {
        let message, statusCode;
        if (error.statusCode) {
            message = error.message;
            statusCode = error.statusCode;
        } else {
            console.error(error);
            message = "Váratlan hiba történt!";
            statusCode = 500;
        }
        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
});


module.exports = router;
