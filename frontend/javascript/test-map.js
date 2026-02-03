import ModuleBuilder from './libs/webassembly/mapViewer/mapViewer.js';
import { CanvasInput } from './libs/viewer/CanvasInput.js';


// |------------------|
// | GLOBAL VARIABLES |
// |------------------|
// Canvas settings
const jsCanvasSzelesseg = 1700;
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
    let canvas = document.getElementById(canvasId);
    canvas.width = jsCanvasSzelesseg;
    canvas.height = jsCanvasMagassag;
    mapViewerEngine = new Module.MapViewerEngine(canvasId, jsCanvasSzelesseg, jsCanvasMagassag);
    mapViewerEngine.loadTextureFromUrl("/images/worldmap.webp", 0);
    let inputControls = new CanvasInput(canvas, {
        "mode": "2D",
        onRotate: (deltaX, deltaY) => {
            mapViewerEngine.moveMap(deltaX, deltaY);
        },
        onZoom: (zoomAmount) => {
            mapViewerEngine.zoom(zoomAmount);
        }
    });
    canvas.addEventListener("fullscreenchange", function () {
        if (canvas != document.fullscreenElement) {
            canvas.classList.add("border");
            mapViewerEngine.setCanvasSize(jsCanvasSzelesseg, jsCanvasMagassag);
        } else {
            canvas.classList.remove("border");
            console.log();
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
