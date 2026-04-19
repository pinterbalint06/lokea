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
});


function formatSecondsToMinutes(seconds) {
    let minutesPart = Math.floor(seconds / 60).toString().padStart(2, "0");
    let secondsPart = (seconds % 60).toString().padStart(2, "0");
    return `${minutesPart}:${secondsPart}`;
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
