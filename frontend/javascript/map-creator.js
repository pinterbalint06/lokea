import { MapViewer } from "./libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "./libs/viewer/EquirectangularViewer.js";

// |------------------|
// | GLOBAL VARIABLES |
// |------------------|
const ICONS = {
    POINTING_HAND: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84.91 122.88" style="height: 2em;" fill="white">
            <path d="M26.6,80.57c-0.11-0.06-0.25-0.14-0.37-0.23c-1.49-1.18-3.13-2.51-4.54-3.66c-2.06-1.69-4.43-3.64-6.09-5.02 c-1.13-0.93-2.42-1.58-3.63-1.83c-0.79-0.14-1.49-0.14-2.06,0.08c-0.45,0.2-0.85,0.56-1.1,1.13c-0.34,0.76-0.51,1.83-0.42,3.3 c0.08,1.3,0.54,2.71,1.13,4.09c0.87,2,2.09,3.86,2.99,5.04c0.06,0.08,0.11,0.14,0.14,0.23l17.84,25.48 c0.23,0.34,0.37,0.71,0.39,1.07c0.37,2.93,0.99,5.16,1.89,6.54c0.68,1.01,1.52,1.52,2.62,1.49h28.07c1.75-0.03,3.33-0.53,4.79-1.55 c1.61-1.1,3.04-2.82,4.37-5.13c0.03-0.03,0.06-0.08,0.08-0.11c0.51-0.87,1.18-2,1.83-3.07c2.85-4.68,5.33-8.77,5.61-14.57l-0.17-8 c-0.03-0.11-0.03-0.23-0.03-0.34s0-0.87,0.03-1.89c0.06-5.3,0.14-11.84-4.71-12.65h-3.13c-0.03,1.49-0.11,3.02-0.2,4.48 c-0.08,1.32-0.17,2.56-0.17,3.78c0,1.3-1.04,2.34-2.34,2.34c-1.3,0-2.34-1.04-2.34-2.34c0-1.21,0.08-2.62,0.17-4.09 c0.31-4.99,0.68-10.71-3.3-11.41h-3.1c-0.17,0-0.34-0.03-0.51-0.06c0.03,1.8-0.08,3.66-0.2,5.47C60.08,70.46,60,71.7,60,72.91 c0,1.3-1.04,2.34-2.34,2.34c-1.3,0-2.34-1.04-2.34-2.34c0-1.21,0.08-2.62,0.17-4.09c0.31-4.99,0.68-10.71-3.3-11.41h-3.1 c-0.23,0-0.42-0.03-0.62-0.08v9.1c0,1.3-1.04,2.34-2.34,2.34c-1.3,0-2.34-1.04-2.34-2.34V41.99c0-4.09-1.66-6.68-3.8-7.75 c-0.79-0.4-1.63-0.59-2.45-0.59c-0.82,0-1.66,0.2-2.45,0.59c-2.11,1.07-3.75,3.66-3.75,7.86v42.81c0,1.3-1.04,2.34-2.34,2.34 c-1.3,0-2.34-1.04-2.34-2.34v-4.34H26.6L26.6,80.57z M39.29,13.99c0,1.55-1.26,2.78-2.78,2.78c-1.55,0-2.78-1.26-2.78-2.78V2.78 c0-1.55,1.26-2.78,2.78-2.78c1.55,0,2.78,1.26,2.78,2.78V13.99L39.29,13.99L39.29,13.99z M13.99,36.95c1.55,0,2.78,1.26,2.78,2.78 c0,1.55-1.26,2.78-2.78,2.78H2.78C1.23,42.5,0,41.24,0,39.73c0-1.55,1.26-2.78,2.78-2.78H13.99L13.99,36.95z M21.92,20.33 c1.08,1.08,1.08,2.85,0,3.93c-1.08,1.08-2.85,1.08-3.93,0l-7.9-7.93c-1.08-1.08-1.08-2.85,0-3.93c1.08-1.08,2.85-1.08,3.93,0 L21.92,20.33L21.92,20.33z M58.47,42.5c-1.55,0-2.78-1.26-2.78-2.78c0-1.55,1.26-2.78,2.78-2.78h11.21c1.55,0,2.78,1.26,2.78,2.78 c0,1.55-1.26,2.78-2.78,2.78H58.47L58.47,42.5z M54.47,23.65c-1.08,1.08-2.85,1.08-3.93,0c-1.08-1.08-1.08-2.85,0-3.93l7.9-7.93 c1.08-1.08,2.85-1.08,3.93,0c1.08,1.08,1.08,2.85,0,3.93L54.47,23.65L54.47,23.65z M48.47,52.79c0.2-0.06,0.39-0.08,0.62-0.08h3.24 c0.17,0,0.37,0.03,0.53,0.06c4.31,0.68,6.26,3.19,7.05,6.45c0.31-0.14,0.65-0.23,0.99-0.23h3.24c0.17,0,0.37,0.03,0.53,0.06 c4.65,0.73,6.51,3.58,7.19,7.19c0.11-0.03,0.23-0.03,0.37-0.03h3.24c0.17,0,0.37,0.03,0.54,0.06c8.91,1.38,8.79,10.23,8.71,17.36 v1.86l0.2,8.23v0.25c-0.34,7.02-3.1,11.56-6.28,16.8c-0.54,0.87-1.07,1.77-1.8,3.02c-0.03,0.03-0.03,0.06-0.06,0.08 c-1.66,2.9-3.58,5.13-5.78,6.65c-2.23,1.55-4.71,2.34-7.41,2.37H35.53c-2.79,0.06-4.96-1.16-6.57-3.55c-1.3-1.92-2.14-4.62-2.59-8 L8.9,86.35l-0.09-0.08c-1.04-1.38-2.45-3.55-3.52-5.95c-0.79-1.8-1.38-3.75-1.52-5.67c-0.14-2.28,0.17-4.09,0.82-5.52 c0.79-1.78,2.09-2.93,3.64-3.55c1.44-0.59,3.07-0.68,4.71-0.34c1.97,0.4,4,1.38,5.72,2.82c1.41,1.18,3.78,3.1,6.09,4.99l1.92,1.58 V42.13c0-6.23,2.76-10.23,6.34-12.04c1.44-0.73,2.99-1.1,4.57-1.1c1.58,0,3.13,0.37,4.56,1.1c3.58,1.8,6.4,5.83,6.4,11.95v10.76 L48.47,52.79L48.47,52.79z" />
          </svg>`,
    UPLOAD_TO_CLOUD: `<svg xmlns="http://www.w3.org/2000/svg" style="height: 1em;" fill="white" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 511.52"><path fill-rule="nonzero" d="M36.75 0h438.5C495.55 0 512 16.82 512 37.03v437.46c0 20.19-16.47 37.03-36.75 37.03H98.28c-2.89 0-5.5-1.17-7.39-3.06L3.06 420.62A10.387 10.387 0 0 1 0 413.24V37.03C0 16.81 16.45 0 36.75 0zM174.5 447.79c-13.75 0-13.75-20.9 0-20.9h153.97c13.74 0 13.74 20.9 0 20.9H174.5zm0-64.38c-13.75 0-13.75-20.9 0-20.9h153.97c13.74 0 13.74 20.9 0 20.9H174.5zm209.51 106.91V350.25c0-16.78-13.87-30.64-30.65-30.64H149.6c-16.78 0-30.64 13.86-30.64 30.64v140.07h265.05zm20.89-140.07v140.37h70.35c8.85 0 15.85-7.37 15.85-16.13V37.03c0-8.78-6.99-16.13-15.85-16.13H404.9v170.17c0 28.31-23.23 51.55-51.54 51.55H149.6c-28.34 0-51.54-23.21-51.54-51.55V20.9H36.75c-8.87 0-15.85 7.34-15.85 16.13v371.88l77.16 77.16V350.25c0-28.32 23.22-51.54 51.54-51.54h203.76c28.22 0 51.54 23.32 51.54 51.54zm-20.89-159.18V20.9H118.96v170.17c0 16.8 13.85 30.65 30.64 30.65h203.76c16.77 0 30.65-13.88 30.65-30.65z"/></svg>`
};
const mapCanvasId = "mapCanvas";
const equirectangularCanvasId = "equirectangularPreview";
/**
 * @type {MapViewer}
 */
let mapViewer;
/**
 * @type {EquirectangularViewer}
 */
let equirectangularViewer;
let isPlacingMarker = false;
let UI = {};
const TEMP_MARKER_ID = -1;
let activePointId = null;
let clickOnMapToast;

// |-----------|
// |  UTILITY  |
// |-----------|

function showToast(message, type = "primary", isClosable, options = {}, iconHtml = "") {
    // Create element
    let toastElement = document.createElement('div');
    toastElement.classList.add("toast", "align-items-center", "border-0", "text-bg-" + type);
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');

    let toastDiv = document.createElement("div");
    toastDiv.classList.add("d-flex");

    let toastBody = document.createElement("div");
    toastBody.classList.add("toast-body", "d-flex", "align-items-center");

    toastBody.insertAdjacentHTML('beforeend', iconHtml);

    let messageP = document.createElement("p");
    messageP.classList.add("my-0", "ms-2", "p-0");
    messageP.innerText = message;
    toastBody.appendChild(messageP);

    toastDiv.appendChild(toastBody);

    toastElement.appendChild(toastDiv);

    if (isClosable) {
        let closeButton = document.createElement("button");
        closeButton.setAttribute("type", "button");
        closeButton.setAttribute("data-bs-dismiss", "toast");
        closeButton.setAttribute("aria-label", "Close");
        closeButton.classList.add("btn-close", "btn-close-white", "me-2", "m-auto");
        toastDiv.appendChild(closeButton);
    }

    toastElement.appendChild(toastDiv);

    UI.toastPlace.appendChild(toastElement);

    let toast = new bootstrap.Toast(toastElement, options);
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toast = null;
        toastElement.remove();
    });
    return toast;
}

async function readImageFile(file) {
    if (!file.type.startsWith("image/")) {
        throw new Error("Csak kép elfogadott!");
    }

    let url = URL.createObjectURL(file);
    let imageBitmap;
    try {
        imageBitmap = await createImageBitmap(file);
        let returnObject = {
            url: url,
            width: imageBitmap.width,
            height: imageBitmap.height
        }
        imageBitmap.close();
        return returnObject;
    } catch (error) {
        URL.revokeObjectURL(url);
        if (imageBitmap) {
            imageBitmap.close();
        }
        throw error;
    }
}

// |------------------|
// |  EVENT HANDLERS  |
// |------------------|

function handleCoordinateChange(event) {
    let xCoordinate = UI.coordinateXInput.valueAsNumber;
    let yCoordinate = UI.coordinateYInput.valueAsNumber;
    let isValid = mapViewer.checkCoordinateValid(xCoordinate, yCoordinate);
    if (isValid.correct) {
        event.target.dataset.previousValue = event.target.valueAsNumber;
        mapViewer.moveMarkerToImageCoordinates(activePointId, xCoordinate, yCoordinate);
    } else {
        event.target.value = event.target.dataset.previousValue;
        showToast(isValid.error, "danger", false, { delay: 3000 });
    }
}

async function handleEquirectangularLoad(file) {
    equirectangularViewer.clearImage();
    UI.savePointButton.disabled = true;
    let imgData;
    try {
        if (file.size > 10 * 1024 * 1024) {
            throw new Error("Túl nagy fájlméret! (Max 10MB)");
        }
        imgData = await readImageFile(file);

        await equirectangularViewer.loadImage(imgData.url, imgData.width, imgData.height);

        mapViewer.changeMarkerType(activePointId, "UPLOADING");
        uploadEquirectangular(file, imgData, activePointId);

        UI.equiFullscreenBtn.disabled = false;
    } catch (error) {
        console.error(error);
        showToast(error.message, "danger", false, { delay: 3000 });
    } finally {
        if (imgData) {
            if (imgData.url) {
                URL.revokeObjectURL(imgData.url);
            }
        }
    }
}

async function handleMapLoad(file) {
    let imgData;
    try {
        if (file.size > 10 * 1024 * 1024) {
            throw new Error("Túl nagy fájlméret! (Max 10MB)");
        }
        imgData = await readImageFile(file);

        await mapViewer.loadMap(imgData.url, imgData.width, imgData.height);

        UI.uploadOverlay.classList.add("d-none");
        UI.saveButton.disabled = false;
    } catch (error) {
        console.error(error);
        showToast(error.message, "danger", false, { delay: 3000 });
    } finally {
        if (imgData) {
            if (imgData.url) {
                URL.revokeObjectURL(imgData.url);
            }
        }
    }
}

function fullscreenEquirectangular() {
    equirectangularViewer.toggleFullscreen();
}

function savePreviousValue(event) {
    event.target.dataset.previousValue = event.target.valueAsNumber;
}

async function saveMap() {
    try {
        let response = await fetch("/api/map_creator/saveMap", {
            method: "POST"
        });
        let data = await response.json();
        if (data.success) {
            showToast("Térkép sikeresen mentve!", "success", true, { delay: 3000 }, ICONS.UPLOAD_TO_CLOUD);
            UI.saveButton.disabled = true;
        } else {
            throw new Error("Sikertelen mentés!");
        }
    } catch (error) {
        showToast("Sikertelen mentés!", "danger", true, { delay: 3000 });
        UI.saveButton.disabled = false;
    }
}

async function savePoint() {
    let pontMentesToast = showToast("Pont mentése...", "primary", false, { autohide: false });
    UI.savePointButton.disabled = true;
    try {
        let response = await fetch("/api/map_creator/savePoint", {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(mapViewer.getMarkerPosition(activePointId))
        });
        let data = await response.json();
        pontMentesToast.hide();
        if (data.success) {
            showToast("Pont sikeresen mentve!", "success", true, { delay: 3000 }, ICONS.UPLOAD_TO_CLOUD);
            equirectangularViewer.clearImage();
            mapViewer.changeMarkerId(activePointId, data.pointId);
            mapViewer.changeMarkerType(data.pointId, "READY");
            UI.collapseBootstrapElement.hide();

            activePointId = null;
            isPlacingMarker = false;
            mapViewer.canvasInput.setDefaultCursor("default");
            UI.savePointButton.disabled = true;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        pontMentesToast.hide();
        console.error(data.error);
        showToast(error.message, "danger", true, { delay: 3000 });
        UI.savePointButton.disabled = false;
    }

}

function updateCoordinatesInput() {
    let coordinates = mapViewer.getMarkerPosition(activePointId);
    UI.coordinateXInput.value = coordinates.x;
    UI.coordinateYInput.value = coordinates.y;
}

function placeOrMoveMarker(cursorX, cursorY) {
    if (mapViewer.doesMarkerExist(activePointId)) {
        mapViewer.moveMarker(activePointId, cursorX, cursorY);
    } else {
        mapViewer.placeMarker(activePointId, cursorX, cursorY, "EMPTY");
        if (clickOnMapToast) {
            clickOnMapToast.hide();
        }
        UI.collapseBootstrapElement.show();
    }
    updateCoordinatesInput();
}

function clickOnCanvas(cursorX, cursorY) {
    if (isPlacingMarker) {
        placeOrMoveMarker(cursorX, cursorY);
    } else {
        let clickedMarkerIndex = mapViewer.getMarkerAtClick(cursorX, cursorY);
        if (clickedMarkerIndex != -1) {
            activePointId = clickedMarkerIndex;
            mapViewer.changeMarkerType(activePointId, "EDIT");



            // load image from backend




            updateCoordinatesInput();
            UI.collapseBootstrapElement.show();
        }
    }
}

function closeCollapse() {
    if (mapViewer.getMarkerType(activePointId) == "empty") {
        mapViewer.removeMarker(activePointId);
    } else {
        // for now say that this is ready
        mapViewer.changeMarkerType(activePointId, "READY");
    }
    UI.collapseBootstrapElement.hide();
    activePointId = null;
    isPlacingMarker = false;
    mapViewer.canvasInput.setDefaultCursor("default");
}

// |--------------------|
// |  UPLOAD FUNCTIONS  |
// |--------------------|

async function uploadEquirectangular(file, imgData, markerIndex) {
    let formData = new FormData();

    formData.append("uploadedFile", file);
    let feltoltesToast = showToast("Kép feltöltése...", "primary", false, { autohide: false });
    let response = await fetch("/api/map_creator/uploadEquirectangularImage", {
        "method": "POST",
        "body": formData
    });
    let data = await response.json();
    feltoltesToast.hide();
    if (data.success) {
        UI.savePointButton.disabled = false;
        mapViewer.changeMarkerType(markerIndex, "EDIT");
        showToast("Kép sikeresen feltöltve!", "success", true, { delay: 3000 });
    } else {
        console.error(data.error);
        showToast("Sikertelen kép feltöltés!", "danger", true, { delay: 3000 });
    }
}

// |-------------------|
// |  SETUP FUNCTIONS  |
// |-------------------|

function setupCoordinateInput() {
    UI.coordinateXInput.addEventListener("focus", savePreviousValue);
    UI.coordinateYInput.addEventListener("focus", savePreviousValue);
    UI.coordinateXInput.addEventListener("change", handleCoordinateChange);
    UI.coordinateYInput.addEventListener("change", handleCoordinateChange);
}

function setupEquirectangularViewer() {
    equirectangularViewer = new EquirectangularViewer(equirectangularCanvasId);
}

function setupMapViewer() {
    mapViewer = new MapViewer(mapCanvasId);
    mapViewer.onClickHandler = clickOnCanvas;
}

function setupFileUploadInput(buttonElement, inputElement, onFileLoaded) {
    buttonElement.addEventListener('click', () => inputElement.click());

    inputElement.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            onFileLoaded(event.target.files[0]);
        }
        event.target.value = '';
    });
}

function setupUploadHandler(dropZoneElement, buttonElement, inputElement, onFileLoaded) {
    setupFileUploadInput(buttonElement, inputElement, onFileLoaded);

    dropZoneElement.addEventListener('dragover', (event) => {
        event.preventDefault();
        let draggedFiles = [];
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
            if (event.dataTransfer.items[i].kind == "file") {
                draggedFiles.push(event.dataTransfer.items[i]);
            }
        }

        if (draggedFiles.length > 0) {
            event.dataTransfer.dropEffect = "copy";
            dropZoneElement.classList.add('border-primary');
        } else {
            event.dataTransfer.dropEffect = "none";
        }
    });

    dropZoneElement.addEventListener('dragleave', (event) => {
        event.preventDefault();
        dropZoneElement.classList.remove('border-primary');
    });

    dropZoneElement.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZoneElement.classList.remove('border-primary');

        let files = event.dataTransfer.files;
        if (files.length > 0) {
            onFileLoaded(files[0]);
        }
    });
}

// |------------------|
// |  INITIALIZATION  |
// |------------------|

function init() {
    // buttons
    UI.saveButton = document.getElementById("saveButton");
    UI.uploadButtonMap = document.getElementById("uploadBtn");
    UI.plusMarkerBtn = document.getElementById("plusBtn");
    UI.uploadButtonEquirectangular = document.getElementById("uploadEquirectangularBtn");
    UI.savePointButton = document.getElementById("savePointButton");
    UI.equiFullscreenBtn = document.getElementById("equirectangularFullscreen");
    UI.closeCollapse = document.getElementById("closeCollapse");

    // inputs
    UI.fileInputMap = document.getElementById("fileInput");
    UI.fileInputEquirectangular = document.getElementById("fileInputEquirectangular");
    UI.coordinateXInput = document.getElementById("coordinateX");
    UI.coordinateYInput = document.getElementById("coordinateY");

    // canvas
    UI.mapCanvas = document.getElementById(mapCanvasId);
    UI.equirectangularPreview = document.getElementById(equirectangularCanvasId);

    // drop zone
    UI.dropZoneMap = document.getElementById("drop-zone");
    UI.dropZoneEquirectangular = document.getElementById("drop-zone-equirectangular");

    // other
    UI.uploadOverlay = document.getElementById("upload-overlay");
    UI.toastPlace = document.getElementById("toastPlace");
    UI.collapseElement = document.getElementById("ujPontCollapse");

    UI.collapseElement.addEventListener('hidden.bs.collapse', () => {
        if (equirectangularViewer) {
            equirectangularViewer.clearImage();
        }
        activePointId = null;
        UI.plusMarkerBtn.classList.remove("d-none");
    });
    UI.collapseBootstrapElement = new bootstrap.Collapse(UI.collapseElement, {
        toggle: false
    });
    UI.equiFullscreenBtn.addEventListener("click", fullscreenEquirectangular);
    UI.saveButton.addEventListener("click", saveMap);
    UI.savePointButton.addEventListener("click", savePoint);
    UI.closeCollapse.addEventListener("click", closeCollapse);

    // setup
    setupMapViewer();
    setupEquirectangularViewer();
    setupUploadHandler(UI.dropZoneMap, UI.uploadButtonMap, UI.fileInputMap, handleMapLoad);
    setupUploadHandler(UI.dropZoneEquirectangular, UI.uploadButtonEquirectangular, UI.fileInputEquirectangular, handleEquirectangularLoad);
    setupCoordinateInput();

    UI.plusMarkerBtn.addEventListener("click", () => {
        UI.plusMarkerBtn.classList.add("d-none");
        mapViewer.canvasInput.setDefaultCursor("crosshair");

        activePointId = TEMP_MARKER_ID;

        clickOnMapToast = showToast("Koppints a térképre a jelölő elhelyezéséhez!", "primary", true, { autohide: false }, ICONS.POINTING_HAND);
        isPlacingMarker = true;
    });
}

document.addEventListener("DOMContentLoaded", init);
