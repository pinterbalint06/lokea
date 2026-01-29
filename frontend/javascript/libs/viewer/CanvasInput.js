const DEFAULT_FOCAL_LENGTH = 18.0;
const DEFAULT_MIN_FOCAL_LENGTH = 10.5;
const DEFAULT_MAX_FOCAL_LENGTH = 150.0;
const DEFAULT_ZOOM_SPEED = 0.05;
const DEFAULT_SENSITIVITY = 0.10;

export class CanvasInput {
    /**
     * @param {string} canvasId - The HTML ID of the canvas.
     * @param {object} options - The options for default max and min focal length, sensitivity, zoom speed and onRotate and onZoom functions.
     */
    constructor(canvas, options = {}) {
        this.canvas = canvas;

        this.focalLength = options.focalLength ? options.focalLength : DEFAULT_FOCAL_LENGTH;
        this.minFocal = options.minFocal ? options.minFocal : DEFAULT_MIN_FOCAL_LENGTH;
        this.maxFocal = options.maxFocal ? options.maxFocal : DEFAULT_MAX_FOCAL_LENGTH;
        this.zoomSpeed = options.zoomSpeed ? options.zoomSpeed : DEFAULT_ZOOM_SPEED;
        this.sensitivity = options.sensitivity ? options.sensitivity : DEFAULT_SENSITIVITY;

        this.onRotate = options.onRotate ? options.onRotate : (() => { });
        this.onZoom = options.onZoom ? options.onZoom : (() => { });

        this.pointers = [];
        this.lastX = 0;
        this.lastY = 0;
        this.prevDiff = 0;

        this.canvas.style.cursor = "grab";
        this.#addListeners();
    }

    removeListeners() {
        this.canvas.removeEventListener('pointerdown', (e) => this.#pointerDown(e));
        this.canvas.removeEventListener('pointerup', (e) => this.#pointerUp(e));
        this.canvas.removeEventListener('pointermove', (e) => this.#pointerMove(e));
        this.canvas.removeEventListener('wheel', (e) => this.#wheel(e));
    }

    #addListeners() {
        this.canvas.addEventListener('pointerdown', (e) => this.#pointerDown(e));
        this.canvas.addEventListener('pointerup', (e) => this.#pointerUp(e));
        this.canvas.addEventListener('pointermove', (e) => this.#pointerMove(e));
        this.canvas.addEventListener('wheel', (e) => this.#wheel(e));
    }

    #pointerDown(e) {
        this.canvas.setPointerCapture(e.pointerId);

        if (this.pointers.length < 2) {
            this.pointers.push(e);
            if (this.pointers.length == 1) {
                this.lastX = e.clientX;
                this.lastY = e.clientY;
            } else {
                if (this.pointers.length == 2) {
                    this.prevDiff = this.#calcDiff(this.pointers[0], this.pointers[1]);
                }
            }
        }
        this.#updateCursor();
    }

    #pointerUp(e) {
        this.canvas.releasePointerCapture(e.pointerId);
        let i = 0;
        while (i < this.pointers.length && this.pointers[i].pointerId != e.pointerId) {
            i++;
        }
        if (i < this.pointers.length) {
            this.pointers.splice(i, 1);
        }

        if (this.pointers.length == 1) {
            this.prevDiff = 0;
            this.lastX = this.pointers[0].clientX;
            this.lastY = this.pointers[0].clientY;
        }
        this.#updateCursor();
    }

    #pointerMove(e) {
        // Update the pointer record in our array
        let i = 0;
        while (i < this.pointers.length && this.pointers[i].pointerId != e.pointerId) {
            i++;
        }
        if (i < this.pointers.length) {
            this.pointers[i] = e;
        }

        if (this.pointers.length == 1) {
            // one pointer rotate
            const dX = e.clientX - this.lastX;
            const dY = e.clientY - this.lastY;

            this.lastX = e.clientX;
            this.lastY = e.clientY;

            // jobbra huzza balra mozogjon -> invertalni kell
            const correctZoom = this.minFocal / this.focalLength;
            const rotX = -dY * this.sensitivity * correctZoom;
            const rotY = -dX * this.sensitivity * correctZoom;

            this.onRotate(rotX, rotY);
        } else {
            if (this.pointers.length === 2) {
                // zooming with pinching
                let currDiff = this.#calcDiff(this.pointers[0], this.pointers[1]);
                let valtozas = (currDiff - this.prevDiff) * this.sensitivity;

                this.prevDiff = currDiff;
                this.#applyZoom(valtozas);
            }
        }
    }

    #wheel(e) {
        e.preventDefault();
        const d = e.deltaY * -this.zoomSpeed;
        this.#applyZoom(d);
    }

    #applyZoom(d) {
        this.focalLength += d;

        if (this.focalLength < this.minFocal) {
            this.focalLength = this.minFocal;
        };
        if (this.focalLength > this.maxFocal) {
            this.focalLength = this.maxFocal;
        };

        this.onZoom(this.focalLength);
    }

    #calcDiff(p1, p2) {
        return Math.sqrt(
            Math.pow(p1.clientX - p2.clientX, 2) +
            Math.pow(p1.clientY - p2.clientY, 2)
        );
    }

    #updateCursor() {
        this.canvas.style.cursor = this.pointers.length === 1 ? "grabbing" : "grab";
    }
}