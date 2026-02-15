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
            error: "Jogosulatlan feltöltés"
        });
    }
};
let currPointID = 0;
let currMapID = 0;

//!Endpoints:
//?POST /api/map_creator/savePoint
router.post("/savePoint", async (request, response) => {
    try {
        // console.log(request.session.userid);
        // const userId = request.session.userid;
        // if (userId == undefined) {
        //     const error = new Error("Nincs bejelentkezve!");
        //     error.statusCode = 400;
        //     throw error;
        // }

        // login doesn't work on this branch yet
        const userId = 1;

        const gameMapID = Number(request.body.gameMapID);
        if (!Number.isInteger(gameMapID)) {
            const error = new Error("Helytelen pálya ID!");
            error.statusCode = 400;
            throw error;
        }
        const mapID = Number(request.body.mapID);
        if (!Number.isInteger(mapID)) {
            const error = new Error("Helytelen térkép ID!");
            error.statusCode = 400;
            throw error;
        }
        const xCoordinate = Number(request.body.x);
        const yCoordinate = Number(request.body.y);
        if (!Number.isFinite(xCoordinate) || !Number.isFinite(yCoordinate)) {
            const error = new Error("Helytelen koordináták!");
            error.statusCode = 400;
            throw error;
        }
        const tempFilename = request.body.tempFilename;
        if (tempFilename == undefined) {
            const error = new Error("Nem adta meg az átmeneti fájlnevet!");
            error.statusCode = 400;
            throw error;
        }
        let pathInfo = path.parse(tempFilename);

        currPointID++;
        let tempPath = path.join(__dirname, "..", "temp", pathInfo.base);
        // private/userId/gameMapId/mapId/point_images/
        let mapDirectory = path.join(__dirname, "..", "..", "private", userId.toString(), gameMapID.toString(), mapID.toString(), "point_images", pathInfo.name);
        let targetPath = path.join(mapDirectory, currPointID.toString() + pathInfo.ext);

        try {
            await fs.access(tempPath);
        } catch (err) {
            const error = new Error("Átmeneti fájl nem létezik vagy helytelen");
            error.statusCode = 400;
            throw error;
        }

        await fs.mkdir(mapDirectory, { recursive: true });

        await fs.rename(tempPath, targetPath);

        // TODO: create low resolution version of the image
        // TODO: if succesful til here save to database too

        await new Promise(r => setTimeout(r, 2000));
        response.status(200).json({
            success: true,
            pointId: currPointID
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
//?POST /api/map_creator/uploadEquirectangularImage
router.post("/uploadEquirectangularImage", checkAuth, upload.single("uploadedFile"), async (request, response) => {
    try {
        if (!request.file) {
            const error = new Error("Nem adott meg fájlt!");
            error.statusCode = 400;
            throw error;
        }
        await new Promise(r => setTimeout(r, 2000));
        response.status(200).json({
            success: true,
            tempFilename: request.file.filename
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

//?POST /api/map_creator/uploadMapImage
router.post("/uploadMapImage", checkAuth, upload.single("uploadedMap"), async (request, response) => {
    try {
        if (!request.file) {
            const error = new Error("Nem adott meg fájlt!");
            error.statusCode = 400;
            throw error;
        }

        await new Promise(r => setTimeout(r, 1000));

        response.status(200).json({
            success: true,
            tempFilename: request.file.filename
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

//?POST /api/map_creator/saveNewMap
router.post("/saveNewMap", async (request, response) => {
    try {
        // console.log(request.session.userid);
        // const userId = request.session.userid;
        // if (userId == undefined) {
        //     const error = new Error("Nincs bejelentkezve!");
        //     error.statusCode = 400;
        //     throw error;
        // }

        // login doesn't work on this branch yet
        const userId = 1;
        const gameMapID = Number(request.body.gameMapID);
        if (!Number.isInteger(gameMapID)) {
            const error = new Error("Helytelen pálya ID!");
            error.statusCode = 400;
            throw error;
        }
        const tempFilename = request.body.tempFilename;
        if (tempFilename == undefined) {
            const error = new Error("Nem adta meg az átmeneti fájlnevet!");
            error.statusCode = 400;
            throw error;
        }
        let pathInfo = path.parse(tempFilename);

        currMapID++;
        let tempPath = path.join(__dirname, "..", "temp", pathInfo.base);
        // private/userId/gameMapId/mapId/
        let mapDirectory = path.join(__dirname, "..", "..", "private", userId.toString(), gameMapID.toString(), currMapID.toString());
        // TODO: create low res version
        let targetPath = path.join(mapDirectory, currMapID.toString() + pathInfo.ext);

        try {
            await fs.access(tempPath);
        } catch (err) {
            const error = new Error("Átmeneti fájl nem létezik vagy helytelen");
            error.statusCode = 400;
            throw error;
        }

        await fs.mkdir(mapDirectory, { recursive: true });

        await fs.rename(tempPath, targetPath);

        await new Promise(r => setTimeout(r, 1000));

        response.status(200).json({
            success: true,
            mapId: currMapID,
            message: "Térkép sikeresen mentve!"
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

//?GET /api/map_creator/testImage
router.get("/testImage", async (request, response) => {
    try {
        let options = {
            root: path.join(__dirname, "..", "..", "private", "equirectangular")
        };

        let fileName = "Cathedral.webp";
        response.sendFile(fileName, options, function (err) {
            if (err) {
                return response.status(404).json({
                    success: false,
                    error: "A fájl nem létezik vagy helytelen"
                });
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
