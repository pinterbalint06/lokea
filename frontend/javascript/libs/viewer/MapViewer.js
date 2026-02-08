import ModuleBuilder from "../webassembly/mapViewer/mapViewer.js";
import { WASMViewerBase, WASM_ERROR_TYPES, WebassemblyError } from "./WASMViewerBase.js";

const DEFAULT_OPTIONS = {
    "markerUrl": "/images/marker.webp"
}

export const MAP_VIEWER_ERROR_TYPES = {
    ...WASM_ERROR_TYPES,
    INVALID_INPUT: "INVALID_INPUT",
    CANCELLED: "REQUEST_CANCELLED"
};

export { WebassemblyError };


export class MapViewer extends WASMViewerBase {
    // STATE
    /** 
     * @type {number | null} 
     * The ID of the current requested image loading (used to dismiss old image load requests) */
    #currentImageRequestID;
    /** 
     * @type {number} 
     * The width of the current image*/
    #imageWidth;
    /** 
     * @type {number} 
     * The height of the current image*/
    #imageHeight;

    // MARKER
    /**
     * @type {string}
     * The URL of the marker.
     */
    #markerURL

    /**
     * Constructor for MapViewer class.
     *
     * @param {string} canvasId - The HTML ID of the canvas.
     * @param {Object} [options={}] - Optional configuration options.
     * @param {number} [options.canvasWidth=DEFAULT_OPTIONS["canvasWidth"]] - The width of the canvas.
     * @param {number} [options.canvasHeight=DEFAULT_OPTIONS["canvasHeight"]] - The height of the canvas.
     * @param {number} [options.markerUrl=DEFAULT_OPTIONS["markerUrl"]] - The URL of the image of the marker.
     * @throws {Error} Throws an error if the canvas element with the specified ID does not exist.
     */
    constructor(canvasId, options = {}) {
        super(canvasId, options, ModuleBuilder);
        this.#currentImageRequestID = 0;
        this.#markerURL = options.markerUrl != undefined ? options.markerUrl : DEFAULT_OPTIONS["markerUrl"];
        this.#imageWidth = 0;
        this.#imageHeight = 0;
    }

    // |------------------|
    // | PUBLIC FUNCTIONS |
    // |------------------|
    async loadMap(url, width, height) {
        if (!url || typeof url != "string") {
            throw new WebassemblyError(
                "Invalid URL provided",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT,
                    "imgUrl": url
                });
        }

        if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
            throw new WebassemblyError(
                "Invalid image dimensions provided",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT,
                    "imgUrl": url
                });
        }

        if (!this._engine) {
            await this._engineInitPromise;

            if (this._isDestroyed) {
                throw new WebassemblyError(
                    "Map Viewer is destroyed!",
                    {
                        "type": MAP_VIEWER_ERROR_TYPES.DESTROYED,
                        "imgUrl": url
                    });
            }

            if (!this._engine) {
                throw new WebassemblyError(
                    "Engine failed to initialize",
                    {
                        "type": MAP_VIEWER_ERROR_TYPES.INITIALIZATION,
                        "imgUrl": url
                    });
            }
        }

        this.#currentImageRequestID++;
        let currentRequestId = this.#currentImageRequestID;

        return new Promise((resolve, reject) => {
            this._engine.loadMapPromise(
                url,
                width,
                height,
                () => {
                    if (!this._isDestroyed) {
                        if (this.#currentImageRequestID == currentRequestId) {
                            this.#imageWidth = width;
                            this.#imageHeight = height;
                            resolve();
                        } else {
                            reject(new WebassemblyError(
                                "New image was requested. Aborting old image.",
                                {
                                    "type": MAP_VIEWER_ERROR_TYPES.CANCELLED,
                                    "requestId": currentRequestId,
                                    "imgUrl": url
                                }));
                        }
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

    checkCoordinateValid(imageX, imageY) {
        let returnObject = {
            correct: false
        };
        if (Number.isInteger(imageX) && Number.isInteger(imageY)) {
            if (imageX > 0 && imageY > 0) {
                if (imageX <= this.#imageWidth && imageY <= this.#imageHeight) {
                    returnObject.correct = true;
                } else {
                    returnObject.error = "A koordinátáknak kisebbnek kell lennie mint a kép méretei!";
                }
            } else {
                returnObject.error = "A koordinátáknak nagyobbnak kell lennie mint 0!";
            }
        } else {
            returnObject.error = "A koordinátáknak egész számnak kell lenniük!";
        }
        return returnObject;
    }

    getMarkerPosition() {
        if (this._isDestroyed) {
            throw new WebassemblyError(
                "Map Viewer is destroyed!",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.DESTROYED
                });
        }

        if (this._engine) {
            return this._engine.getMarkerPosition();
        } else {
            throw new WebassemblyError(
                "Engine not initialized yet",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INITIALIZATION
                });
        }
    }

    placeMarker(locationX, locationY) {
        if (this._isDestroyed) {
            throw new WebassemblyError(
                "Map Viewer is destroyed!",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.DESTROYED
                });
        }

        if (this._engine) {
            this._engine.placeMarker(locationX, locationY);
        } else {
            throw new WebassemblyError(
                "Engine not initialized yet",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INITIALIZATION
                });
        }
    }

    placeMarkerToImageCoordinates(imageX, imageY) {
        if (this._isDestroyed) {
            throw new WebassemblyError(
                "Map Viewer is destroyed!",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.DESTROYED
                });
        }

        if (this._engine) {
            this._engine.placeMarkerByImageCoordinates(imageX, imageY);
        } else {
            throw new WebassemblyError(
                "Engine not initialized yet",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INITIALIZATION
                });
        }
    }

    onClickHandler = (cursorX, cursorY) => {
        this.placeMarker(cursorX, cursorY);
    }


    // |-----------------|
    // | PRIVATE METHODS |
    // |-----------------|
    // Functions that have to be implemented
    _createEngine(module) {
        return new module.MapViewerEngine(
            this._canvasId,
            this._canvasWidth, this._canvasHeight,
            this.#markerURL
        );
    }

    _getInputCallbacks() {
        return {
            "mode": "2D",
            "defaultCursor": "default",
            "grabbingCursor": "move",
            onRotate: (deltaX, deltaY) => {
                if (this._engine) {
                    this._engine.moveMap(deltaX, deltaY);
                }
            },
            onZoom: (zoomAmount, cursorX, cursorY) => {
                if (this._engine) {
                    this._engine.zoomMap(zoomAmount, cursorX, cursorY);
                }
            },
            onClick: (cursorX, cursorY) => {
                this.onClickHandler(cursorX, cursorY);
            }
        };
    }
}
