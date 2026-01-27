import { EquirectangularViewer } from './EquirectangularViewer.js';

// |------------------|
// | GLOBAL VARIABLES |
// |------------------|
const canvasId = "canvas";
let equirectangularViewer;

const imageList = [
    {
        "url": "/images/equirectangular/Cathedral.jpg",
        width: 1920,
        height: 960
    },
    {
        "url": "/images/equirectangular/Herdecke.jpg",
        width: 10836,
        height: 5418
    },
    {
        "url": "/images/equirectangular/test-equirectangular-image.jpg",
        width: 5000,
        height: 2500
    },
    {
        "url": "/images/equirectangular/wittenberg.jpg",
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

window.fullScreen = fullScreen;

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
                    console.log(e)
                });
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    createOptionsForImageList();
    document.getElementById("autoRotate").addEventListener("change", setAutoRotate);

    equirectangularViewer = new EquirectangularViewer(canvasId);
    let select = document.getElementById("kepek");
    if (imageList[0]) {
        equirectangularViewer.loadImage(imageList[select.value].url, imageList[select.value].width, imageList[select.value].height);
    }
});
