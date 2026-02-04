import { MapViewer } from "./libs/viewer/MapViewer.js";

// |------------------|
// | GLOBAL VARIABLES |
// |------------------|
// Canvas settings
const jsCanvasSzelesseg = 1700;
const jsCanvasMagassag = 1000;
const canvasId = "canvas";

// The engine
let mapViewerEngine;

document.addEventListener("DOMContentLoaded", init);

function init() {
    mapViewerEngine = new MapViewer(canvasId, {
        "canvasWidth": jsCanvasSzelesseg,
        "canvasHeight": jsCanvasMagassag
    });
    mapViewerEngine.loadMap("/images/worldmap.webp")
        .then(function () {
            console.log("image loaded");
        }).catch(function (e) {
            console.log(e);
            for (const key in e) {
                console.log(key, e[key]);
            }
        });
}

function fullScreen() {
    mapViewerEngine.toggleFullscreen();
}

window.fullScreen = fullScreen;
