const express = require("express");
const router = express.Router();
const database = require("../../sql/database.js");
const { checkAuth } = require("../../auth.js");

const { validateId, handleError, assertUserOwnsGameMap, assertUserOwnsConnection, requireBody } = require("./utils.js");
const upload = require("./uploadConfig.js");

//!Endpoints:
//?GET /api/map-creator/game-maps/:gameMapID/connections
router.get("/game-maps/:gameMapID/connections", checkAuth, async (request, response) => {
    try {
        const userId = request.session.userid;
        const gameMapID = validateId(request.params.gameMapID, "pálya ID");

        await assertUserOwnsGameMap(userId, gameMapID);

        let connectionList = await database.getConnectionsByGameMapId(gameMapID);

        response.status(200).json({
            success: true,
            connections: connectionList
        });
    } catch (error) {
        let statusCode = error.statusCode ? error.statusCode : 500;
        let message = error.statusCode ? error.message : "Váratlan hiba történt!";

        if (statusCode === 500) {
            console.error(error);
        }

        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
});

//?PUT /api/map-creator/connections/:connectionID
router.put("/connections/:connectionID", checkAuth, upload.none(), requireBody, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;
        const connectionID = validateId(request.params.connectionID, "kapcsolat ID");

        let dirStartToEnd = request.body.directionStartToEnd != undefined && request.body.directionStartToEnd.trim() != ""
            ? Number(request.body.directionStartToEnd)
            : null;

        let dirEndToStart = request.body.directionEndToStart != undefined && request.body.directionEndToStart.trim() != ""
            ? Number(request.body.directionEndToStart)
            : null;

        if (dirStartToEnd == null && dirEndToStart == null) {
            const err = new Error("Nem adott meg módosítandó irányt!");
            err.statusCode = 400;
            throw err;
        }

        if (dirStartToEnd != null && (!Number.isFinite(dirStartToEnd) || dirStartToEnd >= 360 || dirStartToEnd < 0)) {
            const err = new Error("Helytelen kezdőpontból végpontba irány!");
            err.statusCode = 400;
            throw err;
        }

        if (dirEndToStart != null && (!Number.isFinite(dirEndToStart) || dirEndToStart >= 360 || dirEndToStart < 0)) {
            const err = new Error("Helytelen végpontból kezdőpontba irány!");
            err.statusCode = 400;
            throw err;
        }

        await assertUserOwnsConnection(userId, connectionID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let updateSuccess = await database.updateConnectionDirections(dbConnection, connectionID, dirStartToEnd, dirEndToStart);
        if (!updateSuccess) {
            const err = new Error("A kapcsolat frissítése nem sikerült!");
            err.statusCode = 500;
            throw err;
        }

        await dbConnection.commit();

        response.status(200).json({
            success: true,
            message: "Kapcsolat sikeresen frissítve!"
        });

    } catch (error) {
        await handleError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?POST /api/map-creator/game-maps/:gameMapID/connections
router.post("/game-maps/:gameMapID/connections", checkAuth, upload.none(), requireBody, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const startPointId = validateId(request.body.startPointId, "kezdőpont ID");
        const endPointId = validateId(request.body.endPointId, "végpont ID");
        if (startPointId == endPointId) {
            const err = new Error("A kezdőpont és a végpont nem lehet ugyanaz!");
            err.statusCode = 400;
            throw err;
        }

        if (startPointId > endPointId) {
            const err = new Error("A kisebbik id-val rendelkező pontnak kell a kezdőpontnak lennie!");
            err.statusCode = 400;
            throw err;
        }

        const gameMapID = validateId(request.params.gameMapID, "pálya ID");

        await assertUserOwnsGameMap(userId, gameMapID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        if (!await database.arePointsInSameGameMap(dbConnection, startPointId, endPointId, gameMapID)) {
            const err = new Error("A megadott pontok nem ugyanahhoz a pályához tartoznak!");
            err.statusCode = 400;
            throw err;
        }

        if (await database.doesConnectionAlreadyExist(dbConnection, startPointId, endPointId)) {
            const err = new Error("A megadott pontok már össze vannak kapcsolva!");
            err.statusCode = 400;
            throw err;
        }

        let dirStartToEnd = null;
        let dirEndToStart = null;

        const isInSameMap = await database.arePointsInSameMap(dbConnection, startPointId, endPointId);
        if (!isInSameMap) {
            dirStartToEnd = Number(request.body.directionStartToEnd);
            if (!Number.isFinite(dirStartToEnd) || dirStartToEnd >= 360 || dirStartToEnd < 0) {
                const err = new Error("Helytelen kezdőpontból végpontba irány!");
                err.statusCode = 400;
                throw err;
            }
            dirEndToStart = Number(request.body.directionEndToStart);
            if (!Number.isFinite(dirEndToStart) || dirEndToStart >= 360 || dirEndToStart < 0) {
                const err = new Error("Helytelen végpontból kezdőpontba irány!");
                err.statusCode = 400;
                throw err;
            }
        }

        let connectionId = await database.insertConnection(dbConnection, startPointId, endPointId, gameMapID, dirStartToEnd, dirEndToStart);

        await dbConnection.commit();

        response.status(201).json({
            success: true,
            connectionId: connectionId,
            message: "Kapcsolat sikeresen mentve!"
        });

    } catch (error) {
        await handleError(response, error, null, dbConnection, null);
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
});

//?DELETE /api/map-creator/connections/:connectionID
router.delete("/connections/:connectionID", checkAuth, async (request, response) => {
    let dbConnection;
    try {
        const userId = request.session.userid;

        const connectionID = validateId(request.params.connectionID, "kapcsolat ID");

        await assertUserOwnsConnection(userId, connectionID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let successConnectionDeletion = await database.deleteConnectionById(dbConnection, connectionID);

        if (!successConnectionDeletion) {
            const err = new Error("A kapcsolat nem létezik vagy már törölve lett!");
            err.statusCode = 404;
            throw err;
        }

        await dbConnection.commit();

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
