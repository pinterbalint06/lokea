const express = require("express");
const router = express.Router();
const database = require("../../sql/database.js");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { checkAuth } = require("../../auth.js");
const { UPLOAD_ROOT } = require("../../config/mapStorage.js");
const { processImageMetadata, createWebpAndLowRes, deleteImageAndLowResByMainPath } = require("../../utils/imageProcessor.js");
const { deleteFile } = require("../../utils/fileUtils.js");

const { validateId, handleError, assertUserOwnsMap, assertUserOwnsPoint, requireBody } = require("./utils.js");
const upload = require("./uploadConfig.js");

//!Endpoints:
//?GET /api/map-creator/maps/:mapID/points
router.get("/maps/:mapID/points", checkAuth, async (request, response) => {
    try {
        const userId = request.session.userid;
        const mapID = validateId(request.params.mapID, "térkép ID");

        await assertUserOwnsMap(userId, mapID);

        let point_data = await database.getPointsOnMap(mapID);

        response.status(200).json({
            success: true,
            points: point_data
        });
    } catch (error) {
        let statusCode = error.statusCode ? error.statusCode : 500;
        let message = error.statusCode ? error.message : "Váratlan hiba történt!";
        if (statusCode == 500) {
            console.error(error);
        }

        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
});

//?PUT /api/map-creator/points/:pointID
router.put("/points/:pointID", checkAuth, upload.single("equirectangularImage"), requireBody, async (request, response) => {
    let dbConnection;
    let processedImagePaths = null;

    try {
        const userId = request.session.userid;

        const pointID = validateId(request.params.pointID, "pont ID");

        const uCoordinate = Number(request.body.u);
        const vCoordinate = Number(request.body.v);
        if (!Number.isFinite(uCoordinate) || !Number.isFinite(vCoordinate) || uCoordinate < 0 || uCoordinate >= 1 || vCoordinate < 0 || vCoordinate >= 1) {
            const error = new Error("Helytelen koordináták!");
            error.statusCode = 400;
            throw error;
        }

        const northDirection = Number(request.body.northDirection);
        if (!Number.isFinite(northDirection) || northDirection >= 360 || northDirection < 0) {
            const error = new Error("Helytelen északirány!");
            error.statusCode = 400;
            throw error;
        }

        await assertUserOwnsPoint(userId, pointID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let pointInfo = await database.getPointInfo(pointID);
        if (!pointInfo) {
            const error = new Error("A pont nem létezik");
            error.statusCode = 404;
            throw error;
        }

        // only update if anything is different
        if (pointInfo.point_u != uCoordinate || pointInfo.point_v != vCoordinate) {
            let existingPoints = await database.getPointOnMapByCoordinates(dbConnection, pointInfo.map_id, uCoordinate, vCoordinate);
            if (existingPoints.length > 0) {
                const error = new Error("Ezen a térképen már létezik pont ezeken a koordinátákon!");
                error.statusCode = 409;
                throw error;
            }

            let updateSuccess = await database.updatePointCoordinates(dbConnection, pointID, uCoordinate, vCoordinate);
            if (!updateSuccess) {
                let error = new Error("A pont koordinátáinak frissítése nem sikerült");
                error.statusCode = 500;
                throw error;
            }
        }

        // only update if anything is different
        if (pointInfo.north_direction != northDirection) {
            let updateSuccess = await database.updatePointNorthDirection(dbConnection, pointID, northDirection);
            if (!updateSuccess) {
                let error = new Error("A pont északirányának frissítése nem sikerült");
                error.statusCode = 500;
                throw error;
            }
        }

        if (request.file) {
            let oldImageInfo = await database.getPointImage(pointID);

            let imageData;
            try {
                imageData = await processImageMetadata(request.file.path);
            } catch (err) {
                console.error(err);
                const error = new Error("Hiba a kép feldolgozásakor!");
                error.statusCode = 500;
                throw error;
            }
            let newImageId = await database.insertImage(dbConnection, imageData.width, imageData.height, "pending");
            let gameMapID = pointInfo.game_maps_id;
            let mapID = pointInfo.map_id;

            let relativeDestDir = path.join(
                userId.toString(),
                gameMapID.toString(),
                mapID.toString(),
                "point_images",
                pointID.toString()
            );
            let targetPath = path.join(
                UPLOAD_ROOT,
                relativeDestDir
            );
            let baseName = pointID.toString() + "_" + crypto.randomBytes(4).toString("hex");
            processedImagePaths = await createWebpAndLowRes({
                inputFilePath: request.file.path,
                outputDirPath: targetPath,
                baseName: baseName
            });

            let dbPath = path.join(relativeDestDir, processedImagePaths.targetFileName);

            await database.updateImagePath(dbConnection, newImageId, dbPath);

            // update point's image to the new id
            let updateImageSuccess = await database.updatePointImage(dbConnection, pointID, newImageId);
            if (!updateImageSuccess) {
                let error = new Error("A kép útvonalának frissítése nem sikerült");
                error.statusCode = 500;
                throw error;
            }

            if (oldImageInfo) {
                // delete old image from db
                let deleteSuccess = await database.deleteImageById(dbConnection, oldImageInfo.image_id);
                if (!deleteSuccess) {
                    let error = new Error("A régi kép törlése nem sikerült");
                    error.statusCode = 500;
                    throw error;
                }
            }

            await dbConnection.commit();

            if (oldImageInfo && oldImageInfo.filepath) {
                let absoluteOldPath = path.join(UPLOAD_ROOT, oldImageInfo.filepath);
                deleteImageAndLowResByMainPath(absoluteOldPath)
                    .catch(function () {
                        console.error("unsuccessful deletion: " + absoluteOldPath);
                    });
            }

            if (request.file.path) {
                try {
                    await deleteFile(request.file.path);
                } catch (error) {
                    console.error(`Failed to delete temporary file ${request.file.path}: `, error);
                }
            }
        } else {
            await dbConnection.commit();
        }


        response.status(200).json({
            success: true,
            message: "Pont sikeresen frissítve!"
        });

    } catch (error) {
        await handleError(response, error, request.file, dbConnection, processedImagePaths);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?POST /api/map-creator/maps/:mapID/points
router.post("/maps/:mapID/points", checkAuth, upload.single("equirectangularImage"), requireBody, async (request, response) => {
    let dbConnection;
    let processedImagePaths = null;
    try {
        const userId = request.session.userid;

        const mapID = validateId(request.params.mapID, "térkép ID");

        const uCoordinate = Number(request.body.u);
        const vCoordinate = Number(request.body.v);
        if (!Number.isFinite(uCoordinate) || !Number.isFinite(vCoordinate) || uCoordinate < 0 || uCoordinate >= 1 || vCoordinate < 0 || vCoordinate >= 1) {
            const error = new Error("Helytelen koordináták!");
            error.statusCode = 400;
            throw error;
        }

        const northDirection = Number(request.body.northDirection);
        if (!Number.isFinite(northDirection) || northDirection > 359 || northDirection < 0) {
            const error = new Error("Helytelen északirány!");
            error.statusCode = 400;
            throw error;
        }

        if (!request.file) {
            const error = new Error("Nem adott meg képet!");
            error.statusCode = 400;
            throw error;
        }

        await assertUserOwnsMap(userId, mapID);

        const gameMapID = await database.getGameMapIdByMapId(mapID);
        if (!gameMapID) {
            const error = new Error("Váratlan hiba történt!");
            error.statusCode = 500;
            throw error;
        }

        let imageData;
        try {
            imageData = await processImageMetadata(request.file.path);
        } catch (err) {
            console.error(err);
            const error = new Error("Hiba a kép feldolgozásakor!");
            error.statusCode = 500;
            throw error;
        }

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let existingPoints = await database.getPointOnMapByCoordinates(dbConnection, mapID, uCoordinate, vCoordinate);
        if (existingPoints.length > 0) {
            const error = new Error("Ezen a térképen már létezik pont ezeken a koordinátákon!");
            error.statusCode = 409;
            throw error;
        }

        let imageId = await database.insertImage(dbConnection, imageData.width, imageData.height, "pending");

        let newPointId = await database.insertPoint(dbConnection, mapID, uCoordinate, vCoordinate, northDirection, imageId);

        // private/userId/gameMapId/mapId/point_images/pointID/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            mapID.toString(),
            "point_images",
            newPointId.toString()
        );
        let targetPath = path.join(
            UPLOAD_ROOT,
            relativeDestDir
        );
        let baseName = newPointId.toString() + "_" + crypto.randomBytes(4).toString("hex");

        processedImagePaths = await createWebpAndLowRes({
            inputFilePath: request.file.path,
            outputDirPath: targetPath,
            baseName: baseName
        });

        let dbPath = path.join(relativeDestDir, processedImagePaths.targetFileName);

        await database.updateImagePath(dbConnection, imageId, dbPath);

        await dbConnection.commit();

        if (request.file && request.file.path) {
            try {
                await deleteFile(request.file.path);
            } catch (error) {
                console.error(`Failed to delete temporary file ${request.file.path}: `, error);
            }
        }

        response.status(201).json({
            success: true,
            pointId: newPointId
        });
    } catch (error) {
        await handleError(response, error, request.file, dbConnection, processedImagePaths);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?DELETE /api/map-creator/points/:pointID
router.delete("/points/:pointID", checkAuth, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const pointID = validateId(request.params.pointID, "pont ID");

        await assertUserOwnsPoint(userId, pointID);

        let pointInfo = await database.getPointInfo(pointID);
        if (!pointInfo) {
            const error = new Error("A pont nem létezik");
            error.statusCode = 404;
            throw error;
        }

        let oldImageInfo = await database.getPointImage(pointID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        if (oldImageInfo && oldImageInfo.image_id) {
            let successImageDeletion = await database.deleteImageById(dbConnection, oldImageInfo.image_id);
            if (!successImageDeletion) {
                const error = new Error("A kép törlése nem sikerült");
                error.statusCode = 500;
                throw error;
            }
        }

        let successPointDeletion = await database.deletePointById(dbConnection, pointID);
        if (!successPointDeletion) {
            const error = new Error("A pont törlése nem sikerült");
            error.statusCode = 500;
            throw error;
        }

        await dbConnection.commit();

        let gameMapID = pointInfo.game_maps_id;
        let mapID = pointInfo.map_id;
        // userId/gameMapId/mapId/point_images/pointID/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
            mapID.toString(),
            "point_images",
            pointID.toString()
        );

        // private/userId/gameMapId/mapId/point_images/pointID/
        let targetPath = path.join(
            UPLOAD_ROOT,
            relativeDestDir
        );

        try {
            await fs.rm(targetPath, { recursive: true, force: true });
        } catch (err) {
            console.error(`Error deleting directory ${targetPath}: ${err.message}`);
        }

        response.status(204).send();
    } catch (error) {
        await handleError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

module.exports = router;
