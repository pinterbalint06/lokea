const path = require("path");
const AppError = require("#utils/app-error.js");
const fs = require("fs/promises");
const database = require("#sql/database.js");
const ERRORS = require("#utils/error-messages.js");
const { UPLOAD_ROOT_MAP_DATA, isInsideRoot } = require("#config/mapdatas-upload-config.js");
const { assertUserOwnsGameMap } = require("#mapcreator/shared/utils/mapcreator.utils.js");
const { cleanupAfterError } = require("#mapcreator/shared/utils/mapcreator.utils.js");

async function getGameMapDetails(gameMapID, userId) {
    const gameMapDetails = await database.getGameMapDetails(gameMapID);

    if (!gameMapDetails) {
        throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
    }

    const topScores = await database.getTopScoresForGameMap(gameMapID);
    const isOwner = userId != null && gameMapDetails.creator_id == userId;

    return {
        ...gameMapDetails,
        is_owner: isOwner,
        top_scores: topScores
    };
}

async function deleteGameMap(userId, gameMapID) {
    let dbConnection;

    try {
        const gameMapDetails = await database.getGameMapDetails(gameMapID);
        if (!gameMapDetails) {
            throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
        }

        await assertUserOwnsGameMap(userId, gameMapID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        let imageIdsToDelete = await database.getAllImageIdsForGameMap(dbConnection, gameMapID);

        let successMapDeletion = await database.deleteGameMapById(dbConnection, gameMapID);
        if (!successMapDeletion) {
            throw new AppError(ERRORS.GAMEMAP.DELETE_FAILED, 500);
        }

        for (const imageId of imageIdsToDelete) {
            let successImageDeletion = await database.deleteImageById(dbConnection, imageId);
            if (!successImageDeletion) {
                throw new AppError(ERRORS.MAP.IMAGE_DELETIONS_FAILED, 500);
            }
        }

        await dbConnection.commit();

        // :userId/:gameMapId/
        let relativeDestDir = path.join(
            userId.toString(),
            gameMapID.toString(),
        );

        // backend/uploads/mapdatas/:userId/:gameMapId/
        let targetPath = path.join(
            UPLOAD_ROOT_MAP_DATA,
            relativeDestDir
        );

        try {
            if (isInsideRoot(targetPath)) {
                await fs.rm(targetPath, { recursive: true, force: true });
            }
        } catch (err) {
            console.error(`Error deleting directory ${targetPath}: ${err.message}`);
        }
    } catch (error) {
        await cleanupAfterError(dbConnection);
        throw error;
    } finally {
        if (dbConnection) {
            dbConnection.release();
        }
    }
}

async function updateGameMapDetails(userId, gameMapID, title, description) {
    let dbConnection;
    try {
        await assertUserOwnsGameMap(userId, gameMapID);

        dbConnection = await database.getConnection();
        await dbConnection.beginTransaction();

        const titleDb = title ?? null;
        const descriptionDb = description ?? null;

        const updateSuccess = await database.updateGameMapDetails(dbConnection, gameMapID, titleDb, descriptionDb);
        if (!updateSuccess) {
            throw new AppError(ERRORS.GAMEMAP.UPDATE_FAILED, 404);
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
    getGameMapDetails,
    updateGameMapDetails,
    deleteGameMap
};
