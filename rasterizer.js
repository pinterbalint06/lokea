// kamera tulajdonsagai
const fokuszTavolsag = 12.7; // mm focalLength
const filmSzel = 25.4;
const filmMag = 25.4;
const jsCanvasSzelesseg = 1000;
const jsCanvasMagassag = 1000;
// near clipping plane - kozel vagasi sik
const n = 1;
// far clipping plane - tavol vagasi sik
const f = 1000;

document.addEventListener("DOMContentLoaded", async function () {
    let canvas = document.getElementById("canvas");
    canvas.get
    canvas.width = jsCanvasSzelesseg;
    canvas.height = jsCanvasMagassag;
    let sd = document.getElementById("seed");
    seed = Math.floor(Math.random() * 10000) + 1;
    sd.value = seed;
    sd.nextElementSibling.value = sd.value;
    Module.onRuntimeInitialized = function () {
        Module.init();
        Module.meretBeallit(meret);
        Module.setFrustum(fokuszTavolsag, filmSzel, filmMag, jsCanvasSzelesseg, jsCanvasMagassag, n, f);
        ujTerkep();
    };
});

const meret = 256;
let seed;

function xyForgas(xszoggel, yszoggel) {
    Module.xForog(xszoggel * (Math.PI / 180));
    Module.yForog(yszoggel * (Math.PI / 180));
    rendereles();
}

// mennyi idő lenne lerenderelni a cubemapet
function teszt() {
    let tempX = Module.getXForog();
    let tempY = Module.getYForog();
    let most = performance.now();
    irany(90, 0);
    irany(-90, 0);
    irany(0, 0);
    irany(0, 180);
    irany(0, 90);
    irany(0, -90);
    document.getElementById("ido").innerText = Math.round(performance.now() - most);
    irany(tempX, tempY);
}

function ujTerkep() {
    // 45-75ms
    let eleje = performance.now()
    let perlinHelye = Module.allocatePerlin(meret * meret);
    perlinErtekek = new Float32Array(
        wasmMemory.buffer,
        perlinHelye,
        meret * meret * 3
    );
    perlin(perlinErtekek, 1, meret, seed, 2, 9, 2, 2.2);
    Module.allocatePontok(meret * meret * 3);
    Module.allocateIndexek((meret - 1) * (meret - 1) * 6);
    Module.pontokKiszamolasa(150);
    Module.osszekotesekKiszamolasa();
    console.log("Új térkép idő:", performance.now() - eleje)
    ujhely();
}

function ujhely() {
    Module.ujHely();
    rendereles();
}

function irany(x, y) {
    Module.setXForog(x * (Math.PI / 180));
    Module.setYForog(y * (Math.PI / 180));
    rendereles();
}

function render(canvasId, antialias = 1) {
    Module.setAntialias(antialias);
    let imageBufferHely = Module.render();
    let imageBufferMeret = Module.imageBufferSize();
    let imageBuffer = new Float32Array(
        wasmMemory.buffer,
        imageBufferHely,
        imageBufferMeret
    )
    let ctx = document.getElementById(canvasId).getContext("2d");
    ctx.clearRect(0, 0, jsCanvasSzelesseg, jsCanvasMagassag);

    let img = ctx.createImageData(jsCanvasSzelesseg, jsCanvasMagassag);
    let data = img.data;
    for (let i = 0; i < imageBufferMeret / 3; i++) {
        data[i * 4] = imageBuffer[i * 3];
        data[i * 4 + 1] = imageBuffer[i * 3 + 1];
        data[i * 4 + 2] = imageBuffer[i * 3 + 2];
        data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    Module.freeImageBuffer();
}

function rendereles() {
    let elsimitas = parseInt(document.getElementById("antialias").value);
    render("canvas", elsimitas);
}