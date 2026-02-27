import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";
import { degreeToRadian } from "../libs/math/mathUtils.js";
import { CONSTANTS, ICONS } from "./constants.js";
import { appState, editorState, resetEditorState, uiState } from "./state.js";
import { fetchImage, fetchPoints, fetchMapList, fetchConnections, saveNewMap, savePoint as savePointApi, saveUnsavedConnections as saveUnsavedConnectionsApi } from "./api.js";
import { createSvgIcon, createSpinnerIcon, processUploadedImageFile, showToast, savePreviousValue, getGameMapIdFromUrl } from "./utils.js";
import { UI, getUIElements, updateMapSelectorUI, updateCoordinatesInput, updateConnectionListUI, closeCollapse, setEditorState, showCollapseWithDelay } from "./ui.js";

// |-------------|
// | API & STATE |
// |-------------|
async function loadImage(url, loadImageFunction, successCheckId, abortSignal = null) {
    const loadingIcon = createSpinnerIcon();
    const kepBetolteseToast = showToast(UI.toastPlace, "Kép betöltése", "", false, { autohide: false }, loadingIcon);

    let imageData = null;

    try {
        imageData = await fetchImage(url, abortSignal);

        // passed success check
        if (successCheckId()) {
            await loadImageFunction(imageData.url, imageData.width, imageData.height);
            showToast(UI.toastPlace, "Kép sikeresen betöltve!", "success", true, { delay: 3000 });
        }
    } catch (error) {
        // if it was aborted do not show error
        if (error.name != "AbortError" && !(error.type && error.type === "REQUEST_CANCELLED")) {
            console.error(error);
            showToast(UI.toastPlace, "Hiba a kép betöltésekor!", "danger", true, { delay: 3000 });
        }
    } finally {
        kepBetolteseToast.hide();
        if (imageData) {
            imageData.cleanup();
        }
    }
}

async function loadPoints(mapID, successCheckId) {
    let loadingIcon = createSpinnerIcon();
    let pontokBetolteseToast = showToast(UI.toastPlace, "Pontok betöltése", "", false, { autohide: false }, loadingIcon);
    try {
        let points = await fetchPoints(mapID);
        // check if the active id is still the same
        if (successCheckId()) {
            appState.pointsCache = {};
            for (let i = 0; i < points.length; i++) {
                appState.pointsCache[points[i].point_id] = points[i];
                appState.mapViewer.placeMarkerByImageCoordinates(points[i].point_id, points[i].point_x, points[i].point_y, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, "ready");
            }
            UI.newConnectionBtn.disabled = points.length < 2;

            updateConnectionListUI();
            showToast(UI.toastPlace, "Pontok sikeresen betöltve!", "success", true, { delay: 3000 });
        }
    } catch (error) {
        console.error(error);
        showToast(UI.toastPlace, "Hiba a pontok betöltésekor!", "danger", true, { delay: 3000 });
    } finally {
        pontokBetolteseToast.hide();
    }
}

async function switchMap(mapId) {
    if (!editorState.isSaving.connections) {
        if (!editorState.isSaving.point) {
            if (!editorState.isSaving.map) {
                closeCollapse();
                cancelConnection();

                if (appState.maps[mapId]) {
                    appState.activeMapId = mapId;
                    let mapData = appState.maps[mapId];

                    UI.mapSelect.value = mapId;

                    let valtasToast = showToast(UI.toastPlace, "Váltás: " + mapData.name, "", false, { autohide: false });

                    UI.newConnectionBtn.disabled = true;
                    if (mapId == CONSTANTS.TEMP_ID) {
                        // temporary maps cannot have points
                        appState.mapViewer.clearMarkersAndLines();
                        await appState.mapViewer.loadMap(appState.maps[mapId].temporaryURL, appState.maps[mapId].imgWidth, appState.maps[mapId].imgHeight);
                        UI.saveButton.disabled = false;
                    } else {
                        UI.saveButton.disabled = true;
                        // TODO #2: rework this await, maybe start loading points and map at the same time and when the image also loaded into the viewer draw points
                        await loadImage(
                            "/api/game_maps/getMapImageById?mapId=" + mapId,
                            (url, width, height) => {
                                appState.mapViewer.clearMarkersAndLines();
                                appState.mapViewer.loadMap(url, width, height)
                            },
                            () => appState.activeMapId == mapId
                        );
                        await loadPoints(
                            mapId,
                            () => appState.activeMapId == mapId
                        );
                        await appState.connectionsLoadPromise;
                        if (appState.activeMapId == mapId) {
                            renderConnectionsForActiveMap();
                        }
                    }

                    // show change toast for 1 sec after the map was loaded
                    setTimeout(() => valtasToast.hide(), 1000);
                }
            } else {
                showToast(UI.toastPlace, "Térkép mentése folyamatban, kérlek várj!", "danger", true, { delay: 2000 });
                UI.mapSelect.value = appState.activeMapId;
            }
        } else {
            showToast(UI.toastPlace, "Pont mentése folyamatban, kérlek várj!", "danger", true, { delay: 2000 });
            UI.mapSelect.value = appState.activeMapId;
        }
    } else {
        showToast(UI.toastPlace, "Kapcsolatok mentése folyamatban, kérlek várj!", "danger", true, { delay: 2000 });
        UI.mapSelect.value = appState.activeMapId;
    }
}

async function saveMap() {
    editorState.isSaving.map = true;
    let loadingIcon = createSpinnerIcon();
    let terkepMentes = showToast(UI.toastPlace, "Térkép mentése", "", false, { autohide: false }, loadingIcon);
    try {
        let currentMap = appState.maps[appState.activeMapId];

        if (!editorState.pendingFiles.map) {
            throw new Error("A térkép kép még nincs kiválasztva!");
        }

        UI.saveButton.disabled = true;

        let oldId = appState.activeMapId;
        let result = await saveNewMap(editorState.pendingFiles.map, appState.gameMapID, currentMap.name);
        let newId = result.mapId;

        currentMap.id = newId;
        appState.maps[newId] = currentMap;

        if (currentMap.temporaryURL) {
            URL.revokeObjectURL(currentMap.temporaryURL);
            delete currentMap.temporaryURL;
        }

        delete appState.maps[oldId];
        updateMapSelectorUI();

        if (appState.activeMapId == oldId) {
            appState.activeMapId = newId;
            UI.mapSelect.value = newId;
        }

        editorState.pendingFiles.map = null;

        UI.saveButton.disabled = true;
        terkepMentes.hide();
        let saveIcon = createSvgIcon(ICONS.SAVE_FLOPPY, "1em");
        showToast(UI.toastPlace, "Térkép sikeresen mentve!", "success", true, { delay: 3000 }, saveIcon);
    } catch (error) {
        terkepMentes.hide();
        showToast(UI.toastPlace, error.message, "danger", true, { delay: 3000 });
        UI.saveButton.disabled = false;
    } finally {
        editorState.isSaving.map = false;
    }
}

async function savePoint() {
    editorState.isSaving.point = true;
    let pointToSaveId = editorState.activePointId;
    let loadingIcon = createSpinnerIcon();
    let pontMentesToast = showToast(UI.toastPlace, "Pont mentése", "", false, { autohide: false }, loadingIcon);
    try {
        let position = appState.mapViewer.getMarkerPosition(pointToSaveId);
        let isNewPoint = pointToSaveId == CONSTANTS.TEMP_ID;

        if (isNewPoint) {
            if (!editorState.pendingFiles.equirectangular) {
                throw new Error("Nincs kép kiválasztva!");
            }
            if (appState.activeMapId == CONSTANTS.TEMP_ID) {
                throw new Error("Először mentsd el a térképet!");
            }
        }

        let data = await savePointApi({
            pointId: pointToSaveId,
            position: position,
            northDirection: UI.northDirection.valueAsNumber,
            equirectangularFile: editorState.pendingFiles.equirectangular,
            gameMapID: appState.gameMapID,
            mapID: appState.activeMapId,
            isNew: isNewPoint
        });

        pontMentesToast.hide();
        if (data.success) {
            let saveIcon = createSvgIcon(ICONS.SAVE_FLOPPY, "1em");
            showToast(UI.toastPlace, "Pont sikeresen mentve!", "success", true, { delay: 3000 }, saveIcon);
            if (isNewPoint) {
                appState.mapViewer.changeMarkerId(editorState.activePointId, data.pointId);
                editorState.activePointId = data.pointId;
                appState.mapViewer.changeMarkerType(editorState.activePointId, "EDIT");
                pointToSaveId = data.pointId;
            }
            if (!appState.pointsCache[pointToSaveId]) {
                appState.pointsCache[pointToSaveId] = {
                    point_id: pointToSaveId
                };
            }
            UI.newConnectionBtn.disabled = Object.keys(appState.pointsCache).length < 2;
            appState.pointsCache[pointToSaveId].point_x = position.x;
            appState.pointsCache[pointToSaveId].point_y = position.y;
            appState.pointsCache[pointToSaveId].north_direction = UI.northDirection.valueAsNumber;
        }
    } catch (error) {
        pontMentesToast.hide();
        console.error(error.message);
        console.error(error);
        showToast(UI.toastPlace, error.message, "danger", true, { delay: 3000 });
    } finally {
        editorState.isSaving.point = false;
    }
}

async function saveUnsavedConnections() {
    editorState.isSaving.connections = true;
    let saved = [];
    let failed = [];
    if (editorState.unsavedConnections.length != 0) {
        let loadingIcon = createSpinnerIcon();
        let kapcsolatMentesToast = showToast(UI.toastPlace, "Kapcsolatok mentése", "", false, { autohide: false }, loadingIcon);

        try {
            let result = await saveUnsavedConnectionsApi(appState.gameMapID, editorState.unsavedConnections);

            saved = result.saved;
            failed = result.failed;

            for (let i = 0; i < saved.length; i++) {
                appState.connectionsList.push(saved[i]);

                // remove the successfully saved connection from unsavedConnections
                let index = 0;
                while (
                    index < editorState.unsavedConnections.length &&
                    !(editorState.unsavedConnections[index].start_point_id == saved[i].start_point_id &&
                        editorState.unsavedConnections[index].end_point_id == saved[i].end_point_id)
                ) {
                    index++;
                }
                if (index < editorState.unsavedConnections.length) {
                    editorState.unsavedConnections.splice(index, 1);
                }
            }

            renderConnectionsForActiveMap();
            await updateConnectionListUI();
        } finally {
            kapcsolatMentesToast.hide();
        }
    }
    editorState.isSaving.connections = false;
    return {
        saved: saved,
        failed: failed
    };
}

async function loadMapList() {
    let maps = [];
    try {
        maps = await fetchMapList(appState.gameMapID);
    } catch (error) {
        console.error(error);
        showToast(UI.toastPlace, "Nem sikerült betölteni a térképeket.", "danger", true);
    }
    return maps;
}

function cancelConnection() {
    if (editorState.isConnectingMarkers) {
        editorState.isConnectingMarkers = false;
        if (uiState.toasts.connection) {
            uiState.toasts.connection.hide();
            uiState.toasts.connection = null;
        }
        UI.newConnectionBtn.disabled = false;
        appState.mapViewer.canvasInput.setDefaultCursor("default");
    }
}

async function loadConnections() {
    let loadingIcon = createSpinnerIcon();
    let kapcsolatokBetolteseToast = showToast(UI.toastPlace, "Kapcsolatok betöltése", "", false, { autohide: false }, loadingIcon);
    try {
        let connections = await fetchConnections(appState.gameMapID);
        appState.connectionsList = connections;
        updateConnectionListUI();
        showToast(UI.toastPlace, "Kapcsolatok sikeresen betöltve!", "success", true, { delay: 3000 });
    } catch (error) {
        console.error(error);
        showToast(UI.toastPlace, "Hiba a kapcsolatok betöltésekor!", "danger", true, { delay: 3000 });
    } finally {
        kapcsolatokBetolteseToast.hide();
    }
}

// |-----------------|
// | FILE PROCESSING |
// |-----------------|

async function handleEquirectangularLoad(file) {
    appState.equirectangularViewer.clearImage();
    UI.savePointButton.disabled = false;
    editorState.pendingFiles.equirectangular = file;

    let imgData;
    try {
        imgData = await processUploadedImageFile(file);

        if (editorState.pendingFiles.equirectangular == file) {
            await appState.equirectangularViewer.loadImage(imgData.url, imgData.width, imgData.height);
            // if collapse was closed activePointIs is null we have to check that
            if (editorState.activePointId) {
                startFOVSync();

                appState.mapViewer.changeMarkerType(editorState.activePointId, "UPLOADING");
            }
        }
    } catch (error) {
        console.error(error);
        editorState.pendingFiles.equirectangular = null;
        showToast(UI.toastPlace, error.message, "danger", false, { delay: 3000 });
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
    editorState.pendingFiles.map = file;
    try {
        imgData = await processUploadedImageFile(file);

        if (appState.maps[CONSTANTS.TEMP_ID] && appState.maps[CONSTANTS.TEMP_ID].temporaryURL) {
            URL.revokeObjectURL(appState.maps[CONSTANTS.TEMP_ID].temporaryURL);
        }

        let newMap = {
            id: CONSTANTS.TEMP_ID,
            name: file.name.split(".")[0],
            temporaryURL: imgData.url,
            imgWidth: imgData.width,
            imgHeight: imgData.height
        };

        appState.maps[CONSTANTS.TEMP_ID] = newMap;

        updateMapSelectorUI();

        switchMap(CONSTANTS.TEMP_ID);

        UI.mapSelector.classList.remove("d-none");
        UI.uploadOverlay.classList.add("d-none");
        UI.saveButton.disabled = false;
    } catch (error) {
        console.error(error);
        editorState.pendingFiles.map = null;
        showToast(UI.toastPlace, error.message, "danger", false, { delay: 3000 });
    }
}

// |-----------------|
// | MAP INTERACTION |
// |-----------------|

function placeOrMoveMarker(cursorX, cursorY) {
    if (editorState.activePointId) {
        if (appState.mapViewer.doesMarkerExist(editorState.activePointId)) {
            appState.mapViewer.moveMarker(editorState.activePointId, cursorX, cursorY);
            if (appState.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
                appState.mapViewer.moveMarker(CONSTANTS.FOV_MARKER_ID, cursorX, cursorY);
            }
        } else {
            UI.savePointButton.disabled = true;
            appState.mapViewer.placeMarker(editorState.activePointId, cursorX, cursorY, CONSTANTS.MARKER_SIZE.width, CONSTANTS.MARKER_SIZE.height, "EMPTY");
            if (uiState.toasts.clickOnMap) {
                uiState.toasts.clickOnMap.hide();
            }
            UI.collapseBootstrapElement.show();
        }
        updateCoordinatesInput();
    }
}

function clickOnCanvas(cursorX, cursorY) {
    if (!uiState.animations.isCollapsing) {
        if (editorState.isConnectingMarkers) {
            let clickedMarkerIndex = appState.mapViewer.getMarkerAtClick(cursorX, cursorY);

            if (clickedMarkerIndex != -1 && clickedMarkerIndex != CONSTANTS.TEMP_ID) {
                if (editorState.activePointId == clickedMarkerIndex) {
                    showToast(UI.toastPlace, "Ugyanarra a pontra kattintottál. Válassz másik pontot!", "danger", true, { delay: 3000 });
                } else {
                    if (appState.mapViewer.isAlreadyConnected(editorState.activePointId, clickedMarkerIndex)) {
                        showToast(UI.toastPlace, "Ezek a jelölők már össze vannak kapcsolva!", "danger", true, { delay: 3000 });
                    } else {
                        appState.mapViewer.connectMarkers(editorState.activePointId, clickedMarkerIndex, editorState.temporaryConnectionID, "unsaved");
                        editorState.unsavedConnections.push({
                            connection_id: editorState.temporaryConnectionID,
                            start_point_id: editorState.activePointId,
                            end_point_id: clickedMarkerIndex,
                            game_maps_id: appState.activeMapId
                        });
                        editorState.temporaryConnectionID--;
                        UI.newConnectionBtn.disabled = false;
                        updateConnectionListUI();

                        showToast(UI.toastPlace, "Új kapcsolat létrehozva!", "success", true, { delay: 3000 });

                        cancelConnection();
                    }
                }
            } else {
                showToast(UI.toastPlace, "Kattints egy térképjelölőre!", "", true, { delay: 2000 });
            }
        } else {
            if (editorState.isSaving.point) {
                showToast(UI.toastPlace, "Pont mentése folyamatban...", "", true, { delay: 2000 });
            } else {
                if (editorState.isPlacingMarker) {
                    placeOrMoveMarker(cursorX, cursorY);
                } else {
                    let clickedMarkerIndex = appState.mapViewer.getMarkerAtClick(cursorX, cursorY);
                    if (clickedMarkerIndex != -1) {
                        editorState.activePointId = clickedMarkerIndex;
                        appState.mapViewer.changeMarkerType(editorState.activePointId, "EDIT");

                        if (editorState.equiAbortController) {
                            editorState.equiAbortController.abort();
                        }
                        editorState.equiAbortController = new AbortController();
                        let signal = editorState.equiAbortController.signal;
                        loadImage(
                            "/api/game_maps/getImageByPointId?pointId=" + editorState.activePointId,
                            async (url, width, height) => {
                                try {
                                    appState.equirectangularViewer.setYaw(degreeToRadian(appState.pointsCache[editorState.activePointId].north_direction));
                                    await appState.equirectangularViewer.loadImage(url, width, height);
                                    if (editorState.activePointId == clickedMarkerIndex) {
                                        startFOVSync();
                                    }
                                } catch (error) {
                                    if (error.name != "AbortError" && !(error.type && error.type == "REQUEST_CANCELLED")) {
                                        throw error;
                                    }
                                }
                            },
                            () => editorState.activePointId == clickedMarkerIndex, // check if the active id is still the same
                            signal
                        );

                        updateConnectionListUI();
                        renderConnectionsForActiveMap();
                        updateCoordinatesInput();
                        UI.northDirectionRange.value = appState.pointsCache[editorState.activePointId].north_direction;
                        UI.northDirection.value = appState.pointsCache[editorState.activePointId].north_direction;
                        editorState.isPlacingMarker = true;
                        UI.savePointButton.disabled = false;
                        let position = appState.mapViewer.getMarkerPosition(editorState.activePointId);
                        let zoomLevel;
                        if (appState.mapViewer.getZoomLevel() < 4) {
                            zoomLevel = 4;
                        }
                        appState.mapViewer.moveTo(position.x, position.y, 4);
                        showCollapseWithDelay();
                    }
                }
            }
        }
    }
}

function handleCoordinateChange(event) {
    let xCoordinate = UI.coordinateXInput.valueAsNumber;
    let yCoordinate = UI.coordinateYInput.valueAsNumber;
    let isValid = appState.mapViewer.checkCoordinateValid(xCoordinate, yCoordinate);
    if (isValid.correct) {
        event.target.dataset.previousValue = event.target.valueAsNumber;
        appState.mapViewer.moveMarkerToImageCoordinates(editorState.activePointId, xCoordinate, yCoordinate);
        if (appState.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
            appState.mapViewer.moveMarkerToImageCoordinates(CONSTANTS.FOV_MARKER_ID, xCoordinate, yCoordinate);
        }
    } else {
        event.target.value = event.target.dataset.previousValue;
        showToast(UI.toastPlace, isValid.error, "danger", false, { delay: 3000 });
    }
}

// |----|
// | UI |
// |----|

function renderConnectionsForActiveMap() {
    appState.mapViewer.clearLines();
    let connectionsForActiveMap = appState.connectionsList.filter(connection => appState.pointsCache[connection.start_point_id] && appState.pointsCache[connection.end_point_id]);
    for (let i = 0; i < connectionsForActiveMap.length; i++) {
        let type = "default";
        if (editorState.activePointId == connectionsForActiveMap[i].start_point_id || editorState.activePointId == connectionsForActiveMap[i].end_point_id) {
            type = "editing";
        }
        appState.mapViewer.connectMarkers(connectionsForActiveMap[i].start_point_id, connectionsForActiveMap[i].end_point_id, connectionsForActiveMap[i].connection_id, type);
    }
    for (let i = 0; i < editorState.unsavedConnections.length; i++) {
        appState.mapViewer.connectMarkers(editorState.unsavedConnections[i].start_point_id, editorState.unsavedConnections[i].end_point_id, editorState.unsavedConnections[i].connection_id, "unsaved");
    }
}

async function savePointClick() {
    let position = appState.mapViewer.getMarkerPosition(editorState.activePointId);
    let northDirection = UI.northDirection.valueAsNumber;
    let hasUnsavedConnections = editorState.unsavedConnections.length > 0;
    let didPointChange = !appState.pointsCache[editorState.activePointId] ||
        position.x != appState.pointsCache[editorState.activePointId].point_x ||
        position.y != appState.pointsCache[editorState.activePointId].point_y ||
        northDirection != appState.pointsCache[editorState.activePointId].north_direction ||
        editorState.pendingFiles.equirectangular;

    UI.savePointButton.disabled = true;
    if (didPointChange) {
        await savePoint();
    }
    // connections can only be made on saved points
    if (hasUnsavedConnections && editorState.activePointId != CONSTANTS.TEMP_ID) {
        let result = await saveUnsavedConnections();
        let saved = result.saved;
        let failed = result.failed;

        if (saved.length > 0 && failed.length == 0) {
            let saveIcon = createSvgIcon(ICONS.SAVE_FLOPPY, "1em");
            showToast(UI.toastPlace, saved.length + " kapcsolat sikeresen mentve!", "success", true, { delay: 3000 }, saveIcon);
        } else {
            if (saved.length > 0 && failed.length > 0) {
                showToast(UI.toastPlace, saved.length + " kapcsolat sikeresen mentve, " + failed.length + " kapcsolat mentésekor hiba történt!", "warning", true, { delay: 4000 });
            } else {
                if (failed.length > 0) {
                    showToast(UI.toastPlace, failed.length + " kapcsolat mentése sikertelen!", "danger", true, { delay: 4000 });
                }
            }
        }
    }
    if (!didPointChange && !hasUnsavedConnections) {
        showToast(UI.toastPlace, "A pont nem változott!", "", true, { delay: 2000 });
    }
    UI.savePointButton.disabled = false;
}

function fullscreenEquirectangular() {
    appState.equirectangularViewer.toggleFullscreen();
}

function updateCollapseDirection() {
    if (window.innerWidth < 992) {
        UI.collapseElement.classList.remove("collapse-horizontal");
    } else {
        UI.collapseElement.classList.add("collapse-horizontal");
    }
}

// |--------------------------|
// |  SETUP & INITIALIZATION  |
// |--------------------------|

function setupCoordinateInput() {
    UI.coordinateXInput.addEventListener("focus", savePreviousValue);
    UI.coordinateYInput.addEventListener("focus", savePreviousValue);
    UI.coordinateXInput.addEventListener("change", handleCoordinateChange);
    UI.coordinateYInput.addEventListener("change", handleCoordinateChange);
}

function setupEquirectangularViewer() {
    appState.equirectangularViewer = new EquirectangularViewer(CONSTANTS.EQUIRECTANGULAR_CANVAS_ID);
}

function setupMapViewer() {
    appState.mapViewer = new MapViewer(CONSTANTS.MAP_CANVAS_ID);
    appState.mapViewer.onClickHandler = clickOnCanvas;
}

function setupFileUploadInput(buttonElement, inputElement, onFileLoaded) {
    buttonElement.addEventListener("click", () => inputElement.click());

    inputElement.addEventListener("change", (event) => {
        if (event.target.files.length > 0) {
            onFileLoaded(event.target.files[0]);
        }
        event.target.value = "";
    });
}

function setupUploadHandler(dropZoneElement, buttonElement, inputElement, onFileLoaded) {
    setupFileUploadInput(buttonElement, inputElement, onFileLoaded);

    dropZoneElement.addEventListener("dragover", (event) => {
        event.preventDefault();
        let draggedFiles = [];
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
            if (event.dataTransfer.items[i].kind == "file") {
                draggedFiles.push(event.dataTransfer.items[i]);
            }
        }

        if (draggedFiles.length > 0) {
            event.dataTransfer.dropEffect = "copy";
            dropZoneElement.classList.add("dropfocus");
        } else {
            event.dataTransfer.dropEffect = "none";
        }
    });

    dropZoneElement.addEventListener("dragleave", (event) => {
        event.preventDefault();
        dropZoneElement.classList.remove("dropfocus");
    });

    dropZoneElement.addEventListener("drop", (event) => {
        event.preventDefault();
        dropZoneElement.classList.remove("dropfocus");

        let files = event.dataTransfer.files;
        if (files.length > 0) {
            onFileLoaded(files[0]);
        }
    });
}

function addUIEventListeners() {
    UI.mapSelect.addEventListener("change", (event) => {
        switchMap(parseInt(event.target.value));
    });

    UI.addNewMapBtn.addEventListener("click", () => {
        if (!editorState.isSaving.connections) {
            if (!editorState.isSaving.point) {
                if (!editorState.isSaving.map) {
                    UI.fileInputMap.value = "";
                    UI.fileInputMap.click();
                } else {
                    showToast(UI.toastPlace, "Térkép mentése folyamatban, kérlek várj!", "danger", true, { delay: 3000 });
                }
            } else {
                showToast(UI.toastPlace, "Pontok mentése folyamatban, kérlek várj!", "danger", true, { delay: 3000 });
            }
        } else {
            showToast(UI.toastPlace, "Kapcsolatok mentése folyamatban, kérlek várj!", "danger", true, { delay: 3000 });
        }
    });

    UI.collapseElement.addEventListener("show.bs.collapse", (event) => {
        if (event.target == UI.collapseElement) {
            uiState.animations.isCollapsing = true;
            UI.floatingButtonDiv.classList.add("d-none");
            if (editorState.activePointId == CONSTANTS.TEMP_ID) {
                UI.northDirectionRange.value = 0;
                UI.northDirection.value = 0;
            }
        }
    });

    UI.collapseElement.addEventListener("shown.bs.collapse", (event) => {
        if (event.target == UI.collapseElement) {
            uiState.animations.isCollapsing = false;
        }
    });

    UI.collapseElement.addEventListener("hide.bs.collapse", (event) => {
        if (event.target == UI.collapseElement) {
            if (editorState.isSaving.point) {
                event.preventDefault();
                showToast(UI.toastPlace, "Pont mentése folyamatban, kérlek várj!", "danger", true, { delay: 2000 });
            } else {
                if (editorState.isSaving.connections) {
                    event.preventDefault();
                    showToast(UI.toastPlace, "Kapcsolatok mentése folyamatban, kérlek várj!", "danger", true, { delay: 2000 });
                } else {
                    uiState.animations.isCollapsing = true;
                    stopFOVSync();

                    if (editorState.equiAbortController) {
                        editorState.equiAbortController.abort();
                        editorState.equiAbortController = null;
                    }

                    if (editorState.activePointId != null) {
                        if (editorState.activePointId == CONSTANTS.TEMP_ID) {
                            // it was temporary marker remove it
                            appState.mapViewer.removeMarker(CONSTANTS.TEMP_ID);
                        } else {
                            if (appState.pointsCache[editorState.activePointId]) {
                                // it was discarded revert to old data
                                let originalPoint = appState.pointsCache[editorState.activePointId];
                                appState.mapViewer.moveMarkerToImageCoordinates(
                                    editorState.activePointId,
                                    originalPoint.point_x,
                                    originalPoint.point_y
                                );
                                appState.mapViewer.changeMarkerType(editorState.activePointId, "READY");
                            }
                        }
                    }

                    // remove temporary connections
                    for (let i = 0; i < editorState.unsavedConnections.length; i++) {
                        if (appState.mapViewer.doesLineExist(editorState.unsavedConnections[i].connection_id)) {
                            appState.mapViewer.removeLine(editorState.unsavedConnections[i].connection_id);
                        }
                    }

                    appState.mapViewer.cancelPanAnimation();
                    cancelConnection();
                    appState.mapViewer.canvasInput.setDefaultCursor("default");
                    resetEditorState();
                    renderConnectionsForActiveMap();
                }
            }
        }
    });

    UI.collapseElement.addEventListener("hidden.bs.collapse", (event) => {
        if (event.target == UI.collapseElement) {
            uiState.animations.isCollapsing = false;
            if (appState.equirectangularViewer) {
                appState.equirectangularViewer.setYaw(0);
                appState.equirectangularViewer.setZoom(0.05);
                appState.equirectangularViewer.clearImage();
            }

            // reset UI
            UI.floatingButtonDiv.classList.remove("d-none");
        }
    });

    UI.plusMarkerBtn.addEventListener("click", () => {
        if (appState.activeMapId != CONSTANTS.TEMP_ID) {
            UI.floatingButtonDiv.classList.add("d-none");
            appState.mapViewer.canvasInput.setDefaultCursor("crosshair");

            editorState.activePointId = CONSTANTS.TEMP_ID;

            let pointingHandIcon = createSvgIcon(ICONS.POINTING_HAND, "2em");
            uiState.toasts.clickOnMap = showToast(UI.toastPlace,
                "Kattints a térképre a jelölő elhelyezéséhez!",
                "",
                true,
                { autohide: false },
                pointingHandIcon,
                () => {
                    // if temporary marker was not placed then it was cancelled => reset state
                    if (!appState.mapViewer.doesMarkerExist(CONSTANTS.TEMP_ID)) {
                        editorState.activePointId = null;
                        editorState.isPlacingMarker = false;
                        appState.mapViewer.canvasInput.setDefaultCursor("default");
                        UI.floatingButtonDiv.classList.remove("d-none");
                    }
                }
            );
            editorState.isPlacingMarker = true;
        } else {
            showToast(UI.toastPlace, "Először mentsd el a térképet!", "danger", true, { delay: 3000 });
        }
    });

    UI.northDirectionRange.addEventListener("input", (e) => {
        UI.northDirection.value = e.target.value;
        updateFOVSync();
    });

    UI.northDirection.addEventListener("focus", savePreviousValue);
    UI.northDirection.addEventListener("change", (event) => {
        let degree = event.target.valueAsNumber;
        if (0 <= degree && degree <= 359) {
            event.target.dataset.previousValue = event.target.valueAsNumber;
            UI.northDirectionRange.value = degree;
            updateFOVSync();
        } else {
            event.target.value = event.target.dataset.previousValue;
            showToast(UI.toastPlace, "A szögnek 0 és 359 között kell lennie!", "danger", false, { delay: 3000 });
        }
    });

    UI.equiFullscreenBtn.addEventListener("click", fullscreenEquirectangular);
    UI.saveButton.addEventListener("click", saveMap);
    UI.savePointButton.addEventListener("click", savePointClick);
    UI.closeCollapse.addEventListener("click", closeCollapse);
    window.addEventListener("resize", updateCollapseDirection);

    UI.newConnectionBtn.addEventListener("click", () => {
        if (editorState.activePointId != CONSTANTS.TEMP_ID) {
            if (!editorState.isConnectingMarkers) {
                editorState.isConnectingMarkers = true;
                appState.mapViewer.canvasInput.setDefaultCursor("crosshair");
                uiState.toasts.connection = showToast(UI.toastPlace,
                    "Kattints a végpontra!",
                    "",
                    true,
                    { autohide: false },
                    "",
                    () => {
                        cancelConnection();
                    });
            }
            UI.newConnectionBtn.disabled = true;
        } else {
            showToast(UI.toastPlace, "Először mentsd el a pontot!", "danger", true, { delay: 3000 });
        }
    });

    window.addEventListener("keyup", (event) => {
        if (event.key == "Escape") {
            if (UI.collapseBootstrapElement) {
                UI.collapseBootstrapElement.hide();
            }
        }
    });
}

function setupUIElements() {
    getUIElements();
    updateCollapseDirection();
    addUIEventListeners();
}

function processMapList(mapList) {
    appState.maps = {};

    for (let i = 0; i < mapList.length; i++) {
        const element = mapList[i];
        appState.maps[element.map_id] = {
            id: element.map_id,
            name: element.title,
        };
    }

    updateMapSelectorUI();
}

function startFOVSync() {
    stopFOVSync();

    let pos = appState.mapViewer.getMarkerPosition(editorState.activePointId);

    appState.mapViewer.placeMarkerByImageCoordinates(CONSTANTS.FOV_MARKER_ID, pos.x, pos.y, CONSTANTS.CONE_SIZE.width, CONSTANTS.CONE_SIZE.height, "fov_cone");
    appState.mapViewer.setMarkerSelectable(CONSTANTS.FOV_MARKER_ID, false);

    uiState.animations.fovSyncID = requestAnimationFrame(updateFOVSyncLoop);
}

function updateFOVSync() {
    if (editorState.activePointId && appState.equirectangularViewer) {
        let viewYaw = -appState.equirectangularViewer.getYaw();

        let northDirection = 0.0;
        if (UI.northDirection && UI.northDirection.valueAsNumber) {
            northDirection = UI.northDirection.valueAsNumber;
        }
        let northDirectionRadian = degreeToRadian(northDirection);

        let finalYaw = viewYaw + northDirectionRadian;

        appState.mapViewer.rotateMarker(CONSTANTS.FOV_MARKER_ID, finalYaw);
    };
}

function updateFOVSyncLoop() {
    updateFOVSync();
    uiState.animations.fovSyncID = requestAnimationFrame(updateFOVSyncLoop);
}

function stopFOVSync() {
    if (uiState.animations.fovSyncID) {
        cancelAnimationFrame(uiState.animations.fovSyncID);
    }
    if (appState.mapViewer.doesMarkerExist(CONSTANTS.FOV_MARKER_ID)) {
        appState.mapViewer.removeMarker(CONSTANTS.FOV_MARKER_ID);
    }
}

async function init() {
    appState.gameMapID = getGameMapIdFromUrl();
    setupUIElements();

    // setup
    setupMapViewer();
    setupEquirectangularViewer();
    setupCoordinateInput();

    setupUploadHandler(UI.dropZoneMap, UI.uploadButtonMap, UI.fileInputMap, handleMapLoad);
    setupUploadHandler(UI.dropZoneEquirectangular, UI.uploadButtonEquirectangular, UI.fileInputEquirectangular, handleEquirectangularLoad);

    appState.connectionsLoadPromise = loadConnections();

    let mapList = await loadMapList();
    let hasMaps = mapList.length > 0;
    setEditorState(hasMaps);
    if (hasMaps) {
        await appState.mapViewer.ready();
        processMapList(mapList);

        let firstMapId = mapList[0].map_id;
        switchMap(firstMapId);
    }
    UI.loadingOverlay.classList.add("d-none");
}

document.addEventListener("DOMContentLoaded", init);

// TODO: látótér állandó méretű (állítható méretű?)
// TODO: új markernél elsőre nincs helyesen rajta a markeren a fov cone
// TODO: biztos hogy elakarod vetni a változtatásokat ha a user bezárja a collapset vagy elakarod menteni a változtatásokat egy modalban?
// TODO: fájl további szétbontása pointManager, mapManager, connectionManager
// TODO: mapok közti kapcsolatok