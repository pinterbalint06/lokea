const DEFAULT_OPTIONS = {
    "mode": "3D",
    "sensitvity": 0.10,
    "zoomSpeed": 0.05,
    "defaultCursor": "grab",
    "grabbingCursor": "grabbing"
};

export class CanvasInput {
    /**
     * @param {string} canvasId - The HTML ID of the canvas.
     * @param {object} options - The options for default max and min focal length, sensitivity, zoom speed and onRotate and onZoom functions.
     */
    constructor(canvas, options = {}) {
        this.canvas = canvas;

        this.zoomSpeed = options.zoomSpeed ? options.zoomSpeed : DEFAULT_OPTIONS["zoomSpeed"];
        this.sensitivity = options.sensitivity ? options.sensitivity : DEFAULT_OPTIONS["sensitvity"];
        this.mode = options.mode ? options.mode : DEFAULT_OPTIONS["mode"];
        this.defaultCursor = options.defaultCursor ? options.defaultCursor : DEFAULT_OPTIONS["defaultCursor"];
        this.grabbingCursor = options.grabbingCursor ? options.grabbingCursor : DEFAULT_OPTIONS["grabbingCursor"];

        this.onRotate = options.onRotate ? options.onRotate : (() => { });
        this.onZoom = options.onZoom ? options.onZoom : (() => { });

        this.pointers = [];
        this.lastX = 0;
        this.lastY = 0;
        this.prevDiff = 0;

        this.canvas.style.cursor = this.defaultCursor;
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

            let rotX, rotY;
            if (this.mode == "3D") {
                rotX = -dY;
                rotY = -dX;
            } else {
                rotX = -dX;
                rotY = -dY;
            }

            this.onRotate(rotX, rotY);
        } else {
            if (this.pointers.length === 2) {
                // zooming with pinching
                let currDiff = this.#calcDiff(this.pointers[0], this.pointers[1]);
                let valtozas = currDiff - this.prevDiff;

                this.prevDiff = currDiff;
                this.onZoom(valtozas);
            }
        }
    }

    #wheel(e) {
        e.preventDefault();
        const d = -e.deltaY;
        let canvasRectangle = canvas.getBoundingClientRect();

        let cursorInsideCanvasX = e.clientX - canvasRectangle.left;
        let cursorInsideCanvasY = e.clientY - canvasRectangle.top;

        this.onZoom(d, cursorInsideCanvasX, cursorInsideCanvasY);
    }

    #calcDiff(p1, p2) {
        return Math.sqrt(
            Math.pow(p1.clientX - p2.clientX, 2) +
            Math.pow(p1.clientY - p2.clientY, 2)
        );
    }

    #updateCursor() {
        this.canvas.style.cursor = this.pointers.length === 1 ? this.grabbingCursor : this.defaultCursor;
    }
}