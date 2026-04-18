import { EVENTS } from "../shared/EventBus.js";
import { loadLowThenHigh } from "../../libs/network/progressiveImage.js";
import { fetchGameMapCoverImage } from "../../libs/network/gameMapsApi.js";

export class CoverImageManager {
    constructor(eventBus) {
        this.bus = eventBus;
        this.elements = {};
        this.#gatherElements();
        this.bindBusEvents();
        this.abortController = null;
    }

    #gatherElements() {
        this.elements.coverImage = document.getElementById("coverImage");
    }

    bindBusEvents() {
        this.bus.on(EVENTS.APP_INIT, ({ gameMapId }) => {
            this.#loadCoverImage(gameMapId);
        });
    }

    async #loadCoverImage(gameMapId) {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();
        const coverImage = this.elements.coverImage;

        try {
            await loadLowThenHigh({
                fetchLow: () => fetchGameMapCoverImage(gameMapId, this.abortController.signal, "low"),
                fetchHigh: () => fetchGameMapCoverImage(gameMapId, this.abortController.signal, "high"),
                isCurrent: () => !this.abortController.signal.aborted,
                loadToViewer: async (imageData) => {
                    await new Promise((resolve) => {
                        const handleLoad = () => {
                            coverImage.removeEventListener("load", handleLoad);
                            coverImage.removeEventListener("error", handleError);
                            imageData.cleanup();

                            coverImage.style.opacity = "1";

                            const placeholder = document.getElementById("coverPlaceholder");
                            if (placeholder) {
                                placeholder.style.opacity = "0";
                            }

                            resolve();
                        };

                        const handleError = () => {
                            coverImage.removeEventListener("load", handleLoad);
                            coverImage.removeEventListener("error", handleError);
                            resolve();
                        };

                        coverImage.addEventListener("load", handleLoad, { once: true });
                        coverImage.addEventListener("error", handleError, { once: true });
                        coverImage.src = imageData.url;
                    });
                }
            });
        } catch (error) {
            console.error("Failed to load cover image", error);
        }
    }
}
