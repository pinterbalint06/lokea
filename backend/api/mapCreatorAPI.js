const express = require("express");
const router = express.Router();
const database = require("../sql/database.js");
const fs = require("fs/promises");
const crypto = require("crypto");

//!Multer
const multer = require("multer"); //?npm install multer
const path = require("path");

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, "../temp"));
    },
    filename: (request, file, callback) => {
        let uuid = crypto.randomBytes(16).toString("hex");
        let extension = path.extname(file.originalname).toLowerCase();

        callback(null, uuid + extension);
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

const upload = multer({ storage });

//TESZT
function isAllowed(request) {
    return true;
}

const checkAuth = (request, response, next) => {
    if (isAllowed(request)) {
        next();
    } else {
        response.status(401).json({
            success: false,
            error: "Unauthorized upload"
        });
    }
};
let currPointID = 0;

//!Endpoints:
//?POST /api/map_creator/saveMap
router.post("/saveMap", (request, response) => {
    response.status(200).json({
        success: true
    });
});
//?POST /api/map_creator/savePoint
router.post("/savePoint", async (request, response) => {
    try {
        // from session
        const userId = "32";

        // from session or param?
        const gameMapId = "0";
        const mapId = "1";
        console.log(request.body);
        let { xCoordinate, yCoordinate, tempFilename } = request.body;
        let baseFilename = path.basename(tempFilename);

        let tempPath = path.join(__dirname, "..", "temp", baseFilename);
        let mapDirectory = path.join(__dirname, "..", "..", "private", userId, gameMapId, mapId);
        let targetPath = path.join(mapDirectory, baseFilename);

        try {
            await fs.access(tempPath);
        } catch (err) {
            const error = new Error("Temporary file not found or invalid.");
            error.statusCode = 400;
            throw error;
        }

        await fs.mkdir(mapDirectory, { recursive: true });

        await fs.rename(tempPath, targetPath);

        // TODO: if succesful til here save to database too

        currPointID++;
        await new Promise(r => setTimeout(r, 2000));
        response.status(200).json({
            success: true,
            pointId: currPointID
        });
    } catch (error) {
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
//?POST /api/map_creator/uploadEquirectangularImage
router.post("/uploadEquirectangularImage", checkAuth, upload.single("uploadedFile"), async (request, response) => {
    try {
        if (!request.file) {
            const error = new Error("No file provided");
            error.statusCode = 400;
            throw error;
        }
        await new Promise(r => setTimeout(r, 2000));
        response.status(200).json({
            success: true,
            tempFilename: request.file.filename
        });
    } catch (error) {
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

//?GET /api/map_creator/testImage
router.get("/testImage", async (request, response) => {
    try {
        let options = {
            root: path.join(__dirname, "..", "..", "private", "equirectangular")
        };

        let fileName = "Cathedral.webp";
        response.sendFile(fileName, options, function (err) {
            if (err) {
                console.error("Error sending file:", err);
            } else {
                console.log("Sent:", fileName);
            }
        });
    } catch (error) {
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
