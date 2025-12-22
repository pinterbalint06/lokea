// kamera tulajdonsagai
const fokuszTavolsag = 12.7; // mm focalLength
const filmSzel = 25.4;
const filmMag = 25.4;
const jsCanvasSzelesseg = 1000;
const jsCanvasMagassag = 1000;
// near clipping plane - kozel vagasi sik
const n = 0.1;
// far clipping plane - tavol vagasi sik
const f = 1000;
const canvasId = "canvas";

function drawImage() {
    let imageBufferHely = Module.getImageLocation();
    let clampedArray = new Uint8ClampedArray(
        wasmMemory.buffer,
        imageBufferHely,
        jsCanvasSzelesseg * jsCanvasMagassag * 4
    );
    let ctx = document.getElementById(canvasId).getContext("2d");
    ctx.clearRect(0, 0, jsCanvasSzelesseg, jsCanvasMagassag);

    let imgData = new ImageData(clampedArray, jsCanvasSzelesseg, jsCanvasMagassag);
    ctx.putImageData(imgData, 0, 0);
}

document.addEventListener("DOMContentLoaded", async function () {
    let canvas = document.getElementById(canvasId);
    canvas.width = jsCanvasSzelesseg;
    canvas.height = jsCanvasMagassag;
    Module.onRuntimeInitialized = function () {
        Module.init(256, fokuszTavolsag, filmSzel, filmMag, jsCanvasSzelesseg, jsCanvasMagassag, n, f);
        drawImage();
    };
});

function xyForgas(xszoggel, yszoggel) {
    Module.xyForog(xszoggel * (Math.PI / 180), yszoggel * (Math.PI / 180));
    drawImage(canvasId);
}
