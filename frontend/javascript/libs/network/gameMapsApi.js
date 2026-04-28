import { handleResponseError } from "./fetch.js";

async function fetchImage(url, abortSignal = null, { extractNorth = false } = {}) {
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
        let data = await response.blob();

        imageURL = URL.createObjectURL(data);

        const result = {
            url: imageURL,
            width,
            height,
            cleanup: () => {
                if (imageURL) {
                    URL.revokeObjectURL(imageURL);
                    imageURL = null;
                }
            }
        };

        if (extractNorth) {
            let northDirection = parseFloat(response.headers.get("northDirection"));
            result.northDirection = Number.isFinite(northDirection) ? northDirection : 0;
        }

        return result;
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
        abortSignal,
        { extractNorth: true }
    );
}

export async function fetchGameMapCoverImage(gameMapId, abortSignal = null, resolution = "high") {
    return await fetchImage(
        `/api/game-maps/${gameMapId}/cover-image?resolution=${resolution}`,
        abortSignal
    );
}
