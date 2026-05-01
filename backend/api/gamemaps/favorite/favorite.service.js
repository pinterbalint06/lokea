const AppError = require("#utils/app-error.js");
const database = require("#gamemaps/favorite/favorite.queries.js");
const { doesGameMapExist } = require("#gamemaps/shared/queries/gamemaps.queries.js");
const { getConnection } = require("#sql/database.js");
const ERRORS = require("#utils/error-messages.js");
const { cleanupAfterError } = require("#mapcreator/shared/utils/mapcreator.utils.js");

async function getFavoriteStatus(userId, gameMapID) {
    const isFavorited = await database.isUserFavorite(gameMapID, userId);
    return { is_favorited: isFavorited };
}

async function addFavorite(userId, gameMapID) {
    let dbConnection;
    try {
        const gameMapExists = await doesGameMapExist(gameMapID);
        if (!gameMapExists) {
            throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
        }

        const alreadyFavorited = await database.isUserFavorite(gameMapID, userId);
        if (alreadyFavorited) {
            throw new AppError(ERRORS.FAVORITE.ALREADY_FAVORITED, 409);
        }

        dbConnection = await getConnection();
        await dbConnection.beginTransaction();

        try {
            await database.insertFavorite(dbConnection, gameMapID, userId);
        } catch (error) {
            if (error && (error.code === "ER_DUP_ENTRY" || error.errno === 1062)) {
                throw new AppError(ERRORS.FAVORITE.ALREADY_FAVORITED, 409);
            }
            throw error;
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

async function removeFavorite(userId, gameMapID) {
    let dbConnection;
    try {
        const isFavorited = await database.isUserFavorite(gameMapID, userId);
        if (!isFavorited) {
            throw new AppError(ERRORS.FAVORITE.NOT_FAVORITED, 404);
        }

        dbConnection = await getConnection();
        await dbConnection.beginTransaction();

        const success = await database.deleteFavorite(dbConnection, gameMapID, userId);
        if (!success) {
            throw new AppError(ERRORS.FAVORITE.REMOVE_FAILED, 500);
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
    getFavoriteStatus,
    addFavorite,
    removeFavorite
};
