import ModuleBuilder from "../webassembly/mapViewer/mapViewer.js";
import { WASMViewerBase, WASM_ERROR_TYPES, WebassemblyError } from "./WASMViewerBase.js";

const MARKER_URLS = {
    "empty": "/images/markers/empty-marker.webp",
    "edit": "/images/markers/edit-marker.webp",
    "ready": "/images/markers/ready-marker.webp",
    "uploading": "/images/markers/uploading-marker.webp",
    "fov_cone": "/images/markers/cone.webp",
    "portal": "/images/markers/portal.webp"
}

const CONNECTION_TYPES = {
    "default": {
        r: 180,
        g: 100,
        b: 255,
        a: 130
    },
    "editing": {
        r: 66,
        g: 133,
        b: 244,
        a: 130
    },
    "unsaved": {
        r: 244,
        g: 0,
        b: 0,
        a: 130
    },
    "focused": {
        r: 0,
        g: 224,
        b: 255,
        a: 190
    }
}

const DEFAULT_OPTIONS = {
    "panAnimationSpeed": 4.0,
    "zoomAnimationSpeed": 1.5
}

const ZOOM_CHANGE_EPSILON = 0.0001;

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
     * @type {number} 
     * The width of the lines between the markers*/
    #connectionLineWidth
    /** 
     * @type {number} 
     * The current zoom level of the viewer [1;50]*/
    #currentZoomLevel;

    // MOVETO STATE RELATED
    /** 
     * @type {number} 
     * The target image x-coordinates to move to */
    #panTargetX;
    /** 
     * @type {number} 
     * The target image y-coordinates to move to */
    #panTargetY;
    /**
     * @type {number|null}
     * The ID given by requestAnimationFrame (used to cancel the move to animation) */
    #panAnimationId;
    /** 
     * @type {number} 
     * The time when the last pan animation occured*/
    #lastPanTime;
    /** 
     * @type {number} 
     * The speed of the pan animation*/
    #panAnimationSpeed;
    /** 
     * @type {number} 
     * The speed of the zoom animation */
    #zoomAnimationSpeed;
    /** 
     * @type {number} 
     * Previous image x-coordinates remaining to the target move to */
    #lastRemainingX;
    /** 
     * @type {number} 
     * Previous image y-coordinates remaining to the target move to */
    #lastRemainingY;
    /** 
     * @type {number} 
     * The last movement x amount used to cancel the loop if the movement is blocked by the boundaries of the map */
    #lastStepX;
    /** 
     * @type {number} 
     * The last movement y amount used to cancel the loop if the movement is blocked by the boundaries of the map */
    #lastStepY;
    /** 
     * @type {number} 
     * The target zoom level of the moveTo function */
    #panTargetZoomLevel;

    /**
     * Constructor for MapViewer class.
     *
     * @param {string} canvasId - The HTML ID of the canvas.
     * @param {Object} [options={}] - Optional configuration options.
     * @param {number} [options.canvasWidth=DEFAULT_OPTIONS["canvasWidth"]] - The width of the canvas.
     * @param {number} [options.canvasHeight=DEFAULT_OPTIONS["canvasHeight"]] - The height of the canvas.
     * @param {number} [options.panAnimationSpeed=DEFAULT_OPTIONS["panAnimationSpeed"]] - The speed of the pan animation
     * @param {number} [options.zoomAnimationSpeed=DEFAULT_OPTIONS["zoomAnimationSpeed"]] - The speed of the zoom animation
     * @throws {Error} Throws an error if the canvas element with the specified ID does not exist.
     */
    constructor(canvasId, options = {}) {
        super(canvasId, options, ModuleBuilder);
        this.#currentImageRequestID = 0;
        this.#imageWidth = 0;
        this.#imageHeight = 0;
        this.#markerCache = {};
        this.#connectionLineWidth = 2.5;
        this.#panTargetX = 0;
        this.#panTargetY = 0;
        this.#currentZoomLevel = 1.0;
        this.#panTargetZoomLevel = null;
        this.#panAnimationId = null;
        this.#lastPanTime = 0;
        this.#panAnimationSpeed = options.panAnimationSpeed ? options.panAnimationSpeed : DEFAULT_OPTIONS.panAnimationSpeed;
        this.#zoomAnimationSpeed = options.zoomAnimationSpeed ? options.zoomAnimationSpeed : DEFAULT_OPTIONS.zoomAnimationSpeed;

        this.#cacheMarker("uploading", MARKER_URLS["uploading"]);
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
                if (imageX < this.#imageWidth && imageY < this.#imageHeight) {
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

        let valid = this.checkCoordinateValid(imageX, imageY);
        if (!valid.correct) {
            throw new WebassemblyError(valid.error, {
                "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
            });
        }

        let markerUrl = this.#getMarkerUrl(type);

        this._engine.placeMarkerByImageCoordinates(id, imageX, imageY, markerUrl, width, height);
    }

    placeMarkerByUV(id, u, v, width, height, type = "empty") {
        this._ensureEngineReady();

        if (Number.isNaN(id)) {
            throw new WebassemblyError(
                "Invalid ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (!Number.isFinite(u) || !Number.isFinite(v) || u < 0 || u >= 1 || v < 0 || v >= 1) {
            throw new WebassemblyError(
                "Invalid UV coordinates",
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
        this._engine.addMarkerByUV(id, u, v, markerUrl, width, height);
    }

    uvToImageCoordinates(u, v) {
        this._ensureEngineReady();

        if (!Number.isFinite(u) || !Number.isFinite(v)) {
            throw new WebassemblyError(
                "Invalid UV coordinates",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        return {
            x: Math.floor(u * this.#imageWidth),
            y: Math.floor(v * this.#imageHeight)
        };
    }

    imageToUVCoordinates(imageX, imageY) {
        this._ensureEngineReady();

        let valid = this.checkCoordinateValid(imageX, imageY);
        if (!valid.correct) {
            throw new WebassemblyError(valid.error, {
                "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
            });
        }

        return {
            u: imageX / this.#imageWidth,
            v: imageY / this.#imageHeight
        };
    }

    resizeMarker(id, width, height) {
        this._ensureEngineReady();

        if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0) {
            throw new WebassemblyError(
                "Invalid marker size",
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

        this._engine.resizeMarker(id, width, height);
    }

    clearLines() {
        this._ensureEngineReady();
        this._engine.clearAllLines();
    }

    clearMarkersAndLines() {
        this._ensureEngineReady();
        this._engine.clearAllMarkers();
        this._engine.clearAllLines();
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

        let returnValue = false;
        if (Number.isInteger(id)) {
            returnValue = this._engine.doesMarkerExist(id);
        }

        return returnValue;
    }

    doesLineExist(id) {
        this._ensureEngineReady();

        if (!Number.isInteger(id)) {
            throw new WebassemblyError(
                "Invalid line ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        return this._engine.doesLineExist(id);
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

        let valid = this.checkCoordinateValid(imageX, imageY);
        if (!valid.correct) {
            throw new WebassemblyError(valid.error, {
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

        this._engine.moveMarkerToImageCoordinates(id, imageX, imageY);
    }

    moveMarkerToUV(id, u, v) {
        this._ensureEngineReady();

        if (!Number.isFinite(u) || !Number.isFinite(v) || u < 0 || u >= 1 || v < 0 || v >= 1) {
            throw new WebassemblyError(
                "Invalid UV coordinates",
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

        this._engine.moveMarkerToUV(id, u, v);
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

    removeLine(id) {
        this._ensureEngineReady();

        if (!this.doesLineExist(id)) {
            throw new WebassemblyError(
                "Invalid line ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.removeLine(id);
    }

    isAlreadyConnected(id1, id2) {
        this._ensureEngineReady();

        if (!this.doesMarkerExist(id1) || !this.doesMarkerExist(id2)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        return this._engine.isAlreadyConnected(id1, id2);
    }

    connectMarkers(id1, id2, lineId, type = "default") {
        this._ensureEngineReady();

        if (!this.doesMarkerExist(id1) || !this.doesMarkerExist(id2)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (this.doesLineExist(lineId)) {
            throw new WebassemblyError(
                "Line with given ID already exists",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (this.isAlreadyConnected(id1, id2)) {
            throw new WebassemblyError(
                "There is already a connection between these markers",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }
        let connectionColor = CONNECTION_TYPES[type] ? CONNECTION_TYPES[type] : CONNECTION_TYPES["default"];

        this._engine.connectMarkers(id1, id2, lineId, this.#connectionLineWidth, connectionColor.r, connectionColor.g, connectionColor.b, connectionColor.a);
    }

    setMarkerSelectable(id, selectable) {
        this._ensureEngineReady();

        if (!this.doesMarkerExist(id)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.setMarkerSelectable(id, selectable);
    }

    setMarkerFixedToMap(id, fixedToMap) {
        this._ensureEngineReady();

        if (!this.doesMarkerExist(id)) {
            throw new WebassemblyError(
                "Invalid marker ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (typeof fixedToMap != "boolean") {
            throw new WebassemblyError(
                "Invalid fixedToMap value",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.setMarkerFixedToMap(id, fixedToMap);
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

    changeLineType(lineId, type) {
        this._ensureEngineReady();
        if (!this.doesLineExist(lineId)) {
            throw new WebassemblyError(
                "Invalid line ID",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }
        let connectionColor = CONNECTION_TYPES[type] ? CONNECTION_TYPES[type] : CONNECTION_TYPES["default"];
        this._engine.changeLineColor(lineId, connectionColor.r, connectionColor.g, connectionColor.b, connectionColor.a);
    }

    onClickHandler = (cursorX, cursorY) => {
        this.placeMarker(cursorX, cursorY);
    }

    getZoomLevel() {
        this._ensureEngineReady();

        return this._engine.getZoomLevel();
    }

    moveTo(imageX, imageY, targetZoomLevel = null) {
        this._ensureEngineReady();
        this.canvasInput.stopMomentum();

        if (Number.isNaN(imageX) || Number.isNaN(imageY) || imageX < 0 || imageY < 0) {
            throw new WebassemblyError(
                "Invalid marker location",
                {
                    "type": MAP_VIEWER_ERROR_TYPES.INVALID_INPUT
                });
        }

        this.#panTargetX = imageX;
        this.#panTargetY = imageY;
        this.#panTargetZoomLevel = targetZoomLevel;
        this.#currentZoomLevel = this._engine.getZoomLevel();

        this.#lastRemainingX = undefined;
        this.#lastRemainingY = undefined;
        this.#lastStepX = undefined;
        this.#lastStepY = undefined;

        if (this.#panAnimationId == null) {
            this.#lastPanTime = performance.now();
            this.#panAnimationId = requestAnimationFrame(this.#animatePan);
        }
    }

    cancelPanAnimation() {
        if (this.#panAnimationId != null) {
            cancelAnimationFrame(this.#panAnimationId);
            this.#panAnimationId = null;
        }
    }

    async cacheMarkers() {
        let promises = [];

        for (const type in MARKER_URLS) {
            promises.push(this.#cacheMarker(type, MARKER_URLS[type]));
        }

        await Promise.all(promises);
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
        let lowerType = type.toLowerCase();
        if (!this.#markerCache[lowerType]) {
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
    }

    #animatePan = () => {
        let now = performance.now();
        let deltaTime = (now - this.#lastPanTime) / 1000;
        this.#lastPanTime = now;

        // distance to to the target in image coordinates
        let offset = this._engine.getCenterOffsetByImageCoords(this.#panTargetX, this.#panTargetY);
        let remainingX = offset.x;
        let remainingY = offset.y;

        let remainingZoom = 0;
        if (this.#panTargetZoomLevel) {
            remainingZoom = (this.#panTargetZoomLevel - this._engine.getZoomLevel()) / 0.01;
        }

        // check if we are blocked by boundaires
        let blockedX = false;
        let blockedY = false;
        if (this.#lastRemainingX != undefined && this.#lastRemainingY != undefined) {
            let movedX = Math.abs(this.#lastRemainingX - remainingX);
            let movedY = Math.abs(this.#lastRemainingY - remainingY);

            // if we wanted to move atleast 0.5 pixels but could only move less than 0.1 pixel then it is blocked by map boundaries
            if (Math.abs(this.#lastStepX) > 0.5 && movedX < 0.1) {
                blockedX = true
            };
            if (Math.abs(this.#lastStepY) > 0.5 && movedY < 0.1) {
                blockedY = true
            };
        }

        let closeX = Math.abs(remainingX) < 1.0;
        let closeY = Math.abs(remainingY) < 1.0;
        let closeZoom = Math.abs(remainingZoom) < 0.001;

        // we stop if the zoom is close AND
        // 1. both is 1 pixel or less to the target
        // 2. one is close to the target and other is also close or blocked
        // 3. both of them are blocked
        if (closeZoom && (closeX || blockedX) && (closeY || blockedY)) {
            // if it is not blocked move the last remaining distance
            let finalStepX = blockedX ? 0 : remainingX;
            let finalStepY = blockedY ? 0 : remainingY;
            let finalStepZoom = remainingZoom;

            if (finalStepX != 0 || finalStepY != 0) {
                this._engine.moveMap(finalStepX, finalStepY);
            }
            if (finalStepZoom != 0) {
                this._engine.zoomMapToCenter(finalStepZoom);
            }

            this.#panTargetZoomLevel = null;
            this.#panAnimationId = null;
        } else {
            // ease out curve
            let panTimeAndSpeedFactor = 1 - Math.exp(-this.#panAnimationSpeed * deltaTime);
            let zoomTimeAndSpeedFactor = 1 - Math.exp(-this.#zoomAnimationSpeed * deltaTime);

            // only try to move if it is not blocked
            let stepX = blockedX ? 0 : (remainingX * panTimeAndSpeedFactor);
            let stepY = blockedY ? 0 : (remainingY * panTimeAndSpeedFactor);
            let stepZoom = remainingZoom * zoomTimeAndSpeedFactor;

            this.#lastRemainingX = remainingX;
            this.#lastRemainingY = remainingY;
            this.#lastStepX = stepX;
            this.#lastStepY = stepY;

            if (stepX != 0 || stepY != 0) {
                this._engine.moveMap(stepX, stepY);
            }

            if (stepZoom != 0) {
                this._engine.zoomMapToCenter(stepZoom);
            }

            this.#panAnimationId = requestAnimationFrame(this.#animatePan);
        }
    }

    // functions that children classes have to implement
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
                this.cancelPanAnimation();
                this._engine.moveMap(deltaX, deltaY);
            },
            onZoom: (zoomAmount, cursorX, cursorY) => {
                this._ensureEngineReady();
                this.cancelPanAnimation();
                let prevZoomLevel = this._engine.getZoomLevel();
                this._engine.zoomMap(zoomAmount, cursorX, cursorY);
                let newZoomLevel = this._engine.getZoomLevel();
                return !(Math.abs(newZoomLevel - prevZoomLevel) < ZOOM_CHANGE_EPSILON);
            },
            onClick: (cursorX, cursorY) => {
                this.cancelPanAnimation();
                this.onClickHandler(cursorX, cursorY);
            }
        };
    }
}
