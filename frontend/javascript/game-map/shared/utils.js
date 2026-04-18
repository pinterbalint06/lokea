export function formatDateTime(value) {
    let formattedValue = "-";
    if (value) {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            formattedValue = date.toLocaleString("hu-HU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });
        }
    }
    return formattedValue;
}

export { getGameMapIdFromUrl } from "../../libs/utils.js";

export function getEditMapUrlFromLocation(locationHref) {
    let targetUrl = locationHref;
    if (targetUrl.endsWith("/")) {
        targetUrl = targetUrl.slice(0, -1);
    }
    return targetUrl + "/edit";
}

export { showToast } from "../../libs/utils.js";
