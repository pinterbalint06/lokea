const DEFAULT_OPTIONS = {
    "mode": "3D",
    "sensitivity": 0.10,
    "zoomSpeed": 0.5,
    "friction": 0.9825,
    "drag": 0.1,
    "maxTimeToStartMomentum": 40,
    "zoomAnimationSpeed": 10.0,
    "defaultCursor": "grab",
    "grabbingCursor": "grabbing",
    "doubleClickDelay": 300,
    "doubleClickDistance": 15
};

const MAX_TRACKED_POINTERS = 2;
const MIN_MOMENTUM_VELOCITY = 0.01;
const MIN_PENDING_ZOOM = 0.1;

export class CanvasInput {
    // DOCUMENT RELATED
    /**
     * @type {HTMLCanvasElement}
     * The HTML Canvas element. */
    #canvas;
    /**
     * @type {string}
     * Default CSS cursor style. */
    #defaultCursor;
    /**
     * @type {string}
     * CSS cursor style when dragging. */
    grabbingCursor;

    // CONFIG RELATED
    /**
     * @type {string}
     * The interaction mode used when rotating/moving ("2D" or "3D"). */
    mode;
    /**
     * @type {number}
     * Speed modifier for zooming. */
    zoomSpeed;
    /**
     * @type {number}
     * Sensitivity for rotation. */
    sensitivity;
    /**
     * @type {number}
     * Friction used to multiply velocity [0;1]. */
    friction;
    /**
     * @type {number}
     * Drag force subtracted from velocity. */
    drag;
    /**
     * @type {number}
     * Max ms between last move and now to trigger momentum. */
    maxTimeToStartMomentum;
    /**
     * @type {number}
     * Max ms between clicks to trigger a double click. */
    doubleClickDelay;
    /**
     * @type {number}
     * Maximum distance between clicks to trigger a double click. */
    doubleClickDistance;

    // POINTER RELATED
    /**
     * @type {PointerEvent[]}
     * List of the active pointers. */
    #pointers;
    /**
     * @type {number}
     * Last X position of the pointer. */
    #lastX;
    /**
     * @type {number}
     * Last Y position of the pointer. */
    #lastY;
    /**
     * @type {number}
     * Time of the last pointer movement. */
    #lastMoveTime;
    /**
     * @type {number}
     * Previous distance between two pointers (for pinch zoom).
     */
    #previousPinchDistance;

    // DOUBLE CLICK RELATED
    /**
     * @type {number}
     * Timestamp of the last click */
    #lastClickTime;
    /**
     * @type {number}
     * X coordinate of the last click */
    #lastClickX;
    /**
     * @type {number}
     * Y coordinate of the last click */
    #lastClickY;

    // PHYSICS RELATED
    /**
     * @type {number}
     * Current rotation velocity on the X axis.
     */
    #rotationVelocityX;
    /**
     * @type {number}
     * Current rotation velocity on the Y axis.
     */
    #rotationVelocityY;
    /**
     * @type {number|null}
     * The ID given by requestAnimationFrame (used to cancel the momentum animation) */
    #rotationMomentumFrameId;

    // CALLBACKS
    /**
     * @type {function}
     * Callback function called on rotation. */
    onRotate;
    /**
     * @type {function}
     * Callback function called on zoom. */
    onZoom;
    /**
     * @type {function}
     * Callback function called on click. */
    onClick;
    /**
     * @type {function}
     * Callback function called on double click. */
    onDoubleClick;

    // LISTENERS
    /**
     * @type {function}
     * The listener function for pointer down. */
    #pointerDownListener;
    /**
     * @type {function}
     * The listener function for pointer up. */
    #pointerUpListener;
    /**
     * @type {function}
     * The listener function for pointer move. */
    #pointerMoveListener;
    /**
     * @type {function}
     * The listener function for wheel event. */
    #wheelListener;

    // ZOOM RELATED
    /**
     * @type {number}
     * Pending zoom amount to be animated).
     */
    #pendingZoom;
    /**
     * @type {number}
     * X coordinate of the zoom center.
     */
    #zoomAnchorX;
    /**
     * @type {number}
     * Y coordinate of the zoom center.
     */
    #zoomAnchorY;
    /**
     * @type {number|null}
     * The ID givenive by requestAnimationFrame (used to cancel the render loop) */
    #zoomAnimationFrameId;
    /**
     * @type {number}
     * Timestamp of the last zoom frame */
    #lastZoomFrameTime;
    /**
     * @type {number}
     * The speed of the zooming animation */
    zoomAnimationSpeed;


    /**
     * @param {HTMLCanvasElement} canvas - The HTML canvas element.
     * @param {object} options - The options for default max and min focal length, sensitivity, zoom speed and callbacks.
     */
    constructor(canvas, options = {}) {
        this.#canvas = canvas;

        this.zoomSpeed = options.zoomSpeed || DEFAULT_OPTIONS["zoomSpeed"];
        this.sensitivity = options.sensitivity || DEFAULT_OPTIONS["sensitivity"];
        this.mode = options.mode || DEFAULT_OPTIONS["mode"];
        this.#defaultCursor = options.defaultCursor || DEFAULT_OPTIONS["defaultCursor"];
        this.grabbingCursor = options.grabbingCursor || DEFAULT_OPTIONS["grabbingCursor"];
        this.friction = options.friction || DEFAULT_OPTIONS["friction"];
        this.drag = options.drag || DEFAULT_OPTIONS["drag"];
        this.maxTimeToStartMomentum = options.maxTimeToStartMomentum || DEFAULT_OPTIONS["maxTimeToStartMomentum"];
        this.zoomAnimationSpeed = options.zoomAnimationSpeed || DEFAULT_OPTIONS["zoomAnimationSpeed"];
        this.doubleClickDelay = options.doubleClickDelay || DEFAULT_OPTIONS["doubleClickDelay"];
        this.doubleClickDistance = options.doubleClickDistance || DEFAULT_OPTIONS["doubleClickDistance"];

        this.onRotate = options.onRotate || (() => { });
        this.onZoom = options.onZoom || (() => { });
        this.onClick = options.onClick || (() => { });
        this.onDoubleClick = options.onDoubleClick || (() => { });

        this.#pointers = [];
        this.#lastX = 0;
        this.#lastY = 0;
        this.#rotationVelocityX = 0;
        this.#rotationVelocityY = 0;
        this.#lastMoveTime = 0;
        this.#previousPinchDistance = 0;
        this.#rotationMomentumFrameId = null;

        this.#lastClickTime = 0;
        this.#lastClickX = 0;
        this.#lastClickY = 0;

        this.#pendingZoom = 0;
        this.#zoomAnchorX = 0;
        this.#zoomAnchorY = 0;
        this.#zoomAnimationFrameId = null;
        this.#lastZoomFrameTime = 0;

        this.#pointerDownListener = null;
        this.#pointerUpListener = null;
        this.#pointerMoveListener = null;
        this.#wheelListener = null;

        this.#canvas.style.cursor = this.#defaultCursor;
        this.#canvas.style.touchAction = "none";
        this.#addListeners();
    }

    setDefaultCursor(defaultCursor) {
        this.#defaultCursor = defaultCursor;
        this.#updateCursor();
    }

    removeListeners() {
        this.#canvas.removeEventListener("pointerdown", this.#pointerDownListener);

        this.#canvas.removeEventListener("pointerup", this.#pointerUpListener);
        this.#canvas.removeEventListener("pointercancel", this.#pointerUpListener);
        this.#canvas.removeEventListener("contextmenu", this.#pointerUpListener);

        this.#canvas.removeEventListener("pointermove", this.#pointerMoveListener);
        this.#canvas.removeEventListener("wheel", this.#wheelListener);

        window.removeEventListener("blur", this.#resetPointers);
    }

    stopMomentum() {
        this.#stopRotationMomentum();
        this.#stopZoomAnimation();
    }

    #stopRotationMomentum() {
        if (this.#rotationMomentumFrameId) {
            cancelAnimationFrame(this.#rotationMomentumFrameId);
            this.#rotationMomentumFrameId = null;
        }
        this.#rotationVelocityX = 0;
        this.#rotationVelocityY = 0;
    }

    #stopZoomAnimation() {
        if (this.#zoomAnimationFrameId) {
            cancelAnimationFrame(this.#zoomAnimationFrameId);
            this.#zoomAnimationFrameId = null;
        }
        this.#pendingZoom = 0;
    }

    #addListeners() {
        this.#pointerDownListener = (e) => this.#pointerDown(e);
        this.#canvas.addEventListener("pointerdown", this.#pointerDownListener);

        this.#pointerUpListener = (e) => this.#pointerUp(e);
        this.#canvas.addEventListener("pointerup", this.#pointerUpListener);
        this.#canvas.addEventListener("pointercancel", this.#pointerUpListener);
        this.#canvas.addEventListener("contextmenu", this.#pointerUpListener);

        this.#pointerMoveListener = (e) => this.#pointerMove(e);
        this.#canvas.addEventListener("pointermove", this.#pointerMoveListener);

        this.#wheelListener = (e) => this.#wheel(e);
        this.#canvas.addEventListener("wheel", this.#wheelListener, { passive: false });

        window.addEventListener("blur", this.#resetPointers);
    }

    #resetPointers = () => {
        this.#pointers = [];
        this.#updateCursor();
    }

    #pointerDown(event) {
        this.stopMomentum();

        this.#canvas.setPointerCapture(event.pointerId);

        if (this.#pointers.length < MAX_TRACKED_POINTERS) {
            this.#pointers.push(event);
            if (this.#pointers.length == 1) {
                this.#lastX = event.clientX;
                this.#lastY = event.clientY;
            } else {
                if (this.#pointers.length == 2) {
                    this.#previousPinchDistance = this.#calcDiff(this.#pointers[0], this.#pointers[1]);
                }
            }
        }
        this.#updateCursor();
    }

    #pointerUp(event) {
        this.#canvas.releasePointerCapture(event.pointerId);

        const releasedPointer = this.#removePointerById(event.pointerId);
        this.#handlePointerReleaseState(releasedPointer);
        this.#updateCursor();
    }

    #pointerMove(event) {
        this.#updateTrackedPointer(event);

        if (this.#pointers.length == 1) {
            this.#handleSinglePointerMove(event);
        } else {
            if (this.#pointers.length == 2) {
                this.#handlePinchPointerMove();
            }
        }
    }

    #startMomentum = () => {
        this.#rotationVelocityX *= this.friction;
        this.#rotationVelocityY *= this.friction;

        let velocity = Math.sqrt(this.#rotationVelocityX * this.#rotationVelocityX + this.#rotationVelocityY * this.#rotationVelocityY);

        if (velocity > 0) {
            let newVelocity = Math.max(0, velocity - this.drag);
            let ratio = newVelocity / velocity;

            this.#rotationVelocityX *= ratio;
            this.#rotationVelocityY *= ratio;
            velocity = newVelocity;
        }

        this.onRotate(this.#rotationVelocityX, this.#rotationVelocityY);

        if (velocity > MIN_MOMENTUM_VELOCITY) {
            this.#rotationMomentumFrameId = requestAnimationFrame(this.#startMomentum);
        } else {
            this.#rotationMomentumFrameId = null;
        }
    }

    #wheel(event) {
        event.preventDefault();
        const zoomDelta = -event.deltaY;
        const cursorCoordinates = this.#getCanvasCoordinates(event.clientX, event.clientY);

        this.#accumulateZoom(zoomDelta, cursorCoordinates.x, cursorCoordinates.y);
    }

    #accumulateZoom(zoomAmount, cursorX, cursorY) {
        this.#pendingZoom += zoomAmount * this.zoomSpeed;
        this.#zoomAnchorX = cursorX;
        this.#zoomAnchorY = cursorY;

        if (this.#isZoomAnimationStopped()) {
            this.#startZoomAnimationLoop();
        }
    }

    #isZoomAnimationStopped() {
        return this.#zoomAnimationFrameId == null;
    }

    #startZoomAnimationLoop() {
        this.#lastZoomFrameTime = performance.now();
        this.#zoomAnimationFrameId = requestAnimationFrame(this.#animateZoom);
    }

    #animateZoom = () => {
        let deltaTime = this.#calculateDeltaTime();

        if (Math.abs(this.#pendingZoom) < MIN_PENDING_ZOOM) {
            this.#applyRemainingZoomAndStop();
        } else {
            this.#applyEaseOutZoomStep(deltaTime);
        }
    }

    #calculateDeltaTime() {
        let now = performance.now();
        let deltaTime = (now - this.#lastZoomFrameTime) / 1000;
        this.#lastZoomFrameTime = now;
        return deltaTime;
    }

    #applyRemainingZoomAndStop() {
        this.#attemptZoom(this.#pendingZoom);
        this.#stopZoomAnimation();
    }

    #applyEaseOutZoomStep(deltaTime) {
        let step = this.#calculateEaseOutStep(deltaTime);
        let stopRequested = this.#attemptZoom(step);

        if (stopRequested) {
            this.#stopZoomAnimation();
        } else {
            this.#pendingZoom -= step;
            this.#zoomAnimationFrameId = requestAnimationFrame(this.#animateZoom);
        }
    }

    #calculateEaseOutStep(deltaTime) {
        let timeAndSpeedFactor = 1 - Math.exp(-this.zoomAnimationSpeed * deltaTime);
        return this.#pendingZoom * timeAndSpeedFactor;
    }

    #attemptZoom(step) {
        let stopRequested = false;
        try {
            const didZoomHappen = this.onZoom(step, this.#zoomAnchorX, this.#zoomAnchorY);
            stopRequested = didZoomHappen == false;
        } catch (e) {
        }
        return stopRequested;
    }

    #calcDiff(p1, p2) {
        return Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
    }

    #updateCursor() {
        this.#canvas.style.cursor = this.#pointers.length === 1 ? this.grabbingCursor : this.#defaultCursor;
    }

    #findPointerIndexById(pointerId) {
        let pointerIndex = 0;
        while (pointerIndex < this.#pointers.length && this.#pointers[pointerIndex].pointerId != pointerId) {
            pointerIndex++;
        }
        return pointerIndex;
    }

    #removePointerById(pointerId) {
        let releasedPointer;
        const pointerIndex = this.#findPointerIndexById(pointerId);
        if (pointerIndex < this.#pointers.length) {
            releasedPointer = this.#pointers[pointerIndex];
            this.#pointers.splice(pointerIndex, 1);
        }
        return releasedPointer;
    }

    #updateTrackedPointer(pointerEvent) {
        const pointerIndex = this.#findPointerIndexById(pointerEvent.pointerId);
        if (pointerIndex < this.#pointers.length) {
            this.#pointers[pointerIndex] = pointerEvent;
        }
    }

    #handlePointerReleaseState(releasedPointer) {
        if (this.#pointers.length == 1) {
            this.#resetStateForSinglePointer();
        } else {
            if (this.#pointers.length == 0) {
                this.#handleNoPointerLeftState(releasedPointer);
            }
        }
    }

    #resetStateForSinglePointer() {
        this.#previousPinchDistance = 0;
        this.#lastX = this.#pointers[0].clientX;
        this.#lastY = this.#pointers[0].clientY;
    }

    #handleNoPointerLeftState(releasedPointer) {
        if (this.#isRotationStationary()) {
            if (releasedPointer) {
                this.#triggerClick(releasedPointer);
            }
        } else {
            if (this.#isWithinMomentumTimeframe()) {
                this.#startMomentum();
            }
        }
    }

    #isRotationStationary() {
        return this.#rotationVelocityX == 0 && this.#rotationVelocityY == 0;
    }

    #triggerClick(releasedPointer) {
        const releasedCoordinates = this.#getCanvasCoordinates(releasedPointer.clientX, releasedPointer.clientY);
        const now = Date.now();
        const timeSinceLastClick = now - this.#lastClickTime;

        const distance = Math.hypot(
            releasedCoordinates.x - this.#lastClickX,
            releasedCoordinates.y - this.#lastClickY
        );

        this.onClick(releasedCoordinates.x, releasedCoordinates.y);

        if (timeSinceLastClick <= this.doubleClickDelay && distance <= this.doubleClickDistance) {
            this.onDoubleClick(releasedCoordinates.x, releasedCoordinates.y);
            this.#lastClickTime = 0;
        } else {
            this.#lastClickTime = now;
            this.#lastClickX = releasedCoordinates.x;
            this.#lastClickY = releasedCoordinates.y;
        }
    }

    #isWithinMomentumTimeframe() {
        let timeSinceLastMove = Date.now() - this.#lastMoveTime;
        return timeSinceLastMove <= this.maxTimeToStartMomentum;
    }

    #handleSinglePointerMove(pointerEvent) {
        let deltaX = pointerEvent.clientX - this.#lastX;
        let deltaY = pointerEvent.clientY - this.#lastY;

        this.#lastX = pointerEvent.clientX;
        this.#lastY = pointerEvent.clientY;

        const rotationDelta = this.#calculateRotationDelta(deltaX, deltaY);

        this.#rotationVelocityX = rotationDelta.x;
        this.#rotationVelocityY = rotationDelta.y;
        this.#lastMoveTime = Date.now();

        this.onRotate(rotationDelta.x, rotationDelta.y);
    }

    #calculateRotationDelta(deltaX, deltaY) {
        let rotationX;
        let rotationY;
        if (this.mode == "3D") {
            rotationX = -deltaY;
            rotationY = -deltaX;
        } else {
            rotationX = -deltaX;
            rotationY = -deltaY;
        }
        return {
            x: rotationX,
            y: rotationY
        };
    }

    #handlePinchPointerMove() {
        const currentPinchDistance = this.#calcDiff(this.#pointers[0], this.#pointers[1]);
        const pinchDistanceChange = currentPinchDistance - this.#previousPinchDistance;

        const screenPinchCenterX = (this.#pointers[0].clientX + this.#pointers[1].clientX) * 0.5;
        const screenPinchCenterY = (this.#pointers[0].clientY + this.#pointers[1].clientY) * 0.5;
        const canvasPinchCenter = this.#getCanvasCoordinates(screenPinchCenterX, screenPinchCenterY);

        this.#previousPinchDistance = currentPinchDistance;
        this.#accumulateZoom(pinchDistanceChange, canvasPinchCenter.x, canvasPinchCenter.y);
    }

    #getCanvasCoordinates(screenX, screenY) {
        const canvasRectangle = this.#canvas.getBoundingClientRect();
        return {
            x: screenX - canvasRectangle.left,
            y: screenY - canvasRectangle.top
        };
    }
}