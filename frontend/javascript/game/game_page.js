import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";

const pictureCanvasWidth = document.getElementById("pictureCanvas").width;
const pictureCanvasHeight = document.getElementById("pictureCanvas").height;
const pictureCanvasId = "pictureCanvas";

const mapCanvasWidth = document.getElementById("mapCanvas").width;
const mapCanvasHeight = document.getElementById("mapCanvas").height;
const mapCanvasId = "mapCanvas";

/** 
 * @type {EquirectangularViewer} */
let equirectangularViewer;

// The engine
let mapViewerEngine;

const pictureImage = {
    "url": "/images/equirectangular/Cathedral.webp",
    width: 1920,
    height: 960
};

const mapImage = {
    "url": "/images/worldmap.webp",
    "width": 3840,
    "height": 1920
};

document.addEventListener("DOMContentLoaded", function () {
    init();
    createCountdownTimer();
});

function showCountdownStep(overlay, numberEl, steps, i, resolve) {
    numberEl.textContent = steps[i];
    numberEl.style.animation = "none";
    numberEl.offsetHeight; // reflow to restart animation
    numberEl.style.animation = "";

    i++;
    if (i < steps.length) {
        setTimeout(() => showCountdownStep(overlay, numberEl, steps, i, resolve), 1000);
    } else {
        setTimeout(() => {
            overlay.classList.remove("active");
            resolve();
        }, 1000);
    }
}

function createCountdownTimer() {
    return new Promise(resolve => {
        const overlay = document.getElementById("countdownOverlay");
        const numberEl = document.getElementById("countdownNumber");
        const steps = ["3", "2", "1", "Rajt!"];
        overlay.classList.add("active");
        showCountdownStep(overlay, numberEl, steps, 0, resolve);
    });
}

function init() {
    mapViewerEngine = new MapViewer(mapCanvasId, {
        "canvasWidth": mapCanvasWidth,
        "canvasHeight": mapCanvasHeight
    });
    mapViewerEngine.loadMap(mapImage.url, mapImage.width, mapImage.height)
        .then(function () {
            console.log("image loaded");
        }).catch(function (e) {
            console.log(e);
            for (const key in e) {
                console.log(key, e[key]);
            }
        });
    document.getElementById("autoRotate").addEventListener("change", setAutoRotate);

    equirectangularViewer = new EquirectangularViewer(pictureCanvasId, {
        "canvasWidth": pictureCanvasWidth,
        "canvasHeight": pictureCanvasHeight
    }
    );
    equirectangularViewer.loadImage(pictureImage.url, pictureImage.width, pictureImage.height).then(function () {
        console.log("image loaded");
    }).catch(function (e) {
        console.log(e);
        for (const key in e) {
            console.log(key, e[key]);
        }
    });
}


function mapFullScreen() {
    mapViewerEngine.toggleFullscreen();
}

function markerPosition() {
    console.log(mapViewerEngine.getMarkerPosition(0));
    return mapViewerEngine.getMarkerPosition(0);
}

function setAutoRotate() {
    let isAutoRtoate = document.getElementById("autoRotate").checked;
    equirectangularViewer.setAutoRotate(isAutoRtoate);
}

function pictureFullScreen() {
    equirectangularViewer.toggleFullscreen();
}

function clearImage() {
    equirectangularViewer.clearImage();
}

window.mapFullScreen = mapFullScreen;
window.markerPosition = markerPosition;
window.pictureFullScreen = pictureFullScreen;
window.clearImage = clearImage;
