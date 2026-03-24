const database = require("../../sql/database.js");
const { deleteFile } = require("../../utils/fileUtils.js");

function validateId(id, idName) {
    if (id == undefined || id == null) {
        const err = new Error("Helytelen " + idName);
        err.statusCode = 400;
        throw err;
    }
    const str = String(id);
    const num = Number(id);
    if (!str.match(/^[0-9]+$/) || isNaN(num) || num <= 0 || !Number.isInteger(num) || num > 2147483647) {
        const err = new Error("Helytelen " + idName);
        err.statusCode = 400;
        throw err;
    }
    return num;
}

async function handleError(response, error, file, dbConnection, processedImagePaths) {
    if (dbConnection) {
        try {
            await dbConnection.rollback();
        } catch (rollbackError) {
            console.error("Database rollback failed:", rollbackError);
        }
    }

    if (processedImagePaths) {
        let pathsToDelete = [];
        if (processedImagePaths.mainPath) {
            pathsToDelete.push(processedImagePaths.mainPath)
        };
        if (processedImagePaths.lowResPath) {
            pathsToDelete.push(processedImagePaths.lowResPath)
        };
        try {
            await Promise.all(pathsToDelete.map(path => deleteFile(path)));
        } catch (deleteErr) {
            console.error("Error deleting processed image paths:", deleteErr);
        }
    }


    if (file && file.path) {
        try {
            await deleteFile(file.path);
        } catch (deleteErr) {
            console.error("Error deleting temporary uploaded file:", deleteErr);
        }
    }
    let statusCode = error.statusCode ? error.statusCode : 500;
    let message = error.statusCode ? error.message : "Váratlan hiba történt!";

    if (!error.statusCode) {
        // unexpected errors are logged
        console.error(error);
    }

    if (!response.headersSent) {
        response.status(statusCode).json({
            success: false,
            error: message
        });
    }
}

async function assertUserOwnsGameMap(userId, gameMapID) {
    if (!await database.checkUserOwnsGameMap(userId, gameMapID)) {
        const error = new Error("Nincs hozzáférése ehhez a pályához");
        error.statusCode = 403;
        throw error;
    }
}

async function assertUserOwnsMap(userId, mapID) {
    if (!await database.checkUserOwnsMap(userId, mapID)) {
        const error = new Error("Nincs hozzáférése ehhez a térképhez");
        error.statusCode = 403;
        throw error;
    }
}

async function assertUserOwnsPoint(userId, pointID) {
    if (!await database.checkUserOwnsPoint(userId, pointID)) {
        const error = new Error("Nincs hozzáférése ehhez a ponthoz");
        error.statusCode = 403;
        throw error;
    }
}

async function assertUserOwnsConnection(userId, connectionID) {
    if (!await database.checkUserOwnsConnection(userId, connectionID)) {
        const error = new Error("Nincs hozzáférése ehhez a kapcsolathoz");
        error.statusCode = 403;
        throw error;
    }
}

const requireBody = async (request, response, next) => {
    if (request.body) {
        next();
    }
    else {
        if (request.file && request.file.path) {
            await deleteFile(request.file.path);
        }
        response.status(400).json({
            success: false,
            error: "Hiányzó adatok!"
        });
    }
};

module.exports = {
    validateId,
    handleError,
    assertUserOwnsGameMap,
    assertUserOwnsMap,
    assertUserOwnsPoint,
    assertUserOwnsConnection,
    requireBody
};