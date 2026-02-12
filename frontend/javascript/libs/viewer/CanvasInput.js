const DEFAULT_OPTIONS = {
    "mode": "3D",
    "sensitivity": 0.10,
    "zoomSpeed": 0.5,
    "friction": 0.9825,
    "drag": 0.1,
    "maxTimeToStartMomentum": 40,
    "zoomAnimationSpeed": 10.0,
    "defaultCursor": "grab",
    "grabbingCursor": "grabbing"
};

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
     * Previous distance between two fingers (for pinch zoom). */
    #prevDiff;

    // PHYSICS RELATED
    /**
     * @type {number}
     * Current velocity on the X axis. */
    #velocityX;
    /**
     * @type {number}
     * Current velocity on the Y axis. */
    #velocityY;
    /**
     * @type {number|null}
     * The ID given by requestAnimationFrame (used to cancel the momentum animation) */
    #momentumAnimationId;

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
    /**
     * @type {function}
     * Clears pointers. Listener for blur. */
    #resetPointers;

    // ZOOM RELATED
    /**
     * @type {number}
     * Zoom to be done */
    #remainingZoom;
    /**
     * @type {number}
     * Current X center of the zoom */
    #zoomTargetX;
    /**
     * @type {number}
     * Current Y center of the zoom */
    #zoomTargetY;
    /**
     * @type {number|null}
     * The ID given by requestAnimationFrame (used to cancel the render loop) */
    #zoomAnimationId;
    /**
     * @type {number}
     * Timestamp of the last zoom frame */
    #lastZoomTime;
    /**
     * @type {number}
     * The speed of the zooming animation */
    zoomAnimationSpeed;


    /**
     * @param {string} canvasId - The HTML ID of the canvas.
     * @param {object} options - The options for default max and min focal length, sensitivity, zoom speed and onRotate and onZoom functions.
     */
    constructor(canvas, options = {}) {
        this.#canvas = canvas;

        this.zoomSpeed = options.zoomSpeed ? options.zoomSpeed : DEFAULT_OPTIONS["zoomSpeed"];
        this.sensitivity = options.sensitivity ? options.sensitivity : DEFAULT_OPTIONS["sensitivity"];
        this.mode = options.mode ? options.mode : DEFAULT_OPTIONS["mode"];
        this.#defaultCursor = options.defaultCursor ? options.defaultCursor : DEFAULT_OPTIONS["defaultCursor"];
        this.grabbingCursor = options.grabbingCursor ? options.grabbingCursor : DEFAULT_OPTIONS["grabbingCursor"];
        this.friction = options.friction ? options.friction : DEFAULT_OPTIONS["friction"];
        this.drag = options.drag ? options.drag : DEFAULT_OPTIONS["drag"];
        this.maxTimeToStartMomentum = options.maxTimeToStartMomentum ? options.maxTimeToStartMomentum : DEFAULT_OPTIONS["maxTimeToStartMomentum"];
        this.zoomAnimationSpeed = options.zoomAnimationSpeed ? options.zoomAnimationSpeed : DEFAULT_OPTIONS["zoomAnimationSpeed"];

        this.onRotate = options.onRotate ? options.onRotate : (() => { });
        this.onZoom = options.onZoom ? options.onZoom : (() => { });
        this.onClick = options.onClick ? options.onClick : (() => { });

        this.#pointers = [];
        this.#lastX = 0;
        this.#lastY = 0;
        this.#velocityX = 0;
        this.#velocityY = 0;
        this.#lastMoveTime = 0;
        this.#prevDiff = 0;
        this.#momentumAnimationId = null;

        this.#remainingZoom = 0;
        this.#zoomTargetX = 0;
        this.#zoomTargetY = 0;
        this.#zoomAnimationId = null;
        this.#lastZoomTime = 0;

        this.#pointerDownListener = null;
        this.#pointerUpListener = null;
        this.#pointerMoveListener = null;
        this.#wheelListener = null;

        this.#canvas.style.cursor = this.#defaultCursor;
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

        // alt tab
        this.#resetPointers = () => {
            this.#pointers = [];
            this.#updateCursor();
        }
        window.addEventListener("blur", this.#resetPointers);
    }

    #pointerDown(e) {
        if (this.#momentumAnimationId) {
            cancelAnimationFrame(this.#momentumAnimationId);
            this.#momentumAnimationId = null;
        }
        this.#velocityX = 0;
        this.#velocityY = 0;

        this.#canvas.setPointerCapture(e.pointerId);

        if (this.#pointers.length < 2) {
            this.#pointers.push(e);
            if (this.#pointers.length == 1) {
                this.#lastX = e.clientX;
                this.#lastY = e.clientY;
            } else {
                if (this.#pointers.length == 2) {
                    this.#prevDiff = this.#calcDiff(this.#pointers[0], this.#pointers[1]);
                }
            }
        }
        this.#updateCursor();
    }

    #pointerUp(e) {
        this.#canvas.releasePointerCapture(e.pointerId);
        let i = 0;
        while (i < this.#pointers.length && this.#pointers[i].pointerId != e.pointerId) {
            i++;
        }
        let releasedPointer;
        if (i < this.#pointers.length) {
            releasedPointer = this.#pointers[i];
            this.#pointers.splice(i, 1);
        }

        if (this.#pointers.length == 1) {
            this.#prevDiff = 0;
            this.#lastX = this.#pointers[0].clientX;
            this.#lastY = this.#pointers[0].clientY;
        } else {
            if (this.#pointers.length == 0) {
                if (this.#velocityX == 0 && this.#velocityY == 0) {
                    if (releasedPointer) {
                        let canvasRectangle = this.#canvas.getBoundingClientRect();

                        let cursorInsideCanvasX = releasedPointer.clientX - canvasRectangle.left;
                        let cursorInsideCanvasY = releasedPointer.clientY - canvasRectangle.top;
                        this.onClick(cursorInsideCanvasX, cursorInsideCanvasY);
                    }
                } else {
                    let timeSinceLastMove = Date.now() - this.#lastMoveTime;
                    if (timeSinceLastMove <= this.maxTimeToStartMomentum) {
                        this.#startMomentum();
                    }
                }
            }
        }
        this.#updateCursor();
    }

    #pointerMove(e) {
        // Update the pointer record in our array
        let i = 0;
        while (i < this.#pointers.length && this.#pointers[i].pointerId != e.pointerId) {
            i++;
        }
        if (i < this.#pointers.length) {
            this.#pointers[i] = e;
        }

        if (this.#pointers.length == 1) {
            // one pointer rotate
            let deltaX = e.clientX - this.#lastX;
            let deltaY = e.clientY - this.#lastY;

            this.#lastX = e.clientX;
            this.#lastY = e.clientY;

            let rotX, rotY;
            if (this.mode == "3D") {
                rotX = -deltaY;
                rotY = -deltaX;
            } else {
                rotX = -deltaX;
                rotY = -deltaY;
            }

            this.#velocityX = rotX;
            this.#velocityY = rotY;
            this.#lastMoveTime = Date.now();

            this.onRotate(rotX, rotY);
        } else {
            if (this.#pointers.length === 2) {
                // zooming with pinching
                let currDiff = this.#calcDiff(this.#pointers[0], this.#pointers[1]);
                let change = currDiff - this.#prevDiff;

                let screenPinchCenterX = (this.#pointers[0].clientX + this.#pointers[1].clientX) * 0.5;
                let screenPinchCenterY = (this.#pointers[0].clientY + this.#pointers[1].clientY) * 0.5;

                let rect = this.#canvas.getBoundingClientRect();
                let canvasPinchCenterX = screenPinchCenterX - rect.left;
                let canvasPinchCenterY = screenPinchCenterY - rect.top;

                this.#prevDiff = currDiff;
                this.#accumulateZoom(change, canvasPinchCenterX, canvasPinchCenterY);
            }
        }
    }

    #startMomentum = () => {
        this.#velocityX *= this.friction;
        this.#velocityY *= this.friction;

        let velocity = Math.sqrt(this.#velocityX * this.#velocityX + this.#velocityY * this.#velocityY);

        if (velocity > 0) {
            let newVelocity = Math.max(0, velocity - this.drag);
            let ratio = newVelocity / velocity;

            this.#velocityX *= ratio;
            this.#velocityY *= ratio;
            velocity = newVelocity;
        }

        this.onRotate(this.#velocityX, this.#velocityY);

        if (velocity > 0.01) {
            this.#momentumAnimationId = requestAnimationFrame(this.#startMomentum);
        } else {
            this.#momentumAnimationId = null;
        }
    }

    #wheel(e) {
        e.preventDefault();
        const d = -e.deltaY;
        let canvasRectangle = this.#canvas.getBoundingClientRect();

        let cursorInsideCanvasX = e.clientX - canvasRectangle.left;
        let cursorInsideCanvasY = e.clientY - canvasRectangle.top;

        this.#accumulateZoom(d, cursorInsideCanvasX, cursorInsideCanvasY);
    }

    #accumulateZoom(zoomAmount, cursorX, cursorY) {
        // apply sensitivity to zoomAmount and add it to remaining zoom
        this.#remainingZoom += zoomAmount * this.zoomSpeed;
        this.#zoomTargetX = cursorX;
        this.#zoomTargetY = cursorY;

        // if animation loop is not running start it
        if (this.#zoomAnimationId === null) {
            this.#lastZoomTime = performance.now();
            this.#zoomAnimationId = requestAnimationFrame(this.#animateZoom);
        }
    }

    #animateZoom = () => {
        // calculate delta time
        let now = performance.now();
        let deltaTime = (now - this.#lastZoomTime) / 1000;
        this.#lastZoomTime = now;

        // if the remaining zoom is small zoom to that and stop the loop
        if (Math.abs(this.#remainingZoom) < 0.1) {
            this.onZoom(this.#remainingZoom, this.#zoomTargetX, this.#zoomTargetY);
            this.#remainingZoom = 0;
            this.#zoomAnimationId = null;
        } else {
            // ease out curve
            let timeAndSpeedFactor = 1 - Math.exp(-this.zoomAnimationSpeed * deltaTime);
            let step = this.#remainingZoom * timeAndSpeedFactor;

            this.onZoom(step, this.#zoomTargetX, this.#zoomTargetY);
            this.#remainingZoom -= step;

            this.#zoomAnimationId = requestAnimationFrame(this.#animateZoom);
        }
    }

    #calcDiff(p1, p2) {
        return Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
    }

    #updateCursor() {
        this.#canvas.style.cursor = this.#pointers.length === 1 ? this.grabbingCursor : this.#defaultCursor;
    }
}