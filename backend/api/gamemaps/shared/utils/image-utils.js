const path = require("path");
const { LOW_RES_SUFFIX } = require("#config/image-config.js");

function resolveImagePath(filePath, resolution) {
    let finalFilePath = filePath;
    if (resolution == "low") {
        const imagePath = path.parse(filePath);
        finalFilePath = path.join(imagePath.dir, imagePath.name + LOW_RES_SUFFIX + imagePath.ext);
    }
    return finalFilePath;
}

module.exports = {
    resolveImagePath
};
