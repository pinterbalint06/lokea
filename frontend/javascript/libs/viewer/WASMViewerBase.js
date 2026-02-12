import { CanvasInput } from "./CanvasInput.js";

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
     * @type {number}
     * The width of the canvas when not in fullscreen */
    _windowedWidth;
    /**
     * @type {number}
     * The height of the canvas when not in fullscreen */
    _windowedHeight;
    /**
     * @type {CanvasInput}
     * - Handles rotating and zooming */
    canvasInput;
    /**
     * @type {ResizeObserver}
     * Handles element resizing.
     */
    _resizeObserver;
    /**
     * @type {number|null}
     * ID for the resize frame
     */
    _resizeAnimationFrame;
    /**
     * @type {function}
     * Handles exiting fullscreen.
     */
    _fullscreenHandler;

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
    /**
     * @type {boolean}
     * Flag indicating if the viewer thinks it is in fullscreen
     */
    _isFullscreen;

    constructor(canvasId, options = {}, ModuleBuilder) {
        this._canvasId = canvasId;
        this._canvas = document.getElementById(canvasId);

        if (this._canvas) {
            if (ModuleBuilder && typeof ModuleBuilder == "function") {
                // initialize class variables
                this._canvasWidth = options.canvasWidth != undefined ? options.canvasWidth : this._canvas.clientWidth;
                this._canvasHeight = options.canvasHeight != undefined ? options.canvasHeight : this._canvas.clientHeight;

                this._canvas.width = this._canvasWidth;
                this._canvas.height = this._canvasHeight;

                this._windowedWidth = this._canvasWidth;
                this._windowedHeight = this._canvasHeight;

                this._resizeObserver = null;
                this._resizeAnimationFrame = null;

                // State related
                this._engine = null;
                this._isDestroyed = false;
                this._animationFrameId = null;
                this._ModuleBuilder = ModuleBuilder;
                this._isFullscreen = false;

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

    _ensureEngineReady() {
        if (this._isDestroyed) {
            throw new WebassemblyError(
                "Map Viewer is destroyed!",
                {
                    type: MAP_VIEWER_ERROR_TYPES.DESTROYED
                });
        }
        if (!this._engine) {
            throw new WebassemblyError(
                "Engine not initialized yet",
                {
                    type: MAP_VIEWER_ERROR_TYPES.INITIALIZATION
                });
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

                    this._postInitialize();

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

    async setCanvasSize(width, height) {
        width = Math.floor(width);
        height = Math.floor(height);

        if (!Number.isInteger(width) || !Number.isInteger(height) || width < 0 || height < 0) {
            throw new WebassemblyError(
                "Invalid image dimensions provided",
                {
                    "type": WASM_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (!this._engine) {
            await this._engineInitPromise;

            if (this._isDestroyed) {
                throw new WebassemblyError(
                    "WASM Viewer is destroyed!",
                    {
                        "type": WASM_ERROR_TYPES.DESTROYED
                    });
            }

            if (!this._engine) {
                throw new WebassemblyError(
                    "Engine failed to initialize",
                    {
                        "type": WASM_ERROR_TYPES.INITIALIZATION
                    });
            }
        }

        if (this._canvasWidth != width || this._canvasHeight != height) {
            this._canvasWidth = width;
            this._canvasHeight = height;

            this._engine.setCanvasSize(this._canvasWidth, this._canvasHeight);

            this._beforeRender();
            this._engine.render();
        }
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

    // Children class can implement this
    // function that is called after initialization but before starting the rendering loop
    _postInitialize() {

    }

    _renderLoop = () => {
        this._ensureEngineReady();
        this._beforeRender();
        this._engine.render();

        this._animationFrameId = requestAnimationFrame(this._renderLoop);
    }

    async toggleFullscreen() {
        if (!document.fullscreenElement) {
            // before entering save windowed size
            this._windowedWidth = this._canvasWidth;
            this._windowedHeight = this._canvasHeight;
            await this._canvas.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    }

    _setupResizeHandlers() {
        this._resizeObserver = new ResizeObserver((entries) => {
            if (entries && entries.length > 0) {
                let entry = entries[0];

                if (this._resizeAnimationFrame) {
                    cancelAnimationFrame(this._resizeAnimationFrame);
                }

                this._resizeAnimationFrame = requestAnimationFrame(() => {
                    this._handleResize(entry);
                    this._resizeAnimationFrame = null;
                });
            }
        });

        this._resizeObserver.observe(this._canvas);

        this._fullscreenHandler = () => {
            this._handleFullscreen();
        };
        this._canvas.addEventListener("fullscreenchange", this._fullscreenHandler);
    }

    _handleFullscreen() {
        this._isFullscreen = document.fullscreenElement == this._canvas;

        // if exited fullscreen revert to windowed size
        if (!this._isFullscreen) {
            this.setCanvasSize(this._windowedWidth, this._windowedHeight);
        }
    }

    _handleResize(entry) {
        this._ensureEngineReady();
        if (this._isFullscreen) {
            this.setCanvasSize(window.innerWidth, window.innerHeight);
        } else {
            let width, height;

            if (entry) {
                // contentrec is the content's size no margin border
                width = entry.contentRect.width;
                height = entry.contentRect.height;
            } else {
                width = this._canvas.clientWidth;
                height = this._canvas.clientHeight;
            }

            this.setCanvasSize(width, height);
        }
    }

    _setupInputControl() {
        // child class should provide getInputCallbacks
        this.canvasInput = new CanvasInput(
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

        if (this._resizeAnimationFrame) {
            cancelAnimationFrame(this._resizeAnimationFrame);
            this._resizeAnimationFrame = null;
        }

        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }

        if (this._fullscreenHandler) {
            this._canvas.removeEventListener("fullscreenchange", this._fullscreenHandler);
            this._fullscreenHandler = null;
        }

        if (this.canvasInput) {
            this.canvasInput.removeListeners();
            this.canvasInput = null;
        }
        this._engineInitPromise.finally(() => {
            if (this._engine && !this._engine.isDeleted()) {
                this._engine.delete();
            }
            this._engine = null;
        });
    }
}