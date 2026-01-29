import { CanvasInput } from './CanvasInput.js';
import { degreeToRadian } from '../math/mathUtils.js';
import ModuleBuilder from '../webassembly/equirectangular/equirectangular.js';

const DEFAULT_OPTIONS = {
    "canvasWidth": 1000,
    "canvasHeight": 1000,
    "autoRotate": false,
    "autoRotateSpeed": 0.1,
};

export class EquirectangularViewer {
    #engine;
    #canvasInput;
    #engineInitPromise;
    #canvasId;
    #canvas;
    #canvasWidth;
    #canvasHeight;
    #currentImageRequestID;
    #animationFrameId;
    #windowResizeListener;
    #canvasFullscreenListener;
    #isDestroyed;

    /**
     * Constructor for EquirectangularViewer class.
     *
     * @param {string} canvasId - The HTML ID of the canvas.
     * @param {Object} [options={}] - Optional configuration options.
     * @param {boolean} [options.autoRotate=DEFAULT_OPTIONS["autoRotate"]] - Whether the viewer should auto-rotate.
     * @param {number} [options.autoRotateSpeed=DEFAULT_OPTIONS["autoRotate"]] - The speed of auto-rotation.
     * @param {number} [options.canvasWidth=DEFAULT_OPTIONS["canvasWidth"]] - The width of the canvas.
     * @param {number} [options.canvasHeight=DEFAULT_OPTIONS["canvasHeight"]] - The height of the canvas.
     * @throws {Error} Throws an error if the canvas element with the specified ID does not exist.
     */
    constructor(canvasId, options = {}) {
        this.#canvasId = canvasId;
        this.#canvas = document.getElementById(canvasId);

        if (this.#canvas) {
            // initialize class variables
            this.#engine = null;
            this.#animationFrameId = null;
            this.#canvasInput = null;
            this.#isDestroyed = false;

            this.autoRotate = options.autoRotate != undefined ? options.autoRotate : DEFAULT_OPTIONS["autoRotate"];
            this.autoRotateSpeed = options.autoRotateSpeed != undefined ? options.autoRotateSpeed : DEFAULT_OPTIONS["autoRotateSpeed"];
            this.#canvasWidth = options.canvasWidth != undefined ? options.canvasWidth : DEFAULT_OPTIONS["canvasWidth"];
            this.#canvasHeight = options.canvasHeight != undefined ? options.canvasHeight : DEFAULT_OPTIONS["canvasHeight"];
            this.#canvas.width = this.#canvasWidth;
            this.#canvas.height = this.#canvasHeight;

            this.#currentImageRequestID = 0;

            // initialize
            this.#engineInitPromise = this.#initialize();
        } else {
            throw new Error("There is no canvas with the id: " + this.#canvasId);
        }
    }

    // |------------------|
    // | PUBLIC FUNCTIONS |
    // |------------------|


    /**
     * Loads an equirectangular image into the viewer.
     *
     * Waits for the engine to initialize, then requests the engine to load the image from the given URL
     * with the specified width and height. If a new image is requested before the current one finishes loading,
     * the promise is rejected. If the engine fails to load the image, the promise is also rejected.
     *
     * @async
     * @param {string} url - The URL of the equirectangular image to load.
     * @param {number} width - The width of the image.
     * @param {number} height - The height of the image.
     * @returns {Promise<void>} Resolves when the image is successfully loaded, rejects if loading fails or a new image is requested.
     * @throws {Error} If the viewer is destroyed or the engine fails to initialize.
     */
    async loadImage(url, width, height) {
        if (this.#isDestroyed) {
            throw new Error("Equirectangular Viewer is destroyed!");
        }
        if (!this.#engine) {
            await this.#engineInitPromise;
            if (!this.#engine) {
                throw new Error("Engine failed to initialize!");
            }
        }

        this.#currentImageRequestID++;
        let currentRequestId = this.#currentImageRequestID;

        return new Promise((resolve, reject) => {
            this.#engine.loadEquirectangularImage(
                url,
                width,
                height,
                () => {
                    if (this.#currentImageRequestID == currentRequestId) {
                        resolve();
                    } else {
                        reject(new Error("New image was requested"));
                    }
                },
                (errorMessage) => {
                    if (this.#currentImageRequestID == currentRequestId) {
                        reject(new Error("Engine Load Error: " + errorMessage));
                    };
                }
            );
        });
    }

    setAutoRotate(enabled) {
        this.autoRotate = enabled;
    }

    async toggleFullscreen() {
        if (!document.fullscreenElement) {
            await this.#canvas.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    }

    destroy() {
        this.#isDestroyed = true;
        // stop rendering if running
        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId);
            this.#animationFrameId = null;
        }
        // remove window listener for fullscreen listeners
        if (this.#windowResizeListener) {
            window.removeEventListener("resize", this.#windowResizeListener);
        }
        // remove fullscreen listener
        if (this.#canvasFullscreenListener) {
            this.#canvas.removeEventListener("fullscreenchange", this.#canvasFullscreenListener);
        }
        if (this.#canvasInput) {
            this.#canvasInput.removeListeners();
            this.#canvasInput = null;
        }
        this.#engineInitPromise.then(() => {
            if (this.#engine && !this.#engine.isDeleted()) {
                this.#engine.delete();
            }
            this.#engine = null;
        });
    }

    // |-----------------|
    // | PRIVATE METHODS |
    // |-----------------|
    async #initialize() {
        let success = false;

        if (typeof ModuleBuilder == "undefined") {
            this.#isDestroyed = true;
            throw new Error("Webassembly glue code is not present!");
        }

        try {
            let Module = await ModuleBuilder();
            let returnValue = false;
            if (!this.#isDestroyed) {
                this.#engine = new Module.EquirectangularEngine(this.#canvasId);

                // set canvas size
                this.#engine.setCanvasSize(this.#canvasWidth, this.#canvasHeight);

                // Setup CanvasInput
                this.#setupInputControl();
                this.#setupResizeHandlers();

                // Start Render Loop
                this.#renderLoop();

                success = true;
            }
        } catch (error) {
            // if initialization failed set destroyed so class can't be used anymore
            this.#isDestroyed = true;
            console.error("Unexpected error: Equirectangular Engine failed to initialize: ", error);
            throw error;
        }

        return success;
    }

    #setupInputControl() {
        this.#canvasInput = new CanvasInput(this.#canvas, {
            onRotate: (pitch, yaw) => {
                if (this.#engine) {
                    this.#engine.rotateCamera(degreeToRadian(pitch), degreeToRadian(yaw));
                }
            },
            onZoom: (newFocal) => {
                if (this.#engine) {
                    this.#engine.setFocalLength(newFocal);
                }
            }
        });
    }

    #setupResizeHandlers() {
        this.#windowResizeListener = () => { this.#onFullscreenResize() };
        this.#canvasFullscreenListener = () => { this.#onFullscreenChange() };
        window.addEventListener("resize", this.#windowResizeListener);
        this.#canvas.addEventListener("fullscreenchange", this.#canvasFullscreenListener);
    }

    async #onFullscreenChange() {
        // only run if class is not destroyed
        if (!this.#isDestroyed) {
            // if engine is not ready wait for initialization to finish
            if (!this.#engine) {
                await this.#engineInitPromise;
            }
            // if engine is present after initialization
            if (this.#engine) {
                let isFullscreen = document.fullscreenElement == this.#canvas;
                if (isFullscreen) {
                    this.#engine.setCanvasSize(window.innerWidth, window.innerHeight);
                } else {
                    this.#engine.setCanvasSize(this.#canvasWidth, this.#canvasHeight);
                }
            }
        }
    }

    async #onFullscreenResize() {
        // only run if class is not destroyed
        if (!this.#isDestroyed) {
            // if engine is not ready wait for initialization to finish
            if (!this.#engine) {
                await this.#engineInitPromise;
            }
            // if engine is present after initialization
            if (this.#engine) {
                let isFullscreen = document.fullscreenElement == this.#canvas;
                if (isFullscreen) {
                    this.#engine.setCanvasSize(window.innerWidth, window.innerHeight);
                }
            }
        }
    }

    #renderLoop = () => {
        if (this.#engine && !this.#isDestroyed) {
            if (this.autoRotate) {
                this.#engine.rotateCamera(0, degreeToRadian(this.autoRotateSpeed));
            }
            this.#engine.render();

            this.#animationFrameId = requestAnimationFrame(this.#renderLoop);
        }
    }
}