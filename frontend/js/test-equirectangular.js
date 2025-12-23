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

    let imgData = new ImageData(clampedArray, jsCanvasSzelesseg, jsCanvasMagassag);
    ctx.putImageData(imgData, 0, 0);
}

const TARGET_FPS = 30;
const FRAME_MIN_TIME = 1000 / TARGET_FPS;
let lastFrameTime = 0;
let frameCount = 0;
let lastFpsUpdate = 0;
let fps = 0;


function updateFPS(currentTime) {
    frameCount++;

    if (currentTime - lastFpsUpdate >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = currentTime;

        document.getElementById("fps").innerText = fps;
    }
}

function mainLoop(currentTime) {
    requestAnimationFrame(mainLoop);

    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= FRAME_MIN_TIME) {
        Module.render();
        drawImage();
        updateFPS(currentTime);
        lastFrameTime = currentTime - (deltaTime % FRAME_MIN_TIME);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    let canvas = document.getElementById(canvasId);
    canvas.width = jsCanvasSzelesseg;
    canvas.height = jsCanvasMagassag;
    Module.onRuntimeInitialized = function () {
        Module.init(256, fokuszTavolsag, filmSzel, filmMag, jsCanvasSzelesseg, jsCanvasMagassag, n, f);
        Module.setShadingTexture();
        imgFromUrl("../imgs/cathedral.jpg");
    };
});

function ujUrlbol() {
    imgFromUrl(document.getElementById("url").value);
}

function ujElsmitas() {
    let elsimitas = document.getElementById("antialias");
    Module.setAntialias(parseInt(elsimitas.value));
    drawImage();
}

function imgFromUrl(url) {
    let img = new Image;
    img.crossOrigin = "anonymous";
    img.onload = function () {
        let canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        let imgData = ctx.getImageData(0, 0, this.width, this.height);
        let rgbaData = imgData.data;

        const ptr = Module.initTexture(this.width, this.height);
        let rgbData = new Uint8Array(
            Module.HEAPU8.buffer,
            ptr,
            this.width * this.height * 3
        );
        let index = 0;
        for (let i = 0; i < rgbaData.length; i += 4) {
            rgbData[index] = rgbaData[i];
            index++;
            rgbData[index] = rgbaData[i + 1];
            index++;
            rgbData[index] = rgbaData[i + 2];
            index++;
        }
        requestAnimationFrame(mainLoop);
    };
    img.src = url;
}

function xyForgas(xszoggel, yszoggel) {
    Module.xyForog(xszoggel * (Math.PI / 180), yszoggel * (Math.PI / 180));
    drawImage(canvasId);
}

function ujrarenderel() {
    Module.render();
    drawImage();
}
