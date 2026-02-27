import { appState, editorState, uiState } from "./state.js";
import { CONSTANTS } from "./constants.js";

export const UI = {};

export function getUIElements() {
    // buttons
    UI.saveButton = document.getElementById("saveButton");
    UI.uploadButtonMap = document.getElementById("uploadBtn");
    UI.plusMarkerBtn = document.getElementById("plusBtn");
    UI.uploadButtonEquirectangular = document.getElementById("uploadEquirectangularBtn");
    UI.savePointButton = document.getElementById("savePointButton");
    UI.equiFullscreenBtn = document.getElementById("equirectangularFullscreen");
    UI.closeCollapse = document.getElementById("closeCollapse");
    UI.addNewMapBtn = document.getElementById("addNewMapBtn");
    UI.newConnectionBtn = document.getElementById("kapcsolatLetrehozasaBtn");

    // inputs
    UI.fileInputMap = document.getElementById("fileInput");
    UI.fileInputEquirectangular = document.getElementById("fileInputEquirectangular");
    UI.coordinateXInput = document.getElementById("coordinateX");
    UI.coordinateYInput = document.getElementById("coordinateY");
    UI.mapSelect = document.getElementById("mapSelect");
    UI.northDirectionRange = document.getElementById("northDirectionRange");
    UI.northDirection = document.getElementById("northDirection");

    // canvas
    UI.mapCanvas = document.getElementById(CONSTANTS.MAP_CANVAS_ID);
    UI.equirectangularPreview = document.getElementById(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID);

    // drop zone
    UI.dropZoneMap = document.getElementById("drop-zone");
    UI.dropZoneEquirectangular = document.getElementById("drop-zone-equirectangular");

    // other
    UI.loadingOverlay = document.getElementById("loading");
    UI.uploadOverlay = document.getElementById("upload-overlay");
    UI.toastPlace = document.getElementById("toastPlace");
    UI.collapseElement = document.getElementById("ujPontCollapse");
    UI.mapSelector = document.getElementById("mapSelector");
    UI.floatingButtonDiv = document.getElementById("floatingButtonDiv");
    UI.connectionsList = document.getElementById("kapcsolatokLista");
    UI.emptyConnections = document.getElementById("nincsenekKapcsolatok");
    UI.collapseBootstrapElement = new bootstrap.Collapse(
        UI.collapseElement,
        {
            toggle: false
        }
    );
}

export function updateMapSelectorUI() {
    UI.mapSelect.innerHTML = "";

    for (const mapObject in appState.maps) {
        let option = document.createElement("option");
        option.value = appState.maps[mapObject].id;
        option.text = appState.maps[mapObject].name;
        UI.mapSelect.appendChild(option);
    }
}

export function updateCoordinatesInput() {
    let coordinates = appState.mapViewer.getMarkerPosition(editorState.activePointId);
    UI.coordinateXInput.value = coordinates.x;
    UI.coordinateYInput.value = coordinates.y;
}

export async function updateConnectionListUI() {
    await appState.connectionsLoadPromise;

    UI.connectionsList.innerHTML = "";

    let connections = appState.connectionsList.filter(connection => connection.start_point_id == editorState.activePointId || connection.end_point_id == editorState.activePointId);

    for (let i = 0; i < editorState.unsavedConnections.length; i++) {
        connections.push(editorState.unsavedConnections[i]);
    }

    if (connections.length == 0) {
        UI.emptyConnections.classList.remove("d-none");
        UI.connectionsList.classList.add("d-none");
    } else {
        UI.emptyConnections.classList.add("d-none");
        UI.connectionsList.classList.remove("d-none");

        // TODO: pontoknak nev adas is itt aszerint megjelnites
        let template = document.getElementById("connection-card-template");
        let fragment = document.createDocumentFragment();
        for (let i = 0; i < connections.length; i++) {
            // deep clone true
            let clone = template.content.cloneNode(true);
            clone.querySelector(".start-id").textContent = connections[i].start_point_id;
            clone.querySelector(".end-id").textContent = connections[i].end_point_id;
            clone.querySelector(".kapcsolat-kartya").addEventListener("mouseenter", () => {
                appState.mapViewer.changeLineType(connections[i].connection_id, "focused");
            });
            clone.querySelector(".kapcsolat-kartya").addEventListener("click", () => {
                let pos1 = appState.mapViewer.getMarkerPosition(connections[i].start_point_id);
                let pos2 = appState.mapViewer.getMarkerPosition(connections[i].end_point_id);
                let centerX = (pos1.x + pos2.x) / 2;
                let centerY = (pos1.y + pos2.y) / 2;
                appState.mapViewer.moveTo(centerX, centerY);
            });
            clone.querySelector(".kapcsolat-kartya").addEventListener("mouseleave", () => {
                if (editorState.activePointId == connections[i].start_point_id || editorState.activePointId == connections[i].end_point_id) {
                    // temporary ids are negative, saved connections are positive
                    if (connections[i].connection_id < 0) {
                        appState.mapViewer.changeLineType(connections[i].connection_id, "unsaved");
                    } else {
                        appState.mapViewer.changeLineType(connections[i].connection_id, "editing");
                    }
                }
            });
            fragment.appendChild(clone);
        }
        UI.connectionsList.appendChild(fragment);
    }
}

export function closeCollapse() {
    UI.collapseBootstrapElement.hide();
}

export function setEditorState(hasMaps) {
    if (hasMaps) {
        UI.uploadOverlay.classList.add("d-none");
        UI.mapSelector.classList.remove("d-none");
        UI.saveButton.disabled = true;
        UI.newConnectionBtn.disabled = true;
    } else {
        UI.uploadOverlay.classList.remove("d-none");
        UI.mapSelector.classList.add("d-none");
    }
}

export function showCollapseWithDelay() {
    if (uiState.animations.isCollapsing) {
        setTimeout(showCollapseWithDelay, 50);
    } else {
        UI.collapseBootstrapElement.show();
    }
}
