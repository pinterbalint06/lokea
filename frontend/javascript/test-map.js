import { MapViewer } from "./libs/viewer/MapViewer.js";
import { showToast } from "./libs/utils.js";
import { createElement } from "./libs/utils/DOMutils.js";

// |------------------|
// | GLOBAL VARIABLES |
// |------------------|

const canvasId = "canvas";

/**
 * @type {MapViewer}
 * map viewer engine for rendering and managing markers
 */
let mapViewer;

/**
 * @type {number | null}
 * currently selected marker ID, or null if no marker is selected
 */
let activeMarkerId = null;

/**
 * @type {number | null}
 * currently selected connection ID, or null if no connection selected
 */
let activeConnectionId = null;

/**
 * @type {boolean}
 * whether marker move mode is active (next map click will move selected marker)
 */
let isMarkerMoveMode = false;

/**
 * @type {Map<number, {id: number, x: number, y: number, type: string}>}
 * registry of all placed markers with their properties
 */
const markerRegistry = new Map();

/**
 * @type {Map<number, {id: number, marker1: number, marker2: number, type: string}>}
 * registry of all connections between markers
 */
const connectionRegistry = new Map();

/**
 * @type {number}
 * last recorded cursor X position
 */
let lastCursorX = -1;

/**
 * @type {number}
 * last recorded cursor Y position
 */
let lastCursorY = -1;

// |------------------------------|
// | INITIALIZATION               |
// |------------------------------|
function showNotification(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");
    const isContainerValid = toastContainer != null;
    if (isContainerValid) {
        showToast(toastContainer, message, type, true);
    } else {
        console.error(`Toast container not found. Message: ${message}`);
    }
}

async function init() {
    mapViewer = new MapViewer(canvasId);

    await mapViewer.ready();

    mapViewer.onClickHandler = (cursorX, cursorY) => {
        lastCursorX = cursorX;
        lastCursorY = cursorY;

        const isMarkerSelected = activeMarkerId != null;
        const moveMode = isMarkerMoveMode && isMarkerSelected;

        if (moveMode) {
            try {
                const markerData = markerRegistry.get(activeMarkerId);
                const hasData = markerData != undefined;
                if (hasData && mapViewer.doesMarkerExist(activeMarkerId)) {
                    mapViewer.moveMarker(activeMarkerId, cursorX, cursorY);
                    markerData.x = cursorX;
                    markerData.y = cursorY;
                    updateMarkerList();
                    showNotification("Térképjelölő mozgatva.", "success");
                    isMarkerMoveMode = false;
                    document.getElementById("buttonMoveMarkerToClick").innerText = "Mozgatás kattintásra";
                }
            } catch (e) {
                showNotification(`Hiba: ${e.message}`, "danger");
                isMarkerMoveMode = false;
                document.getElementById("buttonMoveMarkerToClick").innerText = "Mozgatás kattintásra";
            }
        } else {
            const markerId = mapViewer.getMarkerAtClick(cursorX, cursorY);
            const markerExists = markerId != -1;
            if (markerExists) {
                selectMarker(markerId);
            }
        }
    };

    await mapViewer.loadMap("/images/worldmap.webp", 3840, 1920);

    initializeEventListeners();
    try {
        refreshConnectionButtons();
    } catch (e) {
    }
    try {
        refreshMarkerButtons();
    } catch (e) {
    }

    updateStateLoop();
}

// |------------------------------|
// | MARKER MANAGEMENT            |
// |------------------------------|
function getSelectedMarkerId() {
    const markerId = parseInt(document.getElementById("inputMarkerId").value);
    const isValid = !Number.isNaN(markerId) && markerId >= 1;

    let result = null;
    if (isValid) {
        result = markerId;
    } else {
        showNotification("Érvénytelen térképjelölő ID!", "warning");
    }

    return result;
}

function placeMarker() {
    const markerId = getSelectedMarkerId();
    const isValidId = markerId != null;

    if (isValidId) {
        try {
            mapViewer.placeMarker(markerId, 850, 500, 24, 32, "empty");
            markerRegistry.set(markerId, {
                id: markerId,
                x: 850,
                y: 500,
                type: "empty",
                fixedToMap: false
            });
            updateMarkerList();
            selectMarker(markerId);
            try {
                refreshMarkerButtons();
            } catch (e) {
            }
        } catch (error) {
            showNotification(`Hiba az elhelyezés során: ${error.message}`, "danger");
        }
    }
}

function removeMarker() {
    const markerId = getSelectedMarkerId();
    const isValidId = markerId != null;

    if (isValidId) {
        const markerExists = mapViewer.doesMarkerExist(markerId);

        if (markerExists) {
            try {
                mapViewer.removeMarker(markerId);
                markerRegistry.delete(markerId);
                const isActiveMarker = activeMarkerId == markerId;
                if (isActiveMarker) {
                    activeMarkerId = null;
                }
                updateMarkerList();
                try {
                    refreshMarkerButtons();
                } catch (e) {
                }
            } catch (error) {
                showNotification(`Hiba az eltávolítás során: ${error.message}`, "danger");
            }
        } else {
            showNotification("A térképjelölő nem létezik!", "warning");
        }
    }
}

function changeMarkerType() {
    const markerId = getSelectedMarkerId();
    const isValidId = markerId != null;

    if (isValidId) {
        const markerExists = mapViewer.doesMarkerExist(markerId);

        if (markerExists) {
            const markerType = document.getElementById("markerTypeSelect").value;
            try {
                mapViewer.changeMarkerType(markerId, markerType);
                const markerData = markerRegistry.get(markerId);
                const hasMarkerData = markerData != undefined;
                if (hasMarkerData) {
                    markerData.type = markerType;
                }
                updateMarkerList();
                try {
                    refreshMarkerButtons();
                } catch (e) {
                }
            } catch (error) {
                showNotification(`Hiba a típus módosítása során: ${error.message}`, "danger");
            }
        } else {
            showNotification("A térképjelölő nem létezik!", "warning");
        }
    }
}

function setMarkerX() {
    const markerId = getSelectedMarkerId();
    const isValidId = markerId != null;

    if (isValidId) {
        const markerExists = mapViewer.doesMarkerExist(markerId);

        if (markerExists) {
            const x = parseInt(document.getElementById("inputMarkerX").value);
            const isValidCoordinate = !Number.isNaN(x);

            if (isValidCoordinate) {
                try {
                    const markerData = markerRegistry.get(markerId);
                    const hasMarkerData = markerData != undefined;
                    if (hasMarkerData) {
                        mapViewer.moveMarker(markerId, x, markerData.y);
                        markerData.x = x;
                        updateMarkerList();
                    }
                } catch (error) {
                    showToast(document.body, `Hiba az X pozíció beállítása során: ${error.message}`, "danger", true);
                }
            } else {
                showToast(document.body, "Érvénytelen X koordináta!", "warning", true);
            }
        } else {
            showToast(document.body, "A térképjelölő nem létezik!", "warning", true);
        }
    }
}

function setMarkerY() {
    const markerId = getSelectedMarkerId();
    const isValidId = markerId != null;

    if (isValidId) {
        const markerExists = mapViewer.doesMarkerExist(markerId);

        if (markerExists) {
            const y = parseInt(document.getElementById("inputMarkerY").value);
            const isValidCoordinate = !Number.isNaN(y);

            if (isValidCoordinate) {
                try {
                    const markerData = markerRegistry.get(markerId);
                    const hasMarkerData = markerData != undefined;
                    if (hasMarkerData) {
                        mapViewer.moveMarker(markerId, markerData.x, y);
                        markerData.y = y;
                        updateMarkerList();
                    }
                } catch (error) {
                    showToast(document.body, `Hiba az Y pozíció beállítása során: ${error.message}`, "danger", true);
                }
            } else {
                showToast(document.body, "Érvénytelen Y koordináta!", "warning", true);
            }
        } else {
            showToast(document.body, "A térképjelölő nem létezik!", "warning", true);
        }
    }
}

function setMarkerRotation() {
    const markerId = getSelectedMarkerId();
    const isValidId = markerId != null;

    if (isValidId) {
        const markerExists = mapViewer.doesMarkerExist(markerId);

        if (markerExists) {
            const rotation = parseFloat(document.getElementById("inputMarkerRotation").value);
            const isValidRotation = !Number.isNaN(rotation);

            if (isValidRotation) {
                try {
                    mapViewer.rotateMarker(markerId, rotation);
                } catch (error) {
                    showNotification(`Hiba a forgatás során: ${error.message}`, "danger");
                }
            } else {
                showNotification("Érvénytelen forgatási szög!", "warning");
            }
        } else {
            showNotification("A térképjelölő nem létezik!", "warning");
        }
    }
}

function resizeMarker() {
    const markerId = getSelectedMarkerId();
    const isValidId = markerId != null;

    if (isValidId) {
        const markerExists = mapViewer.doesMarkerExist(markerId);

        if (markerExists) {
            const width = parseFloat(document.getElementById("inputMarkerWidth").value);
            const height = parseFloat(document.getElementById("inputMarkerHeight").value);
            const isValidDimensions = !Number.isNaN(width) && !Number.isNaN(height) && width >= 1 && height >= 1;

            if (isValidDimensions) {
                try {
                    mapViewer.resizeMarker(markerId, width, height);
                } catch (error) {
                    showNotification(`Hiba az átméretezés során: ${error.message}`, "danger");
                }
            } else {
                showNotification("Érvénytelen szélesség vagy magasság!", "warning");
            }
        } else {
            showNotification("A térképjelölő nem létezik!", "warning");
        }
    }
}

function setMarkerFixedToMap() {
    const markerId = getSelectedMarkerId();
    let proceed = true;
    let notifyMsg = null;
    let notifyType = "warning";

    if (markerId == null) {
        proceed = false;
        notifyMsg = "Érvénytelen térképjelölő ID!";
    }

    if (proceed) {
        if (!mapViewer.doesMarkerExist(markerId)) {
            proceed = false;
            notifyMsg = "A térképjelölő nem létezik!";
        }
    }

    if (proceed) {
        const value = !!document.getElementById("inputMarkerFixedToMap").checked;
        try {
            mapViewer.setMarkerFixedToMap(markerId, value);
            const markerData = markerRegistry.get(markerId);
            if (markerData) {
                markerData.fixedToMap = value;
            }
            updateMarkerList();
            notifyMsg = "Beállítás elvégezve.";
            notifyType = "success";
            try {
                refreshMarkerButtons();
            } catch (e) {
            }
        } catch (error) {
            proceed = false;
            notifyMsg = `Hiba a beállítás során: ${error.message}`;
            notifyType = "danger";
        }
    }

    if (notifyMsg) {
        showNotification(notifyMsg, notifyType);
    }
}

function toggleMarkerMoveMode() {
    let proceed = true;
    let notifyMsg = null;

    const markerId = getSelectedMarkerId();
    if (markerId == null) {
        proceed = false;
        notifyMsg = "Kérjük válasszon ki egy térképjelölőt az ID mezőben!";
    }

    if (proceed) {
        if (!mapViewer.doesMarkerExist(markerId)) {
            proceed = false;
            notifyMsg = "A térképjelölő nem létezik!";
        }
    }

    if (proceed) {
        isMarkerMoveMode = !isMarkerMoveMode;
        const btn = document.getElementById("buttonMoveMarkerToClick");
        if (isMarkerMoveMode) {
            btn.innerText = "Kattintés szokványos szerkesztésre";
            notifyMsg = "Mozgatás mód: kattintson a térképre a térképjelölő mozgatásához.";
        } else {
            btn.innerText = "Mozgatás kattintásra";
            notifyMsg = "Szokványos mód.";
        }
    }

    if (notifyMsg) {
        showNotification(notifyMsg, isMarkerMoveMode ? "info" : "success");
    }
}

function selectMarker(markerId) {
    activeMarkerId = markerId;
    document.getElementById("inputMarkerId").value = markerId;

    const hasMarkerData = markerRegistry.has(markerId);
    if (hasMarkerData) {
        const markerData = markerRegistry.get(markerId);
        document.getElementById("inputMarkerX").value = markerData.x;
        document.getElementById("inputMarkerY").value = markerData.y;
        document.getElementById("markerTypeSelect").value = markerData.type;
        document.getElementById("inputMarkerFixedToMap").checked = !!markerData.fixedToMap;
    }

    updateMarkerList();
}

function updateMarkerList() {
    const container = document.getElementById("markerListContent");
    container.innerHTML = "";

    if (markerRegistry.size == 0) {
        const empty = createElement("p", { class: "empty-list" }, [document.createTextNode("Nincs térképjelölő")]);
        container.appendChild(empty);
    } else {
        markerRegistry.forEach((markerData, markerId) => {
            const isActive = markerId == activeMarkerId;

            const item = createElement("div", { class: "marker-item" }, []);

            const header = createElement("div", { class: "marker-item-header" }, []);
            const strong = createElement("strong", {}, [document.createTextNode(`ID: ${markerId}`)]);
            const badge = createElement("span", { class: "marker-type-badge" }, [document.createTextNode(markerData.type)]);
            header.appendChild(strong);
            header.appendChild(badge);
            if (markerData.fixedToMap) {
                const fixedBadge = createElement("span", { class: "marker-fixed-badge" }, [document.createTextNode("Rögzítve")]);
                header.appendChild(fixedBadge);
            }

            const details = createElement("div", { class: "marker-item-details" }, []);
            const small = createElement("small", {}, [document.createTextNode(`Pozíció: (${markerData.x}, ${markerData.y})`)]);
            details.appendChild(small);

            const actions = createElement("div", { class: "marker-item-actions" }, []);
            const btn = createElement("button", { class: "marker-action-btn" }, [document.createTextNode("Kijelölés")]);
            btn.addEventListener("click", () => {
                selectMarkerFromList(markerId);
            });
            actions.appendChild(btn);

            if (isActive) {
                item.classList.add("active");
            }

            item.appendChild(header);
            item.appendChild(details);
            item.appendChild(actions);

            container.appendChild(item);
        });
    }
}

window.selectMarkerFromList = selectMarker;

// |------------------------------|
// | CONNECTION MANAGEMENT        |
// |------------------------------|
function createConnection() {
    const marker1 = parseInt(document.getElementById("connectionMarkerId1").value);
    const marker2 = parseInt(document.getElementById("connectionMarkerId2").value);
    const lineId = parseInt(document.getElementById("inputConnectionId").value);
    const lineType = document.getElementById("connectionTypeSelect").value;

    const isValidIds = !Number.isNaN(marker1) && !Number.isNaN(marker2) && !Number.isNaN(lineId);
    let isConnectionCreated = false;

    if (isValidIds) {
        const areDifferent = marker1 != marker2;

        if (areDifferent) {
            const bothExist = mapViewer.doesMarkerExist(marker1) && mapViewer.doesMarkerExist(marker2);

            if (bothExist) {
                const lineDoesNotExist = !mapViewer.doesLineExist(lineId);

                if (lineDoesNotExist) {
                    try {
                        mapViewer.connectMarkers(marker1, marker2, lineId, lineType);
                        connectionRegistry.set(lineId, {
                            id: lineId,
                            marker1: marker1,
                            marker2: marker2,
                            type: lineType
                        });
                        updateConnectionList();
                        isConnectionCreated = true;
                    } catch (error) {
                        showNotification(`Hiba a kapcsolat létrehozása során: ${error.message}`, "danger");
                    }
                } else {
                    try {
                        const existing = connectionRegistry.get(lineId);
                        const endpointsChanged = existing && (existing.marker1 != marker1 || existing.marker2 != marker2);

                        if (endpointsChanged) {
                            mapViewer.removeLine(lineId);
                            if (mapViewer.isAlreadyConnected(marker1, marker2)) {
                                showNotification("Már létezik kapcsolat ezen a marker páron!", "warning");
                            } else {
                                mapViewer.connectMarkers(marker1, marker2, lineId, lineType);
                                connectionRegistry.set(lineId, {
                                    id: lineId,
                                    marker1: marker1,
                                    marker2: marker2,
                                    type: lineType
                                });
                                updateConnectionList();
                                isConnectionCreated = true;
                            }
                        } else {
                            mapViewer.changeLineType(lineId, lineType);
                            const conn = connectionRegistry.get(lineId);
                            if (conn) {
                                conn.type = lineType;
                            }
                            updateConnectionList();
                            isConnectionCreated = true;
                        }
                    } catch (error) {
                        showNotification(`Hiba a kapcsolat frissítése során: ${error.message}`, "danger");
                    }
                }
            } else {
                showNotification("Az egyik vagy mindkét térképjelölő nem létezik!", "warning");
            }
        } else {
            showNotification("A két térképjelölő nem lehet azonos!", "warning");
        }
    } else {
        showNotification("Érvénytelen ID!", "warning");
    }
    try {
        refreshConnectionButtons();
    } catch (e) {
    }
}

function removeConnection() {
    const lineId = parseInt(document.getElementById("inputConnectionId").value);
    const isValidId = !Number.isNaN(lineId);

    if (isValidId) {
        const lineExists = mapViewer.doesLineExist(lineId);

        if (lineExists) {
            try {
                mapViewer.removeLine(lineId);
                connectionRegistry.delete(lineId);
                updateConnectionList();
            } catch (error) {
                showNotification(`Hiba az eltávolítás során: ${error.message}`, "danger");
            }
        } else {
            showNotification("A kapcsolat nem létezik!", "warning");
        }
    } else {
        showNotification("Érvénytelen kapcsolat ID!", "warning");
    }
}

function updateConnectionList() {
    const container = document.getElementById("connectionListContent");
    container.innerHTML = "";

    if (connectionRegistry.size === 0) {
        const empty = createElement("p", { class: "empty-list" }, [document.createTextNode("Nincs kapcsolat")]);
        container.appendChild(empty);
    } else {
        connectionRegistry.forEach((connectionData, lineId) => {
            const isActive = lineId === activeConnectionId;

            const item = createElement("div", { class: "connection-item" }, []);

            const header = createElement("div", { class: "connection-item-header" }, []);
            const strong = createElement("strong", {}, [document.createTextNode(`ID: ${lineId}`)]);
            const badge = createElement("span", { class: "connection-type-badge" }, [document.createTextNode(connectionData.type)]);
            header.appendChild(strong);
            header.appendChild(badge);

            const details = createElement("div", { class: "connection-item-details" }, [document.createTextNode(`${connectionData.marker1} ↔ ${connectionData.marker2}`)]);

            const actions = createElement("div", { class: "connection-item-actions" }, []);
            const btn = createElement("button", { class: "connection-action-btn" }, [document.createTextNode("Kijelölés")]);
            btn.addEventListener("click", () => {
                selectConnectionForEdit(lineId);
            });
            actions.appendChild(btn);

            if (isActive) {
                item.classList.add("active");
            }

            item.appendChild(header);
            item.appendChild(details);
            item.appendChild(actions);

            container.appendChild(item);
        });
    }
}

window.selectConnectionForEdit = function (lineId) {
    activeConnectionId = lineId;
    document.getElementById("inputConnectionId").value = lineId;

    const hasConnectionData = connectionRegistry.has(lineId);
    if (hasConnectionData) {
        const connectionData = connectionRegistry.get(lineId);
        document.getElementById("connectionMarkerId1").value = connectionData.marker1;
        document.getElementById("connectionMarkerId2").value = connectionData.marker2;
        document.getElementById("connectionTypeSelect").value = connectionData.type;
    } else {
        document.getElementById("connectionMarkerId1").value = "";
        document.getElementById("connectionMarkerId2").value = "";
        document.getElementById("connectionTypeSelect").value = "default";
    }

    updateConnectionList();
};

// |------------------------------|
// | CAMERA CONTROLS              |
// |------------------------------|
function panTo() {
    const x = parseInt(document.getElementById("inputPanX").value);
    const y = parseInt(document.getElementById("inputPanY").value);
    const zoom = parseFloat(document.getElementById("inputZoomLevel").value);
    const isValidPosition = !Number.isNaN(x) && !Number.isNaN(y);

    if (isValidPosition) {
        try {
            mapViewer.moveTo(x, y, zoom);
        } catch (error) {
            showNotification(`Hiba a mozgatás során: ${error.message}`, "danger");
        }
    } else {
        showNotification("Érvénytelen pozíció!", "warning");
    }
}

function setZoom() {
    const zoom = parseFloat(document.getElementById("inputZoomLevel").value);
    const isValidZoom = !Number.isNaN(zoom) && zoom >= 1 && zoom <= 50;

    if (isValidZoom) {
        try {
            mapViewer.moveTo(0, 0, zoom);
        } catch (error) {
            showNotification(`Hiba a zoom beállítása során: ${error.message}`, "danger");
        }
    } else {
        showNotification("Érvénytelen zoom érték! (1-50)", "warning");
    }
}

function resetZoom() {
    try {
        mapViewer.resetZoom();
        document.getElementById("inputZoomLevel").value = "1";
    } catch (error) {
        showNotification(`Hiba a zoom visszaállítása során: ${error.message}`, "danger");
    }
}

// |------------------------------|
// | STATE DISPLAY & UPDATES      |
// |------------------------------|
function updateStateLoop() {
    try {
        const zoomLevel = mapViewer.getZoomLevel();
        document.getElementById("debugZoomText").innerText = zoomLevel.toFixed(2);
        document.getElementById("inputZoomLevel").value = zoomLevel.toFixed(2);
    } catch (e) {
    }

    const cursorIsValid = lastCursorX >= 0 && lastCursorY >= 0;
    if (cursorIsValid) {
        document.getElementById("debugCursorText").innerText = `${lastCursorX},${lastCursorY}`;
    }

    const hasActiveMarker = activeMarkerId != null && markerRegistry.has(activeMarkerId);
    if (hasActiveMarker) {
        const markerData = markerRegistry.get(activeMarkerId);
        document.getElementById("debugActiveMarkerText").innerText =
            `ID: ${markerData.id}, Típus: ${markerData.type}`;
    } else {
        document.getElementById("debugActiveMarkerText").innerText = "Nincs";
    }

    requestAnimationFrame(updateStateLoop);
}

// |------------------------------|
// | UTILITY FUNCTIONS            |
// |------------------------------|
function toggleFullscreen() {
    try {
        mapViewer.toggleFullscreen();
    } catch (error) {
        showNotification(`Hiba a teljes képernyő mód során: ${error.message}`, "danger");
    }
}

function clearAll() {
    try {
        mapViewer.clearMarkersAndLines();
        markerRegistry.clear();
        connectionRegistry.clear();
        activeMarkerId = null;
        updateMarkerList();
        updateConnectionList();
    } catch (error) {
        showNotification(`Hiba a törlés során: ${error.message}`, "danger");
    }
}

// |------------------------------|
// | EVENT LISTENERS              |
// |------------------------------|
function initializeEventListeners() {
    initializeMarkerListeners();
    initializeMarkerControlListeners();
    initializeConnectionListeners();
    initializeCameraListeners();
    initializeUtilityListeners();
}

function initializeMarkerListeners() {
    document.getElementById("buttonPlaceMarker").addEventListener("click", placeMarker);
    document.getElementById("buttonRemoveMarker").addEventListener("click", removeMarker);
    document.getElementById("inputMarkerId").addEventListener("input", refreshMarkerButtons);
}

function refreshMarkerButtons() {
    const placeBtn = document.getElementById("buttonPlaceMarker");
    const removeBtn = document.getElementById("buttonRemoveMarker");
    const raw = document.getElementById("inputMarkerId").value;
    const id = parseInt(raw);
    let valid = !Number.isNaN(id) && id >= 1;
    let exists = false;
    if (valid) {
        try {
            exists = mapViewer.doesMarkerExist(id);
        } catch (e) {
            exists = false;
        }
    }

    if (valid && exists) {
        selectMarker(id);
        removeBtn.disabled = false;
        placeBtn.innerText = "Frissítés";
    } else {
        if (activeMarkerId != id) {
            activeMarkerId = null;
            document.getElementById("inputMarkerX").value = "";
            document.getElementById("inputMarkerY").value = "";
            document.getElementById("markerTypeSelect").value = "empty";
            document.getElementById("inputMarkerFixedToMap").checked = false;
            updateMarkerList();
        }
        removeBtn.disabled = true;
        placeBtn.innerText = "Elhelyezés";
    }
}

function initializeMarkerControlListeners() {
    document.getElementById("buttonChangeMarkerType").addEventListener("click", changeMarkerType);
    document.getElementById("buttonSetMarkerX").addEventListener("click", setMarkerX);
    document.getElementById("buttonSetMarkerY").addEventListener("click", setMarkerY);
    document.getElementById("buttonSetMarkerRotation").addEventListener("click", setMarkerRotation);
    document.getElementById("buttonResizeMarker").addEventListener("click", resizeMarker);
    document.getElementById("buttonSetMarkerFixed").addEventListener("click", setMarkerFixedToMap);
    document.getElementById("buttonMoveMarkerToClick").addEventListener("click", toggleMarkerMoveMode);
}

function initializeConnectionListeners() {
    document.getElementById("buttonCreateConnection").addEventListener("click", createConnection);
    document.getElementById("buttonRemoveConnection").addEventListener("click", removeConnection);
    document.getElementById("inputConnectionId").addEventListener("input", refreshConnectionButtons);
}
function refreshConnectionButtons() {
    const createBtn = document.getElementById("buttonCreateConnection");
    const removeBtn = document.getElementById("buttonRemoveConnection");
    const raw = document.getElementById("inputConnectionId").value;
    const id = parseInt(raw);
    let valid = !Number.isNaN(id);
    let exists = false;
    if (valid) {
        try {
            exists = mapViewer.doesLineExist(id);
        } catch (e) {
            exists = false;
        }
    }

    if (valid && exists) {
        selectConnectionForEdit(id);
        createBtn.innerText = "Frissítés";
        removeBtn.disabled = false;
    } else {
        if (activeConnectionId != id) {
            activeConnectionId = null;
            document.getElementById("connectionMarkerId1").value = "";
            document.getElementById("connectionMarkerId2").value = "";
            document.getElementById("connectionTypeSelect").value = "default";
            updateConnectionList();
        }
        createBtn.innerText = "Létrehozás";
        removeBtn.disabled = true;
    }
}

function initializeCameraListeners() {
    document.getElementById("buttonPanTo").addEventListener("click", panTo);
    document.getElementById("buttonSetZoom").addEventListener("click", setZoom);
    document.getElementById("buttonResetZoom").addEventListener("click", resetZoom);
}

function initializeUtilityListeners() {
    document.getElementById("buttonFullScreen").addEventListener("click", toggleFullscreen);
    document.getElementById("buttonClearAll").addEventListener("click", clearAll);
}

// |------------------------------|
// | MAIN INITIALIZATION          |
// |------------------------------|

document.addEventListener("DOMContentLoaded", init);
