import ModuleBuilder from "../webassembly/mapViewer/mapViewer.js";
import { WASMViewerBase, WASM_ERROR_TYPES, WebassemblyError } from "./WASMViewerBase.js";

const MARKER_URLS = {
    "empty": "/images/markers/empty-marker.webp",
    "edit": "/images/markers/edit-marker.webp",
    "ready": "/images/markers/ready-marker.webp",
    "uploading": "/images/markers/uploading-marker.webp",
    "fov_cone": "/images/markers/cone.webp"
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
    /** 
     * @type {Object} 
     * An object where the keys are the typey and the values are the cached marker URLS*/
    #markerCache

    /**
     * Constructor for MapViewer class.
     *
     * @param {string} canvasId - The HTML ID of the canvas.
     * @param {Object} [options={}] - Optional configuration options.
     * @param {number} [options.canvasWidth=DEFAULT_OPTIONS["canvasWidth"]] - The width of the canvas.
     * @param {number} [options.canvasHeight=DEFAULT_OPTIONS["canvasHeight"]] - The height of the canvas.
     * @throws {Error} Throws an error if the canvas element with the specified ID does not exist.
     */
    constructor(canvasId, options = {}) {
        super(canvasId, options, ModuleBuilder);
        this.#currentImageRequestID = 0;
        this.#imageWidth = 0;
        this.#imageHeight = 0;
        this.#markerCache = {};

        this.#cacheMarkers();
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
            if (imageX >= 0 && imageY >= 0) {
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

    rotateMarker(id, angleInRadians) {
        this._ensureEngineReady();
        this._engine.rotateMarker(id, angleInRadians);
    }

    getMarkerPosition(id) {
        this._ensureEngineReady();

        if (!this.doesMarkerExist(id)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        return this._engine.getMarkerPosition(id);
    }

    placeMarker(id, locationX, locationY, width, height, type = "empty") {
        this._ensureEngineReady();

        if (Number.isNaN(id)) {
            throw new WebassemblyError(
                "Invalid ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (Number.isNaN(locationX) || Number.isNaN(locationY) || locationX < 0 || locationY < 0) {
            throw new WebassemblyError(
                "Invalid marker location",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (Number.isNaN(width) || Number.isNaN(height) || width < 0 || height < 0) {
            throw new WebassemblyError(
                "Invalid marker size",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (this.doesMarkerExist(id)) {
            throw new WebassemblyError(
                "Point with given ID already exists",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        let markerUrl = this.#getMarkerUrl(type);

        this._engine.addMarker(id, locationX, locationY, markerUrl, width, height);
    }

    placeMarkerByImageCoordinates(id, imageX, imageY, width, height, type = "empty") {
        this._ensureEngineReady();

        if (Number.isNaN(id)) {
            throw new WebassemblyError(
                "Invalid ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (Number.isNaN(imageX) || Number.isNaN(imageY) || imageX < 0 || imageY < 0) {
            throw new WebassemblyError(
                "Invalid marker location",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        let markerUrl = this.#getMarkerUrl(type);

        this._engine.placeMarkerByImageCoordinates(id, imageX, imageY, markerUrl, width, height);
    }

    clearMarkers() {
        this._ensureEngineReady();
        this._engine.clearAllMarkers();
    }

    getMarkerAtClick(cursorX, cursorY) {
        this._ensureEngineReady();

        if (Number.isNaN(cursorX) || Number.isNaN(cursorY) || cursorX < 0 || cursorY < 0) {
            throw new WebassemblyError(
                "Invalid marker location",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        return this._engine.getMarkerIdAtScreenCoords(cursorX, cursorY);
    }

    doesMarkerExist(id) {
        this._ensureEngineReady();

        if (!Number.isInteger(id)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        return this._engine.doesMarkerExist(id);
    }

    changeMarkerType(id, type) {
        this._ensureEngineReady();

        let markerUrl = this.#getMarkerUrl(type);

        if (!this.doesMarkerExist(id)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.changeMarkerTexture(id, markerUrl);
    }

    moveMarker(id, locationX, locationY) {
        this._ensureEngineReady();

        if (Number.isNaN(locationX) || Number.isNaN(locationY) || locationX < 0 || locationY < 0) {
            throw new WebassemblyError(
                "Invalid marker location",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (!this.doesMarkerExist(id)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.moveMarkerToScreen(id, locationX, locationY);
    }

    moveMarkerToImageCoordinates(id, imageX, imageY) {
        this._ensureEngineReady();

        if (!this.doesMarkerExist(id)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.moveMarkerToImageCoordinates(id, imageX, imageY);
    }

    removeMarker(id) {
        this._ensureEngineReady();

        if (!this.doesMarkerExist(id)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.removeMarker(id);
    }

    changeMarkerId(oldId, newId) {
        this._ensureEngineReady();

        if (!this.doesMarkerExist(oldId)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (!Number.isInteger(newId)) {
            throw new WebassemblyError(
                "Invalid new marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.changeMarkerId(oldId, newId);
    }

    onClickHandler = (cursorX, cursorY) => {
        this.placeMarker(cursorX, cursorY);
    }

    // |-----------------|
    // | PRIVATE METHODS |
    // |-----------------|
    #getMarkerUrl(type) {
        let markerURL;
        if (!type || typeof type != "string") {
            throw new WebassemblyError(
                "Invalid marker type",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }
        let lowerType = type.toLowerCase();

        // Check Cache first
        if (this.#markerCache[lowerType]) {
            markerURL = this.#markerCache[lowerType];
        } else {
            markerURL = MARKER_URLS[lowerType];
        }

        if (!markerURL) {
            throw new WebassemblyError(
                "Invalid marker type",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }
        return markerURL;
    }

    async #cacheMarker(type, url) {
        try {
            let response = await fetch(url);
            if (!response.ok) {
                throw new Error("Marker failed to load: " + url);
            }
            let blob = await response.blob();
            let markerURL = URL.createObjectURL(blob);
            this.#markerCache[type] = markerURL;
        } catch (error) {
            console.error("Marker caching failed:", error);
        }
    }

    async #cacheMarkers() {
        let promises = [];

        for (const type in MARKER_URLS) {
            promises.push(this.#cacheMarker(type, MARKER_URLS[type]));
        }

        await Promise.all(promises);
    }

    // Functions that have to be implemented
    _createEngine(module) {
        return new module.MapViewerEngine(
            this._canvasId,
            this._canvasWidth, this._canvasHeight
        );
    }

    _getInputCallbacks() {
        return {
            "mode": "2D",
            "defaultCursor": "default",
            "grabbingCursor": "move",
            onRotate: (deltaX, deltaY) => {
                this._ensureEngineReady();
                this._engine.moveMap(deltaX, deltaY);
            },
            onZoom: (zoomAmount, cursorX, cursorY) => {
                this._ensureEngineReady();
                this._engine.zoomMap(zoomAmount, cursorX, cursorY);
            },
            onClick: (cursorX, cursorY) => {
                this.onClickHandler(cursorX, cursorY);
            }
        };
    }
}
