const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const { HIGH_QUALITY, LOW_QUALITY, LOW_RES_WIDTH, LOW_RES_SUFFIX } = require("#config/imageConfig.js");

sharp.cache(false);

async function processImageMetadata(filePath) {
    const metadata = await sharp(filePath).metadata();

    return {
        width: metadata.width,
        height: metadata.height,
        extension: metadata.format ? "." + metadata.format : path.extname(filePath).toLowerCase()
    };
}

async function createWebpAndLowRes(params) {
    const {
        inputFilePath,
        outputDirPath,
        baseName,
        highQuality = HIGH_QUALITY,
        lowQuality = LOW_QUALITY,
        lowResWidth = LOW_RES_WIDTH
    } = params;

    const targetFileName = baseName + ".webp";
    const lowResFileName = baseName + LOW_RES_SUFFIX + ".webp";
    const mainPath = path.join(outputDirPath, targetFileName);
    const lowResPath = path.join(outputDirPath, lowResFileName);

    await fs.mkdir(outputDirPath, { recursive: true });

    await sharp(inputFilePath)
        .webp({ quality: highQuality })
        .toFile(mainPath);

    await sharp(inputFilePath)
        .webp({ quality: lowQuality })
        .resize({ width: lowResWidth })
        .toFile(lowResPath);

    return {
        targetFileName,
        lowResFileName,
        mainPath,
        lowResPath
    };
}

async function deleteImage(pathToImage) {
    try {
        await fs.unlink(pathToImage);
    } catch (error) {
        if (error.code != "ENOENT") {
            console.error("Failed to delete " + pathToImage + ":", error.message);
        }
    }
}

async function deleteImageAndLowResByMainPath(mainPath) {
    if (mainPath) {
        const imagePath = path.parse(mainPath);
        const lowResPath = path.join(imagePath.dir, imagePath.name + LOW_RES_SUFFIX + imagePath.ext);

        const deletePromises = [mainPath, lowResPath].map(path => deleteImage(path));

        await Promise.all(deletePromises);
    }
}

module.exports = {
    processImageMetadata,
    createWebpAndLowRes,
    deleteImageAndLowResByMainPath
};
