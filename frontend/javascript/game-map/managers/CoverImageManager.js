import { EVENTS } from "../shared/EventBus.js";
import { loadLowThenHigh } from "../../libs/network/progressiveImage.js";
import { fetchGameMapCoverImage } from "../../libs/network/gameMapsApi.js";
import { uploadGameMapCoverImage, deleteGameMapCoverImage } from "../shared/api.js";

export class CoverImageManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.appStore = appStore;
        this.elements = {};
        this.#gatherElements();
        this.#bindBusEvents();
        this.loadAbortController = null;
        this.uploadAbortController = null;

        this.isUpdatingCover = false;
    }

    #gatherElements() {
        this.elements.coverImage = document.getElementById("coverImage");
        this.elements.covertPlaceholder = document.getElementById("coverPlaceholder");
    }

    #bindBusEvents() {
        this.bus.on(EVENTS.APP_INIT, ({ gameMapId }) => {
            this.#loadCoverImage(gameMapId);
        });

        this.bus.on(EVENTS.UI_MODAL_CONFIRMED, ({ modalType, file, action }) => {
            if (modalType == "cover_image") {
                switch (action) {
                    case "upload":
                        this.#handleCoverImageUpload(file);
                        break;
                    case "delete":
                        this.#handleCoverImageDelete();
                        break;
                }
            }
        });
    }

    async #loadCoverImage(gameMapId) {
        if (this.loadAbortController) {
            this.loadAbortController.abort();
        }
        this.loadAbortController = new AbortController();

        try {
            await loadLowThenHigh({
                fetchLow: () => fetchGameMapCoverImage(gameMapId, this.loadAbortController.signal, "low"),
                fetchHigh: () => fetchGameMapCoverImage(gameMapId, this.loadAbortController.signal, "high"),
                isCurrent: () => !this.loadAbortController.signal.aborted,
                loadToViewer: async (imageData) => {
                    await this.#loadImage(
                        imageData.url,
                        () => {
                            this.elements.coverImage.style.opacity = "1";
                            this.elements.covertPlaceholder.style.opacity = "0";
                            imageData.cleanup();
                        }
                    );
                }
            });
        } catch (error) {
            console.error("Failed to load cover image", error);
        }
    }

    async #handleCoverImageUpload(file) {
        if (!this.isUpdatingCover) {
            this.isUpdatingCover = true;
            const randomToastId = Math.random().toString();
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: "Borítókép frissítése",
                type: "info",
                id: randomToastId,
                autohide: false,
                spinner: true
            });
            if (this.uploadAbortController) {
                this.uploadAbortController.abort();
            }

            this.uploadAbortController = new AbortController();
            const gameMapId = this.appStore.getState().gameMapId;

            try {
                const imageUrl = URL.createObjectURL(file);
                const coverImage = this.elements.coverImage;

                await uploadGameMapCoverImage(gameMapId, file, this.uploadAbortController.signal);

                if (this.loadAbortController) {
                    this.loadAbortController.abort();
                }
                await this.#loadImage(imageUrl);
                URL.revokeObjectURL(imageUrl);

                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Borítókép frissítve" });
            } catch (error) {
                if (error.name != "AbortError") {
                    this.bus.emit(EVENTS.TOAST_SHOW, {
                        msg: error.message || "Nem sikerült frissíteni a borítóképet.",
                        type: "danger"
                    });
                }
            } finally {
                this.uploadAbortController = null;
                this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: randomToastId });
                this.isUpdatingCover = false;
            }
        } else {
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: "Már folyamatban van egy borítókép frissítés. Kérlek várj, amíg az befejeződik.",
                type: "danger"
            });
        }
    }

    async #handleCoverImageDelete() {
        if (!this.isUpdatingCover) {
            this.isUpdatingCover = true;
            const randomToastId = Math.random().toString();
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: "Borítókép törlése",
                type: "info",
                id: randomToastId,
                autohide: false,
                spinner: true
            });

            const gameMapId = this.appStore.getState().gameMapId;

            try {
                await deleteGameMapCoverImage(gameMapId);

                this.#loadCoverImage(gameMapId);

                this.bus.emit(EVENTS.TOAST_SHOW, { msg: "Borítókép sikeresen törölve.", type: "success" });
            } catch (error) {
                this.bus.emit(EVENTS.TOAST_SHOW, {
                    msg: error.message || "Nem sikerült törölni a borítóképet.",
                    type: "danger"
                });
            } finally {
                this.bus.emit(EVENTS.TOAST_HIDE_ID, { id: randomToastId });
                this.isUpdatingCover = false;
            }
        } else {
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: "Már folyamatban van egy borítókép módosítás.",
                type: "danger"
            });
        }
    }

    async #loadImage(url, onload = () => { }) {
        await new Promise((resolve) => {
            const coverImage = this.elements.coverImage;

            const handleLoad = () => {
                coverImage.removeEventListener("load", handleLoad);
                coverImage.removeEventListener("error", handleError);
                onload();
                resolve();
            };

            const handleError = () => {
                coverImage.removeEventListener("load", handleLoad);
                coverImage.removeEventListener("error", handleError);
                resolve();
            };

            coverImage.addEventListener("load", handleLoad, { once: true });
            coverImage.addEventListener("error", handleError, { once: true });

            coverImage.src = url;
        });
    }
}
