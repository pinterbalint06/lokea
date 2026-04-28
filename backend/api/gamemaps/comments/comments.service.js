const AppError = require("#utils/app-error.js");
const database = require("#gamemaps/comments/comments.queries.js");
const { getConnection, getGameMapDetails } = require("#sql/database.js");
const ERRORS = require("#utils/error-messages.js");
const { cleanupAfterError } = require("#mapcreator/shared/utils/mapcreator.utils.js");

async function assertHasCommentedOnGameMap(gameMapID, userId) {
    const hasCommented = await database.hasUserCommentedOnGameMap(gameMapID, userId);
    if (!hasCommented) {
        throw new AppError(ERRORS.COMMENT.NOT_FOUND, 404);
    }
}

async function getGameMapComments(gameMapID, page) {
    const comments = await database.getGameMapComments(gameMapID, page);
    const totalCount = await database.getGameMapCommentCount(gameMapID);
    const totalPages = Math.ceil(totalCount / 50);

    return {
        comments,
        pagination: {
            totalCount,
            totalPages
        }
    };
}

async function postGameMapComment(userId, gameMapID, comment, rating) {
    let dbConnection;
    try {
        const gameMapDetails = await getGameMapDetails(gameMapID);
        if (!gameMapDetails) {
            throw new AppError(ERRORS.GAMEMAP.NOT_FOUND, 404);
        }

        const hasExistingComment = await database.hasUserCommentedOnGameMap(gameMapID, userId);
        if (hasExistingComment) {
            throw new AppError(ERRORS.COMMENT.ALREADY_COMMENTED, 409);
        }

        const commentDb = comment ?? null;

        dbConnection = await getConnection();
        await dbConnection.beginTransaction();

        try {
            await database.insertGameMapComment(dbConnection, gameMapID, userId, commentDb, rating);
        } catch (error) {
            if (error && (error.code == "ER_DUP_ENTRY" || error.errno == 1062)) {
                throw new AppError(ERRORS.COMMENT.ALREADY_COMMENTED, 409);
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

async function getUserComment(userId, gameMapID) {
    await assertHasCommentedOnGameMap(gameMapID, userId);
    return await database.getUserCommentOnGameMap(gameMapID, userId);
}

async function updateUserComment(userId, gameMapID, commentText, rating) {
    let dbConnection;
    try {
        await assertHasCommentedOnGameMap(gameMapID, userId);

        dbConnection = await getConnection();
        await dbConnection.beginTransaction();

        const commentDb = commentText ?? null;
        const success = await database.updateUserCommentOnGameMap(dbConnection, gameMapID, userId, commentDb, rating);

        if (!success) {
            throw new AppError(ERRORS.COMMENT.UPDATE_FAILED, 500);
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

async function deleteUserComment(userId, gameMapID) {
    let dbConnection;
    try {
        await assertHasCommentedOnGameMap(gameMapID, userId);

        dbConnection = await getConnection();
        await dbConnection.beginTransaction();

        const success = await database.deleteUserCommentOnGameMap(dbConnection, gameMapID, userId);

        if (!success) {
            throw new AppError(ERRORS.COMMENT.DELETE_FAILED, 500);
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
    getGameMapComments,
    postGameMapComment,
    getUserComment,
    updateUserComment,
    deleteUserComment
};
