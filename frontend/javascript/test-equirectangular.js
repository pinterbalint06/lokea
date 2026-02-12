import { EquirectangularViewer } from "./libs/viewer/EquirectangularViewer.js";

// |------------------|
// | GLOBAL VARIABLES |
// |------------------|
const canvasId = "canvas";

/** 
 * @type {EquirectangularViewer} */
let equirectangularViewer;

const imageList = [
    {
        "url": "/api/map_creator/testImage",
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
    let select = document.getElementById("kepek");
    if (imageList[0]) {
        equirectangularViewer.loadImage(imageList[select.value].url, imageList[select.value].width, imageList[select.value].height).then(function () {
            console.log("image loaded");
        }).catch(function (e) {
            console.log(e);
            for (const key in e) {
                console.log(key, e[key]);
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", init);
