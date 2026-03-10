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
        let data = await response.blob();

        imageURL = URL.createObjectURL(data);

        return {
            url: imageURL,
            width,
            height,
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

export async function fetchMapImage(mapId, abortSignal = null) {
    return await fetchImage(
        `/api/game_maps/getMapImageById?mapId=${mapId}`,
        abortSignal
    );
}

export async function fetchEquirectangularImage(pointId, abortSignal = null, resolution = "high") {
    return await fetchImage(
        `/api/game_maps/getImageByPointId?pointId=${pointId}&resolution=${resolution}`,
        abortSignal
    );
}
