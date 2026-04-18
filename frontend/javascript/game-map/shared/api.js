import { fetchAndValidate } from "../../libs/network/fetch.js";
import { handleResponseError } from "../../libs/network/fetch.js";

export async function fetchGameMapDetails(gameMapId) {
    return await fetchAndValidate(`/api/game-maps/${gameMapId}`, "game_map_details");
}

export async function uploadGameMapCoverImage(gameMapId, file, abortSignal = null) {
    const formData = new FormData();
    formData.append("coverImage", file);

    const response = await fetch(`/api/game-maps/${gameMapId}/cover-image`, {
        method: "PUT",
        body: formData,
        signal: abortSignal
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}
