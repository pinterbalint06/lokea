const database = require("../../../sql/database.js");
const AppError = require("../../../utils/AppError.js");
const { cleanupAfterError, assertUserOwnsGameMap, assertUserOwnsConnection } = require("../shared/utils/mapcreator.utils.js");

async function fetchConnections(userId, gameMapID) {
    await assertUserOwnsGameMap(userId, gameMapID);
    return await database.getConnectionsByGameMapId(gameMapID);
}

async function updateConnection(userId, connectionID, directionStartToEnd, directionEndToStart) {
    let dbConnection;
    try {
        await assertUserOwnsConnection(userId, connectionID);

        const dirStartToEnd = directionStartToEnd != undefined
            ? directionStartToEnd
            : null;
        const dirEndToStart = directionEndToStart != undefined
            ? directionEndToStart
            : null;

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        const isCrossMapConnection = await database.isConnectionCrossMap(dbConnection, connectionID);
        if (!isCrossMapConnection) {
            throw new AppError("Csak térképek közötti kapcsolatok irányát lehet módosítani!", 400);
        }

        const updateSuccess = await database.updateConnectionDirections(dbConnection, connectionID, dirStartToEnd, dirEndToStart);
        if (!updateSuccess) {
            throw new AppError("A kapcsolat frissítése nem sikerült!", 500);
        }

        await dbConnection.commit();
    } catch (error) {
        await cleanupAfterError(dbConnection);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

async function createConnection(userId, gameMapID, startPointId, endPointId, directionStartToEnd, directionEndToStart) {
    let dbConnection;
    try {
        await assertUserOwnsGameMap(userId, gameMapID);
        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        if (!await database.arePointsInSameGameMap(dbConnection, startPointId, endPointId, gameMapID)) {
            throw new AppError("A megadott pontok nem ugyanahhoz a pályához tartoznak!", 400);
        }

        if (await database.doesConnectionAlreadyExist(dbConnection, startPointId, endPointId)) {
            throw new AppError("A megadott pontok már össze vannak kapcsolva!", 400);
        }

        const dirStartToEnd = directionStartToEnd != undefined
            ? directionStartToEnd
            : null;
        const dirEndToStart = directionEndToStart != undefined
            ? directionEndToStart
            : null;

        const isInSameMap = await database.arePointsInSameMap(dbConnection, startPointId, endPointId);
        if (!isInSameMap && (dirStartToEnd == null || dirEndToStart == null)) {
            throw new AppError("Térképek közötti kapcsolat létrehozásához meg kell adni mindkét irányt!", 400);
        }

        const connectionId = await database.insertConnection(dbConnection, startPointId, endPointId, gameMapID, dirStartToEnd, dirEndToStart);

        await dbConnection.commit();

        return connectionId;
    } catch (error) {
        await cleanupAfterError(dbConnection);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

async function deleteConnection(userId, connectionID) {
    let dbConnection;
    try {
        await assertUserOwnsConnection(userId, connectionID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        const successConnectionDeletion = await database.deleteConnectionById(dbConnection, connectionID);
        if (!successConnectionDeletion) {
            throw new AppError("A kapcsolat nem létezik vagy már törölve lett!", 404);
        }

        await dbConnection.commit();
    } catch (error) {
        await cleanupAfterError(dbConnection);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

module.exports = {
    fetchConnections,
    updateConnection,
    createConnection,
    deleteConnection
};
