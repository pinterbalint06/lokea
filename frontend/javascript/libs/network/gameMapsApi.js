import { handleResponseError } from "./fetch.js";

async function fetchImage(url, abortSignal = null) {
    let imageURL = null;

    try {
        let response = await fetch(
            url,
            {
                method: "GET",
                signal: abortSignal
            }
        );

        if (!response.ok) {
            await handleResponseError(response);
        }

        let width = parseInt(response.headers.get("imageWidth"));
        let height = parseInt(response.headers.get("imageHeight"));
        let northDirection = parseFloat(response.headers.get("northDirection"));
        if (!Number.isFinite(northDirection)) {
            northDirection = 0;
        }
        let data = await response.blob();

        imageURL = URL.createObjectURL(data);

        return {
            url: imageURL,
            width,
            height,
            northDirection,
            cleanup: () => {
                if (imageURL) {
                    URL.revokeObjectURL(imageURL);
                }
            }
        };
    } catch (error) {
        if (imageURL) {
            URL.revokeObjectURL(imageURL);
        }
        throw error;
    }
}

export async function fetchMapImage(mapId, abortSignal = null, resolution = "high") {
    return await fetchImage(
        `/api/game-maps/maps/${mapId}/image?resolution=${resolution}`,
        abortSignal
    );
}

export async function fetchEquirectangularImage(pointId, abortSignal = null, resolution = "high") {
    return await fetchImage(
        `/api/game-maps/points/${pointId}/image?resolution=${resolution}`,
        abortSignal
    );
}
