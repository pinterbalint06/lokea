import { EquirectangularViewer } from "./libs/viewer/EquirectangularViewer.js";
import { degreeToRadian } from "./libs/math/mathUtils.js";

// |------------------|
// | GLOBAL VARIABLES |
// |------------------|
const canvasId = "canvas";

/** 
 * @type {EquirectangularViewer} */
let equirectangularViewer;

const imageList = [
    {
        "url": "/images/equirectangular/Cathedral.webp",
        width: 1920,
        height: 960
    },
    {
        "url": "/images/equirectangular/Herdecke.webp",
        width: 10836,
        height: 5418
    },
    {
        "url": "/images/equirectangular/test-equirectangular-image.webp",
        width: 5000,
        height: 2500
    },
    {
        "url": "/images/equirectangular/wittenberg.webp",
        width: 10000,
        height: 5000
    }
];

function setAutoRotate() {
    let isAutoRtoate = document.getElementById("autoRotate").checked;
    equirectangularViewer.setAutoRotate(isAutoRtoate);
}

function fullScreen() {
    equirectangularViewer.toggleFullscreen();
}

function clearImage() {
    equirectangularViewer.clearImage();
}

window.fullScreen = fullScreen;
window.clearImage = clearImage;

// |------------------------------|
// | MAIN LOOP AND INITIALIZATION |
// |------------------------------|

function createOptionsForImageList() {
    let select = document.getElementById("kepek");
    if (imageList.length >= 1) {
        let opti = document.createElement("option");
        opti.setAttribute("value", 0);
        opti.innerText = imageList[0].url.split("/").at(-1);
        opti.selected = true;
        select.appendChild(opti);
        for (let i = 1; i < imageList.length; i++) {
            let opti = document.createElement("option");
            opti.innerText = imageList[i].url.split("/").at(-1);
            opti.setAttribute("value", i);
            select.appendChild(opti);
        }
        select.addEventListener("change", async function () {
            if (imageList[select.value]) {
                equirectangularViewer.loadImage(imageList[select.value].url, imageList[select.value].width, imageList[select.value].height).then(function () {
                    console.log("image loaded");
                }).catch(function (e) {
                    console.log(e);
                    for (const key in e) {
                        console.log(key, e[key]);
                    }
                });
            }
        });
    }
}

async function loadHerdecke() {
    equirectangularViewer.clearArrows();
    await equirectangularViewer.loadImage(imageList[1].url, imageList[1].width, imageList[1].height, degreeToRadian(90));

    equirectangularViewer.addArrow(1, degreeToRadian(0), async () => {
        await equirectangularViewer.animateDirection(degreeToRadian(0), async () => {
            await loadCathedral();
        });
    });
}

async function loadCathedral() {
    equirectangularViewer.clearArrows();
    await equirectangularViewer.loadImage(imageList[0].url, imageList[0].width, imageList[0].height, degreeToRadian(0));

    equirectangularViewer.addArrow(1, degreeToRadian(90), async () => {
        await equirectangularViewer.animateDirection(degreeToRadian(90), async () => {
            await loadHerdecke();
        });
    });

    // TODO: ez a pelda tesztelese uj eszakirannyal
    // PELDA a progressziv betoltessel
    /**
        await equirectangularViewer.animateDirection(degreeToRadian(270), (markLoaded) => {
            return loadPointEquirectangularLowThenHigh({
                pointId: 104,
                isCurrent: () => {},
                loadToViewer: async (imgData) => {
                    await equirectangularViewer.loadImage(imgData.url, imgData.width, imgData.height);
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
}

async function init() {
    createOptionsForImageList();
    document.getElementById("autoRotate").addEventListener("change", setAutoRotate);

    equirectangularViewer = new EquirectangularViewer(
        canvasId,
        {
            "canvasWidth": 1000,
            "canvasHeight": 1000
        }
    );

    await equirectangularViewer.ready();

    let select = document.getElementById("kepek");
    if (imageList[0]) {
        await loadCathedral();
    }
}

document.addEventListener("DOMContentLoaded", init);
