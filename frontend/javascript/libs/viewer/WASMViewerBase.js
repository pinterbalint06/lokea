import { CanvasInput } from "./CanvasInput.js";

const DEFAULT_OPTIONS = {
    "canvasWidth": 1000,
    "canvasHeight": 1000
};

export const WASM_ERROR_TYPES = {
    INITIALIZATION: "ENGINE_INITIALIZATION",
    DESTROYED: "VIEWER_DESTROYED",
    UNKNOWN: "UNKNOWN_ERROR"
};

export class WebassemblyError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = "WebassemblyError";
        Object.assign(this, options);
    }
}

export class WASMViewerBase {
    // ENGINE RELATED
    /**
     * @type {Object}
     * The equirectangular image engine from webassembly */
    _engine;
    /**
     * @type {Promise<void>}
     * Promise for initializing the engine returns true if it was successful */
    _engineInitPromise;
    /**
     * @type {function}
     * The webassembly module builder from Modularized webassembly.
     */
    _ModuleBuilder

    // CANVAS RELATED
    /**
     * @type {HTMLCanvasElement}
     * The used canvas */
    _canvas;
    /**
     * @type {string}
     * The id of the used canvas */
    _canvasId;
    /**
     * @type {number}
     * The width of the canvas */
    _canvasWidth;
    /**
     * @type {number}
     * The height of the canvas */
    _canvasHeight;
    /**
     * @type {CanvasInput}
     * - Handles rotating and zooming */
    _canvasInput;
    /**
     * @type {function}
     * Handles the fullscreen change and resize of the canvas.
     */
    _resizeHandler;

    // STATE
    /** 
     * @type {number|null} 
     * The ID given by requestAnimationFrame (used to cancel the render loop) */
    _animationFrameId;
    /** 
     * @type {boolean} 
     * Flag indicating if the viewer has been destroyed to prevent further function calls 
     */
    _isDestroyed;

    constructor(canvasId, options = {}, ModuleBuilder) {
        this._canvasId = canvasId;
        this._canvas = document.getElementById(canvasId);

        if (this._canvas) {
            if (ModuleBuilder && typeof ModuleBuilder == "function") {
                // initialize class variables
                this._canvasWidth = options.canvasWidth != undefined ? options.canvasWidth : DEFAULT_OPTIONS["canvasWidth"];
                this._canvasHeight = options.canvasHeight != undefined ? options.canvasHeight : DEFAULT_OPTIONS["canvasHeight"];
                this._canvas.width = this._canvasWidth;
                this._canvas.height = this._canvasHeight;

                this._resizeHandler = null;

                // State related
                this._engine = null;
                this._isDestroyed = false;
                this._animationFrameId = null;
                this._ModuleBuilder = ModuleBuilder;

                // Initialize
                this._engineInitPromise = this._initialize();
            } else {
                this._isDestroyed = true;
                throw new WebassemblyError(
                    "ModuleBuilder is required",
                    {
                        "type": WASM_ERROR_TYPES.INITIALIZATION
                    });
            }
        } else {
            this._isDestroyed = true;
            throw new Error("There is no canvas with the id: " + this._canvasId);
        }
    }

    async _initialize() {
        let success = false;

        try {
            let Module = await this._ModuleBuilder();
            if (!this._isDestroyed) {
                this._engine = this._createEngine(Module);
                if (this._engine) {
                    // set canvas size
                    this._engine.setCanvasSize(this._canvasWidth, this._canvasHeight);

                    // Setup CanvasInput
                    this._setupInputControl();
                    this._setupResizeHandlers();

                    // Start Render Loop
                    this._renderLoop();

                    success = true;
                } else {
                    throw new WebassemblyError(
                        "_creatEngine was not implemented!",
                        {
                            "type": WASM_ERROR_TYPES.INITIALIZATION
                        });
                }
            }
        } catch (error) {
            // if initialization failed set destroyed so class can't be used anymore
            this._isDestroyed = true;
            throw new WebassemblyError(
                "Unexpected error during engine initialization",
                {
                    "type": WASM_ERROR_TYPES.INITIALIZATION,
                    "originalError": error
                });
        }

        return success;
    }

    // Children class should overwrite this
    // Returns the options which will be given to CanvasInput
    _getInputCallbacks() {
        return {};
    }

    // Children class should overwrite this
    // Custom function derived class can override. This is called before rendering.
    _beforeRender() {
    }

    // Children class should overwrite this
    // function that creates the engine object
    _createEngine(module) {
        return null;
    }

    _renderLoop = () => {
        if (this._engine && !this._isDestroyed) {
            this._beforeRender();
            this._engine.render();

            this._animationFrameId = requestAnimationFrame(this._renderLoop);
        }
    }

    async toggleFullscreen() {
        if (!document.fullscreenElement) {
            await this._canvas.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    }

    _setupResizeHandlers() {
        this._resizeHandler = () => {
            this._handleResize();
        };
        window.addEventListener("resize", this._resizeHandler);
        this._canvas.addEventListener("fullscreenchange", this._resizeHandler);
    }

    _handleResize() {
        if (!this._isDestroyed && this._engine) {
            const isFullscreen = document.fullscreenElement === this._canvas;
            if (isFullscreen) {
                this._engine.setCanvasSize(window.innerWidth, window.innerHeight);
            } else {
                this._engine.setCanvasSize(this._canvasWidth, this._canvasHeight);
            }
        }
    }

    _setupInputControl() {
        // child class should provide getInputCallbacks
        this._canvasInput = new CanvasInput(
            this._canvas,
            this._getInputCallbacks()
        );
    }

    destroy() {
        this._isDestroyed = true;
        // stop rendering if running
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
        // remove window listener for fullscreen listeners
        if (this._resizeHandler) {
            window.removeEventListener("resize", this._resizeHandler);
            this._canvas.removeEventListener("fullscreenchange", this._resizeHandler);
            this._resizeHandler = null;
        }

        if (this._canvasInput) {
            this._canvasInput.removeListeners();
            this._canvasInput = null;
        }
        this._engineInitPromise.finally(() => {
            if (this._engine && !this._engine.isDeleted()) {
                this._engine.delete();
            }
            this._engine = null;
        });
    }
}