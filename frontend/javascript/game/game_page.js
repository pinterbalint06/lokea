import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";
import { formatSecondsToMinutes } from "./timer-conversion.js";
import { degreeToRadian } from "../libs/math/mathUtils.js";
import { loadPointEquirectangularLowThenHigh, loadMapImageLowThenHigh } from "../libs/network/progressiveImage.js";

const pictureCanvasId = "pictureCanvas";
const mapCanvasId = "mapCanvas";

/** 
 * @type {EquirectangularViewer} */
let equirectangularViewer;

// The engine
let mapViewerEngine;


let maps = [];
let mapId = null;
let mapsIndex = -1;

let canPlaceMarker = true;

let resolveGuess = null;
let resolveNext = null;

let timerInterval = null;
let timeLeft = 0;

let guessSent = false;

let currentPointId = null;

document.addEventListener("DOMContentLoaded", function () {
    init();
    startGame();
});

async function init() {
    mapViewerEngine = new MapViewer(mapCanvasId);
    mapViewerEngine.onClickHandler = (cursorX, cursorY) => {
        if (canPlaceMarker) {
            if (mapViewerEngine.doesMarkerExist(0)) {
                mapViewerEngine.moveMarker(0, cursorX, cursorY);
            } else {
                mapViewerEngine.placeMarker(0, cursorX, cursorY, 24.0, 32.0, "uploading");
            }
        }
    }
    document.getElementById("autoRotate").addEventListener("change", setAutoRotate);
    equirectangularViewer = new EquirectangularViewer(pictureCanvasId);
    await equirectangularViewer.ready();
}

function mapFullScreen() {
    mapViewerEngine.toggleFullscreen();
}

function markerPosition() {
    return mapViewerEngine.getMarkerPosition(0);
}

function doesMarkerExist(id) {
    return mapViewerEngine.doesMarkerExist(id);
}

function doesLineExist() {
    return mapViewerEngine.doesLineExist(0);
}

function placeMarkerByUV(id, u, v, width, height, state) {
    mapViewerEngine.placeMarkerByUV(id, u, v, width, height, state);
}

function connectMarker(id1, id2, lineId) {
    mapViewerEngine.connectMarkers(id1, id2, lineId);
}

function removeEverything() {
    mapViewerEngine.clearMarkersAndLines();
}

function movetoMarker(x, y) {
    mapViewerEngine.moveTo(x, y);
}

function setAutoRotate() {
    const isAutoRotate = document.getElementById("autoRotate").checked;
    equirectangularViewer.setAutoRotate(isAutoRotate);
    document.getElementById("autoRotateBtn").classList.toggle("active", isAutoRotate);
}

function pictureFullScreen() {
    equirectangularViewer.toggleFullscreen();
}

function clearImage() {
    equirectangularViewer.clearImage();
}

function showCountdownStep(overlay, numberEl, steps, i, resolve) {
    numberEl.textContent = steps[i];
    numberEl.style.animation = "none";
    numberEl.offsetHeight; // reflow to restart animation
    numberEl.style.animation = "";

    i++;
    if (i < steps.length) {
        setTimeout(() => showCountdownStep(overlay, numberEl, steps, i, resolve), 1000);
    } else {
        setTimeout(() => {
            overlay.classList.remove("active");
            resolve();
        }, 1000);
    }
}

function createCountdownTimer() {
    return new Promise(resolve => {
        const overlay = document.getElementById("countdownOverlay");
        const numberEl = document.getElementById("countdownNumber");
        const steps = ["3", "2", "1"];
        overlay.classList.add("active");
        showCountdownStep(overlay, numberEl, steps, 0, resolve);
    });
}

function showError(message) {
    stopRoundTimer();
    document.getElementById('errorMessage').textContent = message || 'Váratlan hiba történt.';
    document.getElementById('errorOverlay').classList.add('active');
}

function waitForGuess() {
    return new Promise(resolve => { resolveGuess = resolve; });
}

function waitForNext() {
    return new Promise(resolve => { resolveNext = resolve; });
}

function nextRound() {
    canPlaceMarker = true;
    guessSent = false;
    if (resolveNext) {
        resolveNext();
        resolveNext = null;
    }
}

async function startGame() {
    try {
        const [gameData, mapsData] = await Promise.all([
            fetchGameData('/api/game/session'),
            fetchGameData('/api/game/maps')
        ]);

        console.log(gameData);
        console.log(mapsData);

        if (!Array.isArray(mapsData.maps) || mapsData.maps.length === 0) {
            canPlaceMarker = false;
            throw new Error("Nincsenek elérhető térképek a játékhoz.");
        }
        if (!gameData.game || typeof gameData.game.rounds !== 'number' || typeof gameData.game.roundTime !== 'number') {
            throw new Error("Érvénytelen játékadatok érkeztek a szervertől.");
        }
        maps = mapsData.maps;
        cycleMaps();
        if (maps.length > 1) {
            document.querySelectorAll('.map-side-btn').forEach(btn => btn.style.display = 'flex');
            document.getElementById('mapPrevBtn').addEventListener('click', () => cycleMaps(-1));
            document.getElementById('mapNextBtn').addEventListener('click', () => cycleMaps(1));
        }


        const roundCount = gameData.game.rounds;
        const currentRound = gameData.game.currentRound;
        const roundTime = gameData.game.roundTime;

        document.getElementById('totalRounds').textContent = roundCount;

        for (let i = currentRound; i < roundCount; i++) {
            console.log(`Starting round ${i + 1} of ${roundCount}`);
            const isLastRound = i === roundCount - 1;
            resetGameState(roundTime, i);
            await createPoint(roundTime);
            await waitForGuess();
            if (isLastRound) {
                document.getElementById('nextRoundBtn').textContent = 'Eredmények';
            }
            await waitForNext();
            removeEverything();
        }
        console.log("Game over");
        await finishGame();
    } catch (error) {
        showError('Nem sikerült csatlakozni a játékhoz: ' + error.message);
    }
}

function resetGameState(roundTime, currentRound) {
    document.getElementById(mapCanvasId).classList.remove("full");
    document.getElementById("guessPanel").classList.remove("open");
    document.getElementById('bottomRight').classList.remove('expanded');
    document.getElementById('currentRound').textContent = currentRound + 1;
    document.getElementById("guessBtn").disabled = false;
    document.getElementById("pictureFullScreenBtn").disabled = false;
}

async function createPoint(roundTime) {
    try {
        const pointData = await fetchGameData('/api/game/round')
        console.log("Received point data:", pointData);
        if (!pointData.success || !pointData.point) throw new Error("Failed to fetch random point");
        const point = pointData.point;
        document.getElementById("timer").textContent = formatSecondsToMinutes(point.game.timeLeft - 3);
        currentPointId = point.pointId;
        loadPointLowThenHigh(point.pointId);
        equirectangularViewer.setZoom(0);
        if (point.game.timeLeft >= roundTime) {
            await createCountdownTimer();
        }
        startRoundTimer(point.game.roundEndAt);
    } catch (error) {
        console.error("Error creating point:", error);
    }

}

function cycleMaps(direction = 1) {
    mapsIndex += direction;
    if (mapsIndex >= maps.length) {
        mapsIndex = 0;
    } else if (mapsIndex < 0) {
        mapsIndex = maps.length - 1;
    }
    nextMap();
}

function nextMap() {
    const map = maps[mapsIndex];
    mapId = map.mapId;
    console.log(map);
    loadMaplowThenHigh(mapId);
    document.getElementById('mapTitle').textContent = map.title || '-';
    removeEverything();

}

function startRoundTimer(roundEndAt) {
    const timerEl = document.getElementById("timer");
    timerInterval = setInterval(() => {
        const remaining = Math.ceil((roundEndAt - Date.now()) / 1000);
        timerEl.textContent = formatSecondsToMinutes(remaining);
        timerEl.classList.toggle("urgent", remaining <= 5 && remaining > 0);
        if (remaining <= 0) {
            sendGuess();
        }
    }, 200);
}

function stopRoundTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    document.getElementById("timer").classList.remove("urgent");
}

async function sendGuess() {
    if (!guessSent) {
        guessSent = true;
        stopRoundTimer();
        document.getElementById("guessBtn").disabled = true;
        document.getElementById("pictureFullScreenBtn").disabled = true;
        canPlaceMarker = false;
        let sendData;
        if (!doesMarkerExist(0)) {
            sendData = { u: -1, v: -1 };
        }
        else {
            sendData = markerPosition();
        }
        sendData.map_i = mapsIndex;
        console.log("Sending guess:", sendData);
        try {
            const response = await postGameScore('/api/game/round/guess', sendData);
            showAnswer(response);
            if (resolveGuess) {
                resolveGuess();
                resolveGuess = null;
            }
        } catch (error) {
            showError('Nem sikerült elküldeni a tippet: ' + error.message);
        }
    }
}

function showAnswer(response) {
    console.log("Guess response:", response);
    if (mapsIndex != response.mapI) {
        mapsIndex = response.mapI;
        nextMap();
    }

    const panel = document.getElementById("guessPanel");
    document.getElementById("guessPanelScore").textContent = response.score ?? 0;
    document.getElementById("guessPanelDistance").textContent = response.distance != null ? `Távolság: ${response.distance} px` : "Rossz térkép vagy nincs jelölő";
    document.getElementById("guessPanelTotal").textContent = response.totalScore ?? 0;
    panel.classList.add("open");

    setTimeout(() => {
        document.getElementById(mapCanvasId).classList.add("full");
        document.getElementById('bottomRight').classList.add('expanded');
        placeMarkerByUV(1, response.pointu, response.pointv, 24.0, 32.0, "ready");
        if (doesMarkerExist(0)) {
            connectMarker(0, 1, 0);
        }
        setTimeout(() => {
            movetoMarker(response.pointx, response.pointy);
        }, 500);
    }, 320);
}

async function loadPointLowThenHigh(pId) {
    try {
        await loadPointEquirectangularLowThenHigh({
            pointId: pId,
            loadToViewer: async (imgData) => {
                await equirectangularViewer.loadImage(imgData.url, imgData.width, imgData.height, degreeToRadian(imgData.northDirection));
            },
            isCurrent: () => currentPointId && currentPointId === pId
        });
    } catch (error) {
        console.error("Error loading point:", error);
    }
}

async function loadMaplowThenHigh(mId) {
    try {
        await loadMapImageLowThenHigh({
            mapId: mId,
            loadToViewer: async (imgData) => {
                await mapViewerEngine.loadMap(imgData.url, imgData.width, imgData.height);
            },
            isCurrent: () => mapId && mapId === mId
        });
    } catch (error) {
        console.error("Error loading map:", error);
    }
}

async function fetchGameData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Hálózati hiba');
    }
    const data = await response.json();
    return data;
}

async function postGameScore(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Hálózati hiba');
    }
    const result = await response.json();
    return result;
}

async function finishGame() {
    try {
        const response = await fetch('/api/game/session', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(responseData.message || 'Hálózati hiba');
        }
        const result = await response.json();
        console.log("Finish game response:", result);
    } catch (error) {
        showError("Hiba a játék befejezésekor: " + error.message);
    }

    const panel = document.getElementById('guessPanel');
    document.getElementById('finalScore').textContent = document.getElementById('guessPanelTotal').textContent || '0';
    panel.classList.add('open');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        panel.classList.add('game-over');
    }));
}

window.mapFullScreen = mapFullScreen;
window.pictureFullScreen = pictureFullScreen;
window.nextRound = nextRound;
window.sendGuess = sendGuess;
window.finishGame = finishGame;
