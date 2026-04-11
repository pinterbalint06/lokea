import { EquirectangularViewer } from "./libs/viewer/EquirectangularViewer.js";
import { degreeToRadian, normalizeAngleRadians, radianToDegree } from "./libs/math/mathUtils.js";

// |------------------|
// | GLOBAL VARIABLES |
// |------------------|
const canvasId = "canvas";

/** 
 * @type {EquirectangularViewer} */
let equirectangularViewer;

let isCurrentlyAnimating = false;

let currentActiveImageNorthDegrees = 0;

// |--------------|
// | MAP DATA     |
// |--------------|

const mapData = {
    "cathedral": {
        id: "cathedral",
        name: "Katedrális (Bal alsó)",
        url: "/images/equirectangular/Cathedral.webp",
        imageWidth: 1920,
        imageHeight: 960,
        northOffsetDegrees: 0,
        neighbors: [
            { id: "herdecke", yawDegrees: 90 },
            { id: "testImage", yawDegrees: 0 }
        ]
    },
    "herdecke": {
        id: "herdecke",
        name: "Herdecke (Jobb alsó)",
        url: "/images/equirectangular/Herdecke.webp",
        imageWidth: 10836,
        imageHeight: 5418,
        northOffsetDegrees: 90,
        neighbors: [
            { id: "cathedral", yawDegrees: 0 },
            { id: "wittenberg", yawDegrees: 90 }
        ]
    },
    "testImage": {
        id: "testImage",
        name: "Tesztkép (Bal felső)",
        url: "/images/equirectangular/test-equirectangular-image.webp",
        imageWidth: 5000,
        imageHeight: 2500,
        northOffsetDegrees: 315,
        neighbors: [
            { id: "cathedral", yawDegrees: 135 },
            { id: "wittenberg", yawDegrees: 45 }
        ]
    },
    "wittenberg": {
        id: "wittenberg",
        name: "Wittenberg (Jobb felső)",
        url: "/images/equirectangular/wittenberg.webp",
        imageWidth: 10000,
        imageHeight: 5000,
        northOffsetDegrees: 180,
        neighbors: [
            { id: "herdecke", yawDegrees: 0 },
            { id: "testImage", yawDegrees: 90 }
        ]
    }
};

// |-------------------|
// | MAP NAVIGATION    |
// |-------------------|

async function loadMap(mapId) {
    let targetMapNode = mapData[mapId];

    if (targetMapNode) {
        let northOffsetRadians = degreeToRadian(targetMapNode.northOffsetDegrees);
        currentActiveImageNorthDegrees = targetMapNode.northOffsetDegrees;

        equirectangularViewer.clearArrows();

        let arrowIdCounter = 1;

        await equirectangularViewer.loadImage(
            targetMapNode.url,
            targetMapNode.imageWidth,
            targetMapNode.imageHeight,
            northOffsetRadians
        );

        let neighborList = targetMapNode.neighbors;
        for (let i = 0; i < neighborList.length; i++) {
            let neighborData = neighborList[i];
            let neighborId = neighborData.id;

            if (mapData[neighborId]) {
                let absoluteArrowYawRadians = normalizeAngleRadians(degreeToRadian(neighborData.yawDegrees));

                equirectangularViewer.addArrow(arrowIdCounter, absoluteArrowYawRadians, async () => {
                    await arrowAnimation(neighborId, absoluteArrowYawRadians);
                });
                arrowIdCounter++
            }
        }

        let mapSelect = document.getElementById("mapSelect");
        mapSelect.value = mapId;
    }
}

async function arrowAnimation(targetNodeId, absoluteArrowYawRadians) {
    isCurrentlyAnimating = true;

    try {
        await equirectangularViewer.animateDirection(absoluteArrowYawRadians, async (markAsLoadedCallback) => {
            await loadMap(targetNodeId);
            markAsLoadedCallback();
        });
    } catch (error) {
        console.error("Animation error: ", error);
    } finally {
        isCurrentlyAnimating = false;
    }
}

// |------------------|
// | DEBUG STATE      |
// |------------------|

function updateDebugStateLoop() {
    let currentHeadingRadians = equirectangularViewer.getHeading();
    let currentYawRadians = equirectangularViewer.getYaw();
    let currentPitchRadians = equirectangularViewer.getPitch();
    let currentZoomValue = equirectangularViewer.getZoom();

    let headingDegrees = radianToDegree(currentHeadingRadians);
    let yawDegrees = radianToDegree(currentYawRadians);
    let pitchDegrees = radianToDegree(currentPitchRadians);

    document.getElementById("debugImageNorthText").innerText = currentActiveImageNorthDegrees.toFixed(2);
    document.getElementById("debugHeadingText").innerText = headingDegrees.toFixed(2);
    document.getElementById("debugYawText").innerText = yawDegrees.toFixed(2);
    document.getElementById("debugPitchText").innerText = pitchDegrees.toFixed(2);
    document.getElementById("debugZoomText").innerText = currentZoomValue.toFixed(2);

    let animationStatus = document.getElementById("debugAnimationStatusText");
    if (isCurrentlyAnimating) {
        animationStatus.innerText = "Folyamatban";
        animationStatus.style.color = "var(--accent-glow)";
    } else {
        animationStatus.innerText = "Nincs";
        animationStatus.style.color = "var(--state-success)";
    }

    requestAnimationFrame(updateDebugStateLoop);
}

// |------------|
// | UI EVENTS  |
// |------------|

function initSelect() {
    let mapSelect = document.getElementById("mapSelect");

    for (const key in mapData) {
        const currentMap = mapData[key];

        let newOptionElement = document.createElement("option");
        newOptionElement.value = currentMap.id;
        newOptionElement.innerText = currentMap.name;

        mapSelect.appendChild(newOptionElement);
    }

    mapSelect.addEventListener("change", async function () {
        await loadMap(mapSelect.value);
    });
}

function initSettings() {
    document.getElementById("autoRotateCheckbox").addEventListener("change", function () {
        let isAutoRotateEnabled = document.getElementById("autoRotateCheckbox").checked;
        equirectangularViewer.setAutoRotate(isAutoRotateEnabled);
    });

    document.getElementById("buttonSetHeading").addEventListener("click", function () {
        let headingDegrees = parseFloat(document.getElementById("inputHeading").value);
        if (!Number.isNaN(headingDegrees)) {
            equirectangularViewer.setHeading(degreeToRadian(headingDegrees));
        }
    });

    document.getElementById("buttonSetYaw").addEventListener("click", function () {
        let yawDegrees = parseFloat(document.getElementById("inputYaw").value);
        if (!Number.isNaN(yawDegrees)) {
            equirectangularViewer.setYaw(degreeToRadian(yawDegrees));
        }
    });

    document.getElementById("buttonSetPitch").addEventListener("click", function () {
        let pitchDegrees = parseFloat(document.getElementById("inputPitch").value);
        if (!Number.isNaN(pitchDegrees)) {
            equirectangularViewer.setPitch(degreeToRadian(pitchDegrees));
        }
    });

    document.getElementById("buttonSetZoom").addEventListener("click", function () {
        let zoomAmount = parseFloat(document.getElementById("inputZoom").value);
        if (!Number.isNaN(zoomAmount)) {
            equirectangularViewer.setZoom(zoomAmount);
        }
    });
}

function initTestAnimation() {
    document.getElementById("buttonTestAnimation").addEventListener("click", async function () {
        let targetYawDegrees = parseFloat(document.getElementById("inputAnimationYaw").value);
        if (!Number.isNaN(targetYawDegrees)) {
            let targetYawRadians = degreeToRadian(targetYawDegrees);

            isCurrentlyAnimating = true;
            try {
                await equirectangularViewer.animateDirection(targetYawRadians, async () => { });
            } catch (error) {
                console.error("Test animation error:", error);
            } finally {
                isCurrentlyAnimating = false;
            }
        }
    });
}

function initFooterButtons() {
    document.getElementById("buttonFullScreen").addEventListener("click", () => { equirectangularViewer.toggleFullscreen(); });

    document.getElementById("buttonClearImage").addEventListener("click", () => { equirectangularViewer.clearImage(); });
}

function initUI() {
    initSelect();
    initSettings();
    initTestAnimation();
    initFooterButtons();
}

// |------------------------------|
// | MAIN INITIALIZATION          |
// |------------------------------|

async function init() {
    initUI();

    equirectangularViewer = new EquirectangularViewer(canvasId);

    await equirectangularViewer.ready();

    let startingImage = "cathedral";
    await loadMap(startingImage);

    requestAnimationFrame(updateDebugStateLoop);
}

document.addEventListener("DOMContentLoaded", init);

// PELDA a progressziv betoltessel
/**
    await equirectangularViewer.animateDirection(degreeToRadian(270), (markLoaded) => {
        return loadPointEquirectangularLowThenHigh({
            pointId: 104,
            isCurrent: () => {},
            loadToViewer: async (imgData) => {
                await equirectangularViewer.loadImage(imgData.url, imgData.width, imgData.height, degreeToRadian(imgData.northDirection));
            },
            onLowReady: () => {
                // elozo nyilak eltavolitasa
                equirectangularViewer.clearArrows();

                // eszakirany beallitasa
                equirectangularViewer.setYaw(degreeToRadian(northDirection));

                itt lehet for a kapcsolatokon

                const kapcsolatIrany = (vektorokbol vagy az adatbazisbol);
                equirectangularViewer.addArrow(kapcsolatid, degreeToRadian(kapcsolatIrany), async () => {
                    await equirectangularViewer.animateDirection(degreeToRadian(kapcsolatIrany), async () => {
                        masik kep betoltese it loadPointEquirectangularLowThenHigh-val es akkor a kapcsolat masik vegpont idjaval
                    });
                });
                markLoaded();
            }
        });
    });
 */
