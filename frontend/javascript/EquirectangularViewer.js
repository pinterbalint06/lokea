import { CanvasInput } from './CanvasInput.js';

const DEFAULT_CANVAS_WIDTH = 1000;
const DEFAULT_CANVAS_HEIGHT = 1000;
const DEFAULT_IS_AUTO_ROTATE = false;
const DEFAULT_AUTO_ROTATE_SPEED = 0.1;

export class EquirectangularViewer {
    #engine;
    #canvasInput;
    #engineInitPromise;
    #canvasId;
    #canvas;
    #canvasCanvasWidth;
    #canvasCanvasHeight;

    /**
     * @param {string} canvasId - The HTML ID of the canvas.
     */
    constructor(canvasId, options = {}) {
        this.#canvasId = canvasId;
        this.#canvas = document.getElementById(canvasId);

        if (this.#canvas) {
            // initialize class variables
            this.#engine = null;
            this.animationFrameId = null;
            this.#canvasInput = null;

            this.autoRotate = DEFAULT_IS_AUTO_ROTATE;
            this.autoRotateSpeed = DEFAULT_AUTO_ROTATE_SPEED;
            this.#canvasCanvasWidth = options.canvasWidth ? options.canvasWidth : DEFAULT_CANVAS_WIDTH;
            this.#canvasCanvasHeight = options.canvasHeight ? options.canvasHeight : DEFAULT_CANVAS_HEIGHT;
            this.#canvas.width = this.#canvasCanvasWidth;
            this.#canvas.height = this.#canvasCanvasHeight;

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
     * Asynchronously loads an equirectangular image into the viewer engine.
     *
     * @async
     * @param {string} url - The URL of the image to load.
     * @param {number} width - The width of the image in pixels.
     * @param {number} height - The height of the image in pixels.
     * @returns {Promise<void>} Resolves when the image is loaded, or throws an error if the engine initialization was unsuccessful.
     * @throws {Error} If the engine initialization was unsuccessful.
     */
    async loadImage(url, width, height) {
        let success = await this.#engineInitPromise;

        if (success) {
            this.#engine.loadEquirectangularImage(url, width, height);
        } else {
            throw new Error("loadImage: Engine initialization was unsuccessful!");
        }
    }

    setAutoRotate(enabled) {
        this.autoRotate = enabled;
    }

    async toggleFullscreen() {

        let engineInitializationSuccess = await this.#engineInitPromise;

        if (engineInitializationSuccess && this.#engine) {
            if (!document.fullscreenElement) {
                this.#canvas.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    }

    destroy() {
        // stop rendering
        cancelAnimationFrame(this.animationFrameId);
        // remove window listener for fullscreen listeners
        window.removeEventListener("resize", this.#onFullscreenResize);
        // remove fullscreen listener
        this.#canvas.removeEventListener("fullscreenchange", this.#onFullscreenChange);
        if (this.#canvasInput) {
            this.#canvasInput.removeListeners();
        }
        this.#engineInitPromise.then((success) => {
            if (success && this.#engine) {
                console.log("delete");
                this.#engine.delete();
            }
            this.#engine = null;
        });
    }

    // |-----------------|
    // | PRIVATE METHODS |
    // |-----------------|
    async #initialize() {
        try {
            let Module = await createModule();
            this.#engine = new Module.EquirectangularEngine(this.#canvasId);

            // set canvas size
            this.#engine.setCanvasSize(this.#canvasCanvasWidth, this.#canvasCanvasHeight);

            // Setup CanvasInput
            this.#setupInputControl();
            this.#setupResizeHandlers();

            // Start Render Loop
            this.#renderLoop();

            return true;
        } catch (error) {
            if (error instanceof ReferenceError) {
                console.error("Webassembly glue code is not present!");
            } else {
                console.error("Unexpected error: Equirectangular Engine failed to initialize: ", error);
            }
            return false;
        }
    }

    async #setFocalLength(focalLength) {
        let engineInitializationSuccess = await this.#engineInitPromise;

        if (engineInitializationSuccess && this.#engine) {
            this.#engine.setFocalLength(focalLength);
        } else {
            throw new Error("setFocalLength: Engine initialization was unsuccessful!");
        }
    }

    async #rotateCamera(pitch, yaw) {
        let engineInitializationSuccess = await this.#engineInitPromise;

        if (engineInitializationSuccess && this.#engine) {
            this.#engine.rotateCamera(this.#degToRad(pitch), this.#degToRad(yaw));
        } else {
            throw new Error("setFocalLength: Engine initialization was unsuccessful!");
        }
    }

    #setupInputControl() {
        this.#canvasInput = new CanvasInput(this.#canvas, {
            onRotate: async (pitch, yaw) => {
                this.#rotateCamera(pitch, yaw);
            },
            onZoom: (newFocal) => {
                this.#setFocalLength(newFocal);
            }
        });
    }

    #setupResizeHandlers() {
        window.addEventListener("resize", () => { this.#onFullscreenResize() });
        this.#canvas.addEventListener("fullscreenchange", () => { this.#onFullscreenChange() });
    }

    async #onFullscreenChange() {
        let engineInitializationSuccess = await this.#engineInitPromise;

        if (engineInitializationSuccess && this.#engine) {
            let isFullscreen = document.fullscreenElement == this.#canvas;
            if (isFullscreen) {
                this.#canvas.classList.remove("border");
                this.#engine.setCanvasSize(window.innerWidth, window.innerHeight);
            } else {
                this.#canvas.classList.add("border");
                this.#engine.setCanvasSize(this.#canvasCanvasWidth, this.#canvasCanvasHeight);
            }
        }
    }

    async #onFullscreenResize() {
        let engineInitializationSuccess = await this.#engineInitPromise;

        if (engineInitializationSuccess && this.#engine) {
            let isFullscreen = document.fullscreenElement == this.#canvas;
            if (isFullscreen) {
                this.#engine.setCanvasSize(window.innerWidth, window.innerHeight);
            }
        }
    }

    #renderLoop() {
        if (this.#engine) {
            if (this.autoRotate) {
                this.#engine.rotateCamera(0, this.#degToRad(this.autoRotateSpeed));
            }
            this.#engine.render();

            this.animationFrameId = requestAnimationFrame(() => this.#renderLoop());
        }
    }

    #degToRad(angle) {
        return angle * (Math.PI / 180.0);
    }
}