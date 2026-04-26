import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";
import { formatSecondsToMinutes } from "./timer-conversion.js";

const pictureCanvasId = "pictureCanvas";
const mapCanvasId = "mapCanvas";

/** 
 * @type {EquirectangularViewer} */
let equirectangularViewer;

// The engine
let mapViewerEngine;


let gameMaps = [];
let gameMapsIndex = -1;

let canPlaceMarker = true;

let resolveGuess = null;
let resolveNext = null;

let timerInterval = null;
let timeLeft = 0;

let guessSent = false;

document.addEventListener("DOMContentLoaded", function () {
    init();
    startGame();
});

function init() {
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
        const gameData = await fetchGameData('/api/game/get_game_info');

        const mapsData = await fetchGameData('/api/game/get_all_maps');
        console.log(gameData);
        console.log(mapsData);

        gameMaps = mapsData.maps;
        cycleMaps();

        const roundCount = gameData.game.rounds;
        const currentRound = gameData.game.currentRound;
        const roundTime = gameData.game.roundTime;

        document.getElementById('totalRounds').textContent = roundCount;

        for (let i = currentRound; i < roundCount; i++) {
            console.log(`Starting round ${i + 1} of ${roundCount}`);
            const isLastRound = i === roundCount - 1;
            resetGameState(roundTime, i);
            await createPoint();
            startRoundTimer(roundTime);
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

function resetGameState(roundTime, round) {
    document.getElementById(mapCanvasId).classList.remove("full");
    document.getElementById("guessPanel").classList.remove("open");
    document.getElementById('bottomRight').classList.remove('expanded');
    document.getElementById('currentRound').textContent = round + 1;
    document.getElementById("guessBtn").disabled = false;
    document.getElementById("pictureFullScreenBtn").disabled = false;
    document.getElementById("timer").textContent = formatSecondsToMinutes(roundTime);
}

async function createPoint() {
    try {
        const pointData = await fetchGameData('/api/game/get_random_point')
        console.log(pointData);
        if (!pointData.success || !pointData.point) throw new Error("Failed to fetch random point");
        const point = pointData.point;
        equirectangularViewer.loadImage(
            `data:${point.image.mimeType};base64,${point.image.base64}`,
            point.image.width, point.image.height
        ).then(() => {
            console.log("Game image loaded:", point.point_id);
            equirectangularViewer.setZoom(0);
        }).catch(e => console.error("Failed to load game image:", e));
    } catch (error) {
        console.error("Error creating point:", error);
    }
    await createCountdownTimer();
}

function cycleMaps(direction = 1) {
    gameMapsIndex += direction;
    if (gameMapsIndex >= gameMaps.length) {
        gameMapsIndex = 0;
    } else if (gameMapsIndex < 0) {
        gameMapsIndex = gameMaps.length - 1;
    }
    nextMap();
}

function nextMap() {
    const map = gameMaps[gameMapsIndex];
    console.log(map);
    const imageDataUrl = `data:${map.image.mimeType};base64,${map.image.base64}`;
    mapViewerEngine.loadMap(imageDataUrl, map.image.width, map.image.height)
        .then(function () {
            console.log("Game map loaded:", gameMapsIndex);
        })
        .catch(function (e) {
            console.error("Failed to load game map:", e);
        });
    document.getElementById('mapTitle').textContent = map.title || '-';
    removeEverything();

}

function startRoundTimer(seconds) {
    timeLeft = seconds;
    const timerEl = document.getElementById("timer");
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = formatSecondsToMinutes(timeLeft);
        timerEl.classList.toggle("urgent", timeLeft <= 5 && timeLeft > 0);
        if (timeLeft <= 0) {
            sendGuess();
        }
    }, 1000);
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
        document.getElementById('bottomRight').classList.add('expanded');
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
        sendData.map_i = gameMapsIndex;
        console.log("Sending guess:", sendData);
        try {
            const response = await postGameScore('/api/game/session_guess', sendData);
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
    if (gameMapsIndex != response.mapI) {
        gameMapsIndex = response.mapI;
        nextMap();
    }
    document.getElementById(mapCanvasId).classList.add("full");
    placeMarkerByUV(1, response.pointu, response.pointv, 24.0, 32.0, "ready");
    if (doesMarkerExist(0)) {
        connectMarker(0, 1, 0);
    }
    movetoMarker(response.pointx, response.pointy);
    const panel = document.getElementById("guessPanel");
    document.getElementById("guessPanelScore").textContent = response.score ?? 0;
    document.getElementById("guessPanelDistance").textContent = response.distance != null ? `Távolság: ${response.distance} px` : "Rossz térkép vagy nincs jelölő";
    document.getElementById("guessPanelTotal").textContent = response.totalScore ?? 0;
    panel.classList.add("open");
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
        const response = await fetch('/api/game/finish_game_session', {
            method: 'POST',
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

window.cycleMaps = cycleMaps;
window.mapFullScreen = mapFullScreen;
window.pictureFullScreen = pictureFullScreen;
window.nextRound = nextRound;
window.sendGuess = sendGuess;
window.finishGame = finishGame;
