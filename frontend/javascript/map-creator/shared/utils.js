import { CONSTANTS } from "./constants.js";
import i18next from "../../libs/language/i18next.js";

export { createSpinnerIcon } from "../../libs/utils.js";

export async function readImageFile(file) {
    let url = URL.createObjectURL(file);
    let imageBitmap;
    try {
        imageBitmap = await createImageBitmap(file);
        let returnObject = {
            url: url,
            width: imageBitmap.width,
            height: imageBitmap.height
        }
        imageBitmap.close();
        return returnObject;
    } catch (error) {
        URL.revokeObjectURL(url);
        if (imageBitmap) {
            imageBitmap.close();
        }
        throw error;
    }
}

export async function processUploadedImageFile(file) {
    if (file.size > CONSTANTS.MAX_FILE_SIZE) {
        throw new Error(i18next.t("errors:common.fileTooLarge"));
    }
    if (!file.type.startsWith("image/")) {
        throw new Error(i18next.t("errors:common.invalidImageType"));
    }
    return await readImageFile(file);
}

export { showToast } from "../../libs/utils.js";

export function savePreviousValue(event) {
    event.target.dataset.previousValue = event.target.value;
}

export { getGameMapIdFromUrl } from "../../libs/utils.js";
