import { degreeToRadian, normalizeAngleRadians } from "../math/mathUtils.js";
import ModuleBuilder from "../webassembly/equirectangular/equirectangular.js";
import { WASMViewerBase, WASM_ERROR_TYPES, WebassemblyError } from "./WASMViewerBase.js";
import { AnimationHelper } from "./AnimationHelper.js";

const DEFAULT_OPTIONS = {
    "autoRotate": false,
    "autoRotateSpeed": 1.0,
    "transitionDuration": 700,
    "transitionMaxBlur": 6.0,
    "transitionMoveDistance": 6.0
};

export const EQUIRECTANGULAR_ERROR_TYPES = {
    ...WASM_ERROR_TYPES,
    NETWORK: "NETWORK",
    DECODE: "IMAGE_DECODE",
    WEBGL: "WEBGL",
    INVALID_INPUT: "INVALID_INPUT",
    CANCELLED: "REQUEST_CANCELLED"
};

export { WebassemblyError };

export class EquirectangularViewer extends WASMViewerBase {
    // STATE
    /** 
     * @type {number | null} 
     * The ID of the current requested image loading (used to dismiss old image load requests) */
    #currentImageRequestID;

    /** 
     * @type {number} 
     * The north offset for the image radians */
    #imageNorthDirection;

    #activeTransition;
    #transitionID;
    #isTransitionManagedLoad;

    #arrowHeadings;

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
        this.#currentImageRequestID = 0;

        this.#activeTransition = null;
        this.#transitionID = 0;
        this.#isTransitionManagedLoad = false;

        this.#imageNorthDirection = 0.0;

        this.autoRotate = options.autoRotate != undefined ? options.autoRotate : DEFAULT_OPTIONS["autoRotate"];
        this.autoRotateSpeed = options.autoRotateSpeed != undefined ? options.autoRotateSpeed : DEFAULT_OPTIONS["autoRotateSpeed"];

        this.transitionDuration = options.transitionDuration != undefined ? options.transitionDuration : DEFAULT_OPTIONS["transitionDuration"];
        this.transitionMaxBlur = options.transitionMaxBlur != undefined ? options.transitionMaxBlur : DEFAULT_OPTIONS["transitionMaxBlur"];
        this.transitionMoveDistance = options.transitionMoveDistance != undefined ? options.transitionMoveDistance : DEFAULT_OPTIONS["transitionMoveDistance"];

        this._arrowCallbacks = {};
        this.#arrowHeadings = {};
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
     * @param {number} [imageNorthDirection=0.0] - The north direction of the image in radians.
     * @returns {Promise<void>} Resolves when the image is successfully loaded, rejects if loading fails or a new image is requested.
     * @throws {Error} If the viewer is destroyed or the engine fails to initialize.
     */
    async loadImage(url, width, height, imageNorthDirection = 0.0) {
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

        if (!Number.isFinite(imageNorthDirection)) {
            throw new WebassemblyError(
                "Invalid north direction provided",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT,
                    "imgUrl": url
                });
        }

        await this._ensureEngineReadyAsync();

        if (!this.#isTransitionManagedLoad) {
            this.#cancelTransition("Image load interrupted active transition.");
        }

        this.#currentImageRequestID++;
        let currentRequestId = this.#currentImageRequestID;

        let currentAbsoluteHeading = this.getHeading();

        return new Promise((resolve, reject) => {
            this._engine.loadEquirectangularImage(
                url,
                width,
                height,
                () => {
                    if (!this._isDestroyed) {
                        if (this.#currentImageRequestID == currentRequestId) {
                            this.setNorthDirection(imageNorthDirection);

                            this.setHeading(currentAbsoluteHeading);
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

    getHeading() {
        this._ensureEngineReady();

        return this.#yawToHeading(this._engine.yaw);
    }

    setHeading(targetAbsoluteHeadingRadians) {
        this._ensureEngineReady();

        if (!Number.isFinite(targetAbsoluteHeadingRadians)) {
            throw new WebassemblyError(
                "Invalid absolute heading",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.yaw = this.#headingToYaw(targetAbsoluteHeadingRadians);
    }

    setNorthDirection(imageNorthDirectionRadians) {
        this._ensureEngineReady();

        if (!Number.isFinite(imageNorthDirectionRadians)) {
            throw new WebassemblyError(
                "Invalid north direction",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        this.#imageNorthDirection = imageNorthDirectionRadians;

        for (const id in this.#arrowHeadings) {
            const absoluteYaw = this.#headingToYaw(this.#arrowHeadings[id]);
            this._engine.changeArrowDirection(parseInt(id), absoluteYaw);
        }
    }

    async clearImage() {
        await this._ensureEngineReadyAsync();

        if (!this.#isTransitionManagedLoad) {
            this.#cancelTransition("Image cleared during active transition.");
        }

        this.#currentImageRequestID++;

        this._engine.clearImage();
    }

    async animateDirection(arrowYaw, onLoad) {
        await this._ensureEngineReadyAsync();

        if (!Number.isFinite(arrowYaw)) {
            throw new WebassemblyError("Invalid arrow yaw", {
                "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT,
                "arrowYaw": arrowYaw
            });
        }

        if (typeof onLoad != "function") {
            throw new WebassemblyError("Invalid load callback", {
                "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
            });
        }

        this.#cancelTransition("New transition requested.");

        this.canvasInput.stopMomentum();

        this.#transitionID++;
        let currentId = this.#transitionID;
        const absoluteHeading = this.#yawToHeading(arrowYaw);

        const { promise, resolve, reject } = Promise.withResolvers();

        this.#activeTransition = {
            id: currentId,
            helper: new AnimationHelper(
                currentId, this.transitionDuration,
                this.transitionMaxBlur, this.transitionMoveDistance
            ),
            absoluteHeading,
            settled: false,
            resolve,
            reject
        };

        this.#isTransitionManagedLoad = true;

        try {
            const markAsLoaded = () => {
                if (this.#activeTransition?.id == currentId) {
                    this.#activeTransition.helper.loadCompleted();
                }
            };
            await onLoad(markAsLoaded);
            markAsLoaded();
        } catch (error) {
            if (this.#activeTransition?.id == currentId) {
                this.#cancelTransition("Image load failed during transition.");
            }
        } finally {
            if (this.#activeTransition?.id == currentId) {
                this.#isTransitionManagedLoad = false;
            }
        }

        return promise;
    }

    setAutoRotate(enabled) {
        this.autoRotate = enabled;
    }

    getYaw() {
        this._ensureEngineReady();
        return this._engine.yaw;
    }

    setYaw(yaw) {
        this._ensureEngineReady();

        if (!Number.isFinite(yaw)) {
            throw new WebassemblyError(
                "Invalid yaw",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.yaw = yaw;
    }

    getPitch() {
        this._ensureEngineReady();
        return this._engine.pitch;
    }

    setPitch(pitch) {
        this._ensureEngineReady();

        if (!Number.isFinite(pitch)) {
            throw new WebassemblyError(
                "pitch",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.pitch = pitch;
    }

    getZoom() {
        this._ensureEngineReady();
        return this._engine.zoom;
    }

    setZoom(zoom) {
        this._ensureEngineReady();

        if (!Number.isFinite(zoom) || zoom < 0.0 || 1.0 < zoom) {
            throw new WebassemblyError(
                "Invalid zoom",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.zoom = zoom;
    }

    addArrow(id, yaw, callback) {
        this._ensureEngineReady();

        if (Number.isNaN(id) || !Number.isInteger(id)) {
            throw new WebassemblyError(
                "Invalid ID",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (!Number.isFinite(yaw)) {
            throw new WebassemblyError(
                "Invalid yaw",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (typeof callback != "function") {
            throw new WebassemblyError(
                "Invalid callback",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        const absoluteHeading = this.#yawToHeading(yaw);
        this.#arrowHeadings[id] = absoluteHeading;

        this._engine.addArrow(id, yaw);
        this._arrowCallbacks[id] = callback;
    }

    addArrowFromHeading(id, headingRadians, callback) {
        this._ensureEngineReady();

        if (Number.isNaN(id) || !Number.isInteger(id)) {
            throw new WebassemblyError(
                "Invalid ID",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (!Number.isFinite(headingRadians)) {
            throw new WebassemblyError(
                "Invalid absolute heading",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (typeof callback != "function") {
            throw new WebassemblyError(
                "Invalid callback",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        const yaw = this.#headingToYaw(headingRadians);
        this.#arrowHeadings[id] = headingRadians;

        this._engine.addArrow(id, yaw);
        this._arrowCallbacks[id] = callback;
    }

    changeArrowDirection(id, yaw) {
        this._ensureEngineReady();

        if (Number.isNaN(id) || !Number.isInteger(id)) {
            throw new WebassemblyError(
                "Invalid ID",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (Number.isFinite(yaw)) {
            throw new WebassemblyError(
                "Invalid yaw",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (!this.doesArrowExist(id)) {
            throw new WebassemblyError(
                "Invalid arrow ID",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        const heading = this.#yawToHeading(yaw);
        this.#arrowHeadings[id] = heading;

        this._engine.changeArrowDirection(id, yaw);
    }

    changeArrowDirectionFromHeading(id, absoluteHeadingRadians) {
        this._ensureEngineReady();

        if (Number.isNaN(id) || !Number.isInteger(id)) {
            throw new WebassemblyError(
                "Invalid ID",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (!Number.isFinite(absoluteHeadingRadians)) {
            throw new WebassemblyError(
                "Invalid absolute heading",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        if (!this.doesArrowExist(id)) {
            throw new WebassemblyError(
                "Invalid arrow ID",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        const yaw = this.#headingToYaw(absoluteHeadingRadians);
        this.#arrowHeadings[id] = absoluteHeadingRadians;
        this._engine.changeArrowDirection(id, yaw);
    }

    clearArrows() {
        this._ensureEngineReady();
        this._engine.clearArrows();
        this._arrowCallbacks = {};
        this.#arrowHeadings = {};
    }

    doesArrowExist(id) {
        this._ensureEngineReady();

        let returnValue = false;
        if (Number.isInteger(id)) {
            returnValue = this._engine.doesArrowExist(id);
        }

        return returnValue;
    }

    removeArrowById(id) {
        this._ensureEngineReady();

        if (!this.doesArrowExist(id)) {
            throw new WebassemblyError(
                "Invalid arrow ID",
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.INVALID_INPUT
                });
        }

        this._engine.removeArrow(id);
        delete this.#arrowHeadings[id];
        delete this._arrowCallbacks[id];
    }

    // |-----------------|
    // | PRIVATE METHODS |
    // |-----------------|
    _beforeRender() {
        this.#updateTransition();

        if (this.#activeTransition == null) {
            if (this.autoRotate) {
                this._engine.rotateCamera(0, degreeToRadian(this.autoRotateSpeed));
            }
        }
    }

    // Functions that have to be implemented
    _createEngine(module) {
        return new module.EquirectangularEngine(this._canvasId);
    }

    _getInputCallbacks() {
        return {
            "friction": 0.96,
            onRotate: (pitch, yaw) => {
                if (this._engine && this.#activeTransition == null) {
                    this._engine.rotateCamera(degreeToRadian(pitch), degreeToRadian(yaw));
                }
            },
            onZoom: (zoomAmount) => {
                if (this._engine && this.#activeTransition == null) {
                    this._engine.zoomBy(zoomAmount);
                    return true;
                }
                return false;
            },
            onClick: async (x, y) => {
                if (this._engine) {
                    let clickedId = this._engine.getClickedArrow(x, y, true);
                    let callback = this._arrowCallbacks[clickedId];

                    if (clickedId != -1 && callback) {
                        try {
                            await callback();
                        } catch (error) {
                            if (!(error instanceof WebassemblyError) || error.type != EQUIRECTANGULAR_ERROR_TYPES.CANCELLED) {
                                console.error(error);
                            }
                        }
                    }
                }
            },
            onDoubleClick: async (x, y) => {
                if (this._engine) {
                    let clickedId = this._engine.getClickedArrow(x, y, false);
                    let callback = this._arrowCallbacks[clickedId];

                    if (clickedId != -1 && callback) {
                        try {
                            await callback();
                        } catch (error) {
                            if (!(error instanceof WebassemblyError) || error.type != EQUIRECTANGULAR_ERROR_TYPES.CANCELLED) {
                                console.error(error);
                            }
                        }
                    }
                }
            }
        };
    }

    #updateTransition() {
        if (this.#activeTransition) {
            const frameLocalYaw = this.#headingToYaw(this.#activeTransition.absoluteHeading);
            const frameState = this.#activeTransition.helper.getFrameState(frameLocalYaw);

            this._engine.setCameraPosition(frameState.camX, 0.0, frameState.camZ);
            this.#setCanvasBlur(frameState.blurPx);

            if (frameState.isComplete) {
                this.#completeTransition(this.#activeTransition);
            }
        }
    }

    #completeTransition(transition) {
        if (this.#activeTransition?.id == transition.id) {
            this.#activeTransition = null;
            this.#clearTransitionEffects();

            this.#settleTransition(transition, true);
        }
    }

    #cancelTransition(message) {
        const transition = this.#activeTransition;
        if (transition) {
            this.#activeTransition = null;
            this.#clearTransitionEffects();

            let error = new WebassemblyError(
                message,
                {
                    "type": EQUIRECTANGULAR_ERROR_TYPES.CANCELLED,
                    "transitionId": transition.id
                }
            );

            this.#settleTransition(transition, false, error);
        } else {
            this.#clearTransitionEffects();
        }
    }

    #clearTransitionEffects() {
        this.#isTransitionManagedLoad = false;
        this.#setCanvasBlur(0.0);

        if (this._engine) {
            this._engine.resetCameraPosition();
        }
    }

    #settleTransition(transition, isSuccess, error = null) {
        if (!transition.settled) {
            transition.settled = true;
            if (isSuccess) {
                transition.resolve();
            } else {
                transition.reject(error);
            }
        }
    }

    #yawToHeading(localYaw) {
        const absoluteHeading = localYaw - this.#imageNorthDirection;
        return normalizeAngleRadians(absoluteHeading);
    }

    #headingToYaw(absoluteHeading) {
        const localYaw = absoluteHeading + this.#imageNorthDirection;
        return normalizeAngleRadians(localYaw);
    }

    #setCanvasBlur(px) {
        const blurPx = Math.max(0.0, px);
        if (blurPx > 0.0) {
            this._canvas.style.filter = `blur(${blurPx}px)`;
        } else {
            this._canvas.style.filter = "none";
        }
    }
}
