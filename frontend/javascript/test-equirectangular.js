import { CanvasInput } from './CanvasInput.js';

// |------------------|
// | GLOBAL VARIABLES |
// |------------------|
// kamera tulajdonsagai
let fokuszTavolsag = 18.0;
const canvasId = "canvas";
const jsCanvasSzelesseg = 1000;
const jsCanvasMagassag = 1000;
let equirectangularEngine;

const imageList = [
    "/images/equirectangular/cathedral.jpg",
    "/images/equirectangular/Herdecke.jpg",
    "/images/equirectangular/test-equirectangular-image.jpg",
    "/images/equirectangular/wittenberg.jpg"
];

// |--------------------|
// | UTILITIES AND MATH |
// |--------------------|

function degToRad(angle) {
    return angle * (Math.PI / 180.0);
}

function fullScreen() {
    let canvas = document.getElementById(canvasId);
    canvas.requestFullscreen();
}

window.fullScreen = fullScreen;

// |------------------------------|
// | MAIN LOOP AND INITIALIZATION |
// |------------------------------|

function mainLoop() {
    if (document.getElementById('autoRotate').checked) {
        rotateCamera(0, 0.1);
    }
    equirectangularEngine.render();
    requestAnimationFrame(mainLoop);
}

function initModule(Module) {
    console.log("module betoltve");
    equirectangularEngine = new Module.EquirectangularEngine(canvasId);
    let select = document.getElementById("kepek");
    if (imageList.includes(select.value)) {
        imgFromURL(select.value);
    }
    requestAnimationFrame(mainLoop);

    let canvas = document.getElementById(canvasId);
    canvas.addEventListener("fullscreenchange", function () {
        if (canvas != document.fullscreenElement) {
            canvas.classList.add("border");
            equirectangularEngine.setCanvasSize(jsCanvasSzelesseg, jsCanvasMagassag);
        } else {
            canvas.classList.remove("border");
            equirectangularEngine.setCanvasSize(window.innerWidth, window.innerHeight);
        }
    });

    window.addEventListener("resize", function () {
        if (document.fullscreenElement) {
            equirectangularEngine.setCanvasSize(window.innerWidth, window.innerHeight);
        }
    });

    let inputControls = new CanvasInput(canvas, {
        focalLength: fokuszTavolsag,
        onRotate: (x, y) => {
            rotateCamera(x, y);
        },
        onZoom: (ujFokuszTavolsag) => {
            equirectangularEngine.setFocalLength(ujFokuszTavolsag);
        }
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    let canvas = document.getElementById(canvasId);
    canvas.width = jsCanvasSzelesseg;
    canvas.height = jsCanvasMagassag;

    let select = document.getElementById("kepek");
    if (imageList.length >= 1) {
        let opti = document.createElement("option");
        opti.setAttribute("value", imageList[0]);
        opti.innerText = imageList[0].split("/").at(-1);
        opti.selected = true;
        select.appendChild(opti);
        for (let i = 1; i < imageList.length; i++) {
            let opti = document.createElement("option");
            opti.innerText = imageList[i].split("/").at(-1);
            opti.setAttribute("value", imageList[i]);
            select.appendChild(opti);
        }
        select.addEventListener("change", function () {
            if (imageList.includes(select.value)) {
                imgFromURL(select.value);
            }
        });
    }

    createModule().then((Module) => {
        initModule(Module);
    });
});

// |------------------------|
// | MATERIALS AND TEXTURES |
// |------------------------|

function imgFromURL(url) {
    // get width and height
    equirectangularEngine.loadEquirectangularImage(url, 10700, 5418);
}

// |---------------------|
// | CAMERA AND MOVEMENT |
// |---------------------|

// rotate camera by degree
function rotateCamera(pitch, yaw) {
    equirectangularEngine.rotateCamera(degToRad(pitch), degToRad(yaw))
}
