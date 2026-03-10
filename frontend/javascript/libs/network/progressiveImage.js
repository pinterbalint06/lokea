import { fetchEquirectangularImage } from "./gameMapsApi.js";

export function isCancellationError(error) {
    return error && (error.name == "AbortError" || error.type == "REQUEST_CANCELLED");
}

/**
 * Loads a low-resolution image first for fast display, then upgrades to high resolution.
 * Both fetches start at the same time so high-res is already in flight while low-res displays.
 * Irrelevant requests (isCurrent() == false) are checked after every await.
 * Partial failures are handled: low-only if high fails or high-only if low fails.
 * Both fail -> rethrows the first error.
 *
 * @param {function(): Promise} fetchLow              - Fetches the low-resolution image data
 * @param {function(): Promise} fetchHigh             - Fetches the high-resolution image data
 * @param {function(imageData): Promise} loadToViewer - Loads the image into the viewer
 * @param {function(): boolean} isCurrent             - Should return false if the load is no longer relevant
 * @param {function(imageData): void} [onLowReady]    - Called after low-res is displayed
 * @param {function(imageData): void} [onHighReady]   - Called after high-res is displayed
 * @param {function(error): void} [onError]           - Called on non-cancellation errors
 * @returns {Promise<{stage: string}>}
 */
async function loadLowThenHigh({ fetchLow, fetchHigh, loadToViewer, isCurrent, onLowReady, onHighReady, onError }) {
    let lowImgData = null;
    let highImgData = null;
    let lowError = null;
    let highError = null;
    let result = null;

    const lowPromise = fetchLow();
    const highPromise = fetchHigh();

    try {
        try {
            lowImgData = await lowPromise;
        } catch (e) {
            lowError = e;
        }

        if (lowImgData) {
            if (!isCurrent()) {
                result = { stage: "irrelevant_before_low_load" };
            } else {
                await loadToViewer(lowImgData);
                if (!isCurrent()) {
                    result = { stage: "irrelevant_after_low_load" };
                } else {
                    if (onLowReady) {
                        onLowReady(lowImgData);
                    }
                }
            }
        }

        if (result == null) {
            try {
                highImgData = await highPromise;
            } catch (e) {
                highError = e;
            }

            if (highImgData) {
                if (!isCurrent()) {
                    result = { stage: "irrelevant_before_high_load" };
                } else {
                    await loadToViewer(highImgData);
                    if (!isCurrent()) {
                        result = { stage: "irrelevant_after_high_load" };
                    } else {
                        if (onHighReady) {
                            onHighReady(highImgData);
                        }
                        result = { stage: lowImgData ? "completed" : "fallback_high_only" };
                    }
                }
            } else {
                if (lowImgData) {
                    if (highError && onError && !isCancellationError(highError)) {
                        onError(highError);
                    }
                    result = { stage: "completed_low_only" };
                } else {
                    const finalError = lowError || highError;
                    if (finalError && onError && !isCancellationError(finalError)) {
                        onError(finalError);
                    }
                    throw finalError;
                }
            }
        }

        return result;
    } finally {
        Promise.allSettled([lowPromise, highPromise]).then(() => {
            if (lowImgData) {
                lowImgData.cleanup();
            }
            if (highImgData) {
                highImgData.cleanup();
            }
        });
    }
}

/**
 * Loads a point's equirectangular image low resolution first for
 * fast display, then upgraded to high resolution when available.
 *
 * @param {number} pointId                            - The point whose image to load
 * @param {AbortSignal|null} [signal]                 - Aborts ongoing fetches
 * @param {function(): boolean} isCurrent             - Should return false if the load is no longer relevant
 * @param {function(imageData): Promise} loadToViewer - Loads the image into the viewer
 * @param {function(): void} [onLowReady]             - Called after low-res is displayed
 * @param {function(): void} [onHighReady]            - Called after high-res is displayed
 */
export async function loadPointEquirectangularLowThenHigh({ pointId, signal = null, isCurrent, loadToViewer, onLowReady, onHighReady }) {
    return await loadLowThenHigh({
        fetchLow: () => fetchEquirectangularImage(pointId, signal, "low"),
        fetchHigh: () => fetchEquirectangularImage(pointId, signal, "high"),
        loadToViewer,
        isCurrent,
        onLowReady,
        onHighReady
    });
}
