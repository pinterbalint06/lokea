import { MapViewer } from "./libs/viewer/MapViewer.js";

const mapCanvasId = "mapCanvas";
let mapViewer;

async function processFile(file) {
    if (file.type.startsWith("image/")) {
        let imageUrl = URL.createObjectURL(file);
        let image = await createImageBitmap(file);
        await mapViewer.loadMap(
            imageUrl,
            image.width,
            image.height
        );
        image.close();
        URL.revokeObjectURL(imageUrl);
        let uploadOverlay = document.getElementById("upload-overlay");
        uploadOverlay.classList.add("d-none");
        let saveButton = document.getElementById("saveButton");
        saveButton.disabled = false;
    }
}

function handleFileSelect(event) {
    if (event.target.files.length > 0) {
        processFile(event.target.files[0]);
    }
}

async function handleDrop(event) {
    event.preventDefault();
    let imageFile = event.dataTransfer.items[0].getAsFile();
    await processFile(imageFile);
    event.dataTransfer.clearData();
}

function setupDragAndDrop() {
    let dropZone = document.getElementById("drop-zone");

    window.addEventListener("drop", (event) => {
        // prevents opening the image on a new page
        event.preventDefault();
    });

    window.addEventListener("dragover", (event) => {
        event.preventDefault();
        let imageItems = [];
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
            if (event.dataTransfer.items[i].kind == "file" && event.dataTransfer.items[i].type.startsWith("image/")) {
                imageItems.push(event.dataTransfer.items[i]);
            }
        }
        if (imageItems.length > 0 && dropZone.contains(event.target)) {
            event.dataTransfer.dropEffect = "copy";
        } else {
            event.dataTransfer.dropEffect = "none";
        }
    });

    dropZone.addEventListener("drop", handleDrop);
}

function init() {
    let canvas = document.getElementById(mapCanvasId);
    mapViewer = new MapViewer(
        mapCanvasId,
        {
            "canvasWidth": canvas.clientWidth,
            "canvasHeight": canvas.clientHeight
        }
    );
    setupDragAndDrop();
    let uploadButton = document.getElementById("uploadBtn");
    let fileInput = document.getElementById("fileInput");
    uploadButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileSelect);
}

document.addEventListener("DOMContentLoaded", init);
