const database = require("../../sql/database.js");
const { deleteFile } = require("../../utils/fileUtils.js");
const AppError = require("../../utils/AppError.js");

function validateNumber(value, name) {
    let num = Number(value);
    if (value == undefined || value == null || value.toString().trim() == "" || isNaN(num) || !Number.isFinite(num)) {
        throw new AppError(`Helytelen ${name}!`, 400);
    }
    return num;
}

function validateDegree(value, name) {
    let num = validateNumber(value, name);
    if (num < 0 || num >= 360) {
        throw new AppError(`Helytelen ${name}!`, 400);
    }
    return num;
}

function validateId(id, idName) {
    const str = String(id);
    const num = validateNumber(id, idName);
    if (!str.match(/^[0-9]+$/) || num <= 0 || !Number.isInteger(num) || num > 2147483647) {
        throw new AppError(`Helytelen ${idName}!`, 400);
    }
    return num;
}

async function cleanupAfterError(dbConnection, file, processedImagePaths) {
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
}

async function assertUserOwnsGameMap(userId, gameMapID) {
    if (!await database.checkUserOwnsGameMap(userId, gameMapID)) {
        throw new AppError("Nincs hozzáférése ehhez a pályához", 403);
    }
}

async function assertUserOwnsMap(userId, mapID) {
    if (!await database.checkUserOwnsMap(userId, mapID)) {
        throw new AppError("Nincs hozzáférése ehhez a térképhez", 403);
    }
}

async function assertUserOwnsPoint(userId, pointID) {
    if (!await database.checkUserOwnsPoint(userId, pointID)) {
        throw new AppError("Nincs hozzáférése ehhez a ponthoz", 403);
    }
}

async function assertUserOwnsConnection(userId, connectionID) {
    if (!await database.checkUserOwnsConnection(userId, connectionID)) {
        throw new AppError("Nincs hozzáférése ehhez a kapcsolathoz", 403);
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
    cleanupAfterError,
    assertUserOwnsGameMap,
    assertUserOwnsMap,
    assertUserOwnsPoint,
    assertUserOwnsConnection,
    requireBody,
    validateNumber,
    validateDegree
};