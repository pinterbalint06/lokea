import ModuleBuilder from './libs/webassembly/mapViewer/mapViewer.js';
import { CanvasInput } from './libs/viewer/CanvasInput.js';
import { degreeToRadian } from './libs/math/mathUtils.js';


// |------------------|
// | GLOBAL VARIABLES |
// |------------------|
// Camera properties
let fokuszTavolsag = 18.0;

// Canvas settings
const jsCanvasSzelesseg = 1000;
const jsCanvasMagassag = 1000;
const canvasId = "canvas";

// The engine
let mapViewerEngine;
let Module;


document.addEventListener("DOMContentLoaded", init);

function init() {
    ModuleBuilder().then((modu) => {
        Module = modu;
        initModule();
    });
}

function initModule() {
    mapViewerEngine = new Module.MapViewerEngine(canvasId);
    mapViewerEngine.loadTextureFromUrl("/images/worldmap.webp", 0);
    let canvas = document.getElementById(canvasId);
    canvas.width = jsCanvasSzelesseg;
    canvas.height = jsCanvasMagassag;
    let inputControls = new CanvasInput(canvas, {
        focalLength: fokuszTavolsag,
        onRotate: (pitch, yaw) => {
            mapViewerEngine.rotateCamera(degreeToRadian(pitch), degreeToRadian(yaw));
        },
        onZoom: (ujFokuszTavolsag) => {
            mapViewerEngine.setFocalLength(ujFokuszTavolsag);
        }
    });
    canvas.addEventListener("fullscreenchange", function () {
        if (canvas != document.fullscreenElement) {
            canvas.classList.add("border");
            mapViewerEngine.setCanvasSize(jsCanvasSzelesseg, jsCanvasMagassag);
        } else {
            canvas.classList.remove("border");
            mapViewerEngine.setCanvasSize(window.innerWidth, window.innerHeight);
        }
    });

    window.addEventListener("resize", function () {
        if (document.fullscreenElement) {
            mapViewerEngine.setCanvasSize(window.innerWidth, window.innerHeight);
        }
    });
    requestAnimationFrame(mainLoop)
}

function mainLoop() {
    mapViewerEngine.render();
    requestAnimationFrame(mainLoop);
}

function fullScreen() {
    let canvas = document.getElementById(canvasId);
    canvas.requestFullscreen();
}

window.fullScreen = fullScreen;
