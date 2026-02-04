import { degreeToRadian } from "../math/mathUtils.js";
import ModuleBuilder from "../webassembly/equirectangular/equirectangular.js";
import { WASMViewerBase, WASM_ERROR_TYPES, WebassemblyError } from "./WASMViewerBase.js";

const DEFAULT_OPTIONS = {
    "canvasWidth": 1000,
    "canvasHeight": 1000,
    "autoRotate": false,
    "autoRotateSpeed": 1.0,
};

export const EQUIRECTANGULAR_ERROR_TYPES = {
    ...WASM_ERROR_TYPES,
    NETWORK: "NETWORK",
    DECODE: "IMAGE_DECODE",
    WEBGL: "WEBGL",
    INVALID_INPUT: "INVALID_INPUT",
    CANCELLED: "REQUEST_CANCELLED",
};

export { WebassemblyError };

export class EquirectangularViewer extends WASMViewerBase {

    // STATE
    /** 
     * @type {number | null} 
     * The ID of the current requested image loading (used to dismiss old image load requests) */
    #currentImageRequestID;
    /** 
     * @type {function | null} 
     * Stores the reject function of the currently loading image promise.
     */
    #pendingImageReject;

    /**
     * Constructor for EquirectangularViewer class.
     *
     * @param {string} canvasId - The HTML ID of the canvas.
     * @param {Object} [options={}] - Optional configuration options.
     * @param {boolean} [options.autoRotate=DEFAULT_OPTIONS["autoRotate"]] - Whether the viewer should auto-rotate.
     * @param {number} [options.autoRotateSpeed=DEFAULT_OPTIONS["autoRotateSpeed"]] - The speed of auto-rotation.
     * @param {number} [options.canvasWidth=DEFAULT_OPTIONS["canvasWidth"]] - The width of the canvas.
     * @param {number} [options.canvasHeight=DEFAULT_OPTIONS["canvasHeight"]] - The height of the canvas.
     * @throws {Error} Throws an error if the canvas element with the specified ID does not exist.
     */
    constructor(canvasId, options = {}) {
        super(canvasId, options, ModuleBuilder);
        this.#pendingImageReject = null;
        this.#currentImageRequestID = 0;
        this.autoRotate = options.autoRotate != undefined ? options.autoRotate : DEFAULT_OPTIONS["autoRotate"];
        this.autoRotateSpeed = options.autoRotateSpeed != undefined ? options.autoRotateSpeed : DEFAULT_OPTIONS["autoRotateSpeed"];
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
        if (!url || typeof url != "string") {
            throw new WebassemblyError(
                "Invalid URL provided",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT,
                    "imgUrl": url
                });
        }

        if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
            throw new WebassemblyError(
                "Invalid image dimensions provided",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT,
                    "imgUrl": url
                });
        }

        if (!this._engine) {
            await this._engineInitPromise;

            if (this._isDestroyed) {
                throw new WebassemblyError(
                    "Equirectangular Viewer is destroyed!",
                    {
                        "type": EQUIRECTANGULAR_ERROR_TYPES.DESTROYED,
                        "imgUrl": url
                    });
            }

            if (!this._engine) {
                throw new WebassemblyError(
                    "Engine failed to initialize",
                    {
                        "type": EQUIRECTANGULAR_ERROR_TYPES.INITIALIZATION,
                        "imgUrl": url
                    });
            }
        }

        this.#currentImageRequestID++;
        let currentRequestId = this.#currentImageRequestID;

        return new Promise((resolve, reject) => {
            this.#pendingImageReject = reject;
            this._engine.loadEquirectangularImage(
                url,
                width,
                height,
                () => {
                    if (this.#currentImageRequestID == currentRequestId) {
                        resolve();
                    } else {
                        reject(new WebassemblyError(
                            "New image was requested. Aborting old image.",
                            {
                                "type": EQUIRECTANGULAR_ERROR_TYPES.CANCELLED,
                                "requestId": currentRequestId,
                                "imgUrl": url
                            }));
                    }
                },
                (errorObject) => {
                    let error = new WebassemblyError(
                        errorObject.message,
                        errorObject.options
                    );
                    reject(error);
                }
            );
        });
    }

    setAutoRotate(enabled) {
        this.autoRotate = enabled;
    }

    // |-----------------|
    // | PRIVATE METHODS |
    // |-----------------|

    _beforeRender() {
        if (this.autoRotate) {
            this._engine.rotateCamera(0, degreeToRadian(this.autoRotateSpeed));
        }
    }

    // Functions that have to be implemented
    _createEngine(module) {
        return new module.EquirectangularEngine(this._canvasId);
    }

    _getInputCallbacks() {
        return {
            onRotate: (pitch, yaw) => {
                if (this._engine) {
                    this._engine.rotateCamera(degreeToRadian(pitch), degreeToRadian(yaw));
                }
            },
            onZoom: (zoomAmount) => {
                if (this._engine) {
                    this._engine.zoom(zoomAmount);
                }
            }
        };
    }
}