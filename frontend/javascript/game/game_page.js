import { MapViewer } from "../libs/viewer/MapViewer.js";
import { EquirectangularViewer } from "../libs/viewer/EquirectangularViewer.js";

const pictureCanvasId = "pictureCanvas";
const mapCanvasId = "mapCanvas";

/** 
 * @type {EquirectangularViewer} */
let equirectangularViewer;

// The engine
let mapViewerEngine;


var gameMaps = [];
var gameMapsIndex = -1;

document.addEventListener("DOMContentLoaded", function () {
    init();
    startGame();
    document.getElementById("nextMap").addEventListener("click", function () {
        cycleMaps();
    });
});

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
            setTimeout(resolve, 350); // wait for CSS fade-out transition
        }, 1000);
    }
}

function createCountdownTimer() {
    return new Promise(resolve => {
        const overlay = document.getElementById("countdownOverlay");
        const numberEl = document.getElementById("countdownNumber");
        const steps = ["3", "2", "1", "Rajt!"];
        overlay.classList.add("active");
        showCountdownStep(overlay, numberEl, steps, 0, resolve);
    });
}

let asd = true;
function init() {
    mapViewerEngine = new MapViewer(mapCanvasId);
    mapViewerEngine.onClickHandler = (cursorX, cursorY) => {
        if (asd) {
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
    console.log(mapViewerEngine.getMarkerPosition(0));
    return mapViewerEngine.getMarkerPosition(0);
}

function doesmarkerExist(id) {
    return mapViewerEngine.doesMarkerExist(id);
}

function doesLineExist() {
    return mapViewerEngine.doesLineExist(0);
}

function removeMarker() {
    mapViewerEngine.removeMarker(0);
}

function removeLine() {
    mapViewerEngine.removeLine(0);
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

let resolveGuess = null;
let resolveNext = null;

function waitForGuess() {
    return new Promise(resolve => { resolveGuess = resolve; });
}

function waitForNext() {
    return new Promise(resolve => { resolveNext = resolve; });
}

function nextRound() {
    asd = true;
    if (resolveNext) {
        resolveNext();
        resolveNext = null;
    }
}

async function startGame() {
    try {
        const gameData = await fetchGameData('http://127.0.0.1:3000/api/game/get_game_info');

        const mapsData = await fetchGameData('http://127.0.0.1:3000/api/game/get_all_maps');
        console.log(gameData);
        console.log(mapsData);

        if (!gameData.success || !gameData.game) throw new Error("Failed to fetch game info");
        if (!mapsData.success || !mapsData.maps) throw new Error("Failed to fetch game maps");

        gameMaps = mapsData.maps;
        cycleMaps();

        const roundCount = gameData.game.rounds;
        const roundTime = gameData.game.roundTime;

        for (let i = 0; i < roundCount; i++) {
            console.log(`Starting round ${i + 1} of ${roundCount}`);
            document.getElementById(mapCanvasId).classList.remove("full");
            document.getElementById("guessPanel").classList.remove("open");
            equirectangularViewer.setZoom(0);
            await createPoint();
            startRoundTimer(roundTime);
            await waitForGuess();
            await waitForNext();
            removeEverything();
        }
        console.log("Game over");
        await finishGame();
    } catch (error) {
        console.error("Error starting game:", error);
    }
}

async function createPoint() {
    try {
        const pointData = await fetchGameData('http://127.0.0.1:3000/api/game/get_random_point')
        console.log(pointData);
        if (!pointData.success || !pointData.point) throw new Error("Failed to fetch random point");
        const point = pointData.point;
        equirectangularViewer.loadImage(
            `data:${point.image.mime_type};base64,${point.image.base64}`,
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

function cycleMaps() {
    gameMapsIndex++;
    if (gameMaps.length <= gameMapsIndex) {
        gameMapsIndex = 0;
    }
    nextMap();
}

function nextMap() {
    const map = gameMaps[gameMapsIndex];
    console.log(map);
    const imageDataUrl = `data:${map.image.mime_type};base64,${map.image.base64}`;
    mapViewerEngine.loadMap(imageDataUrl, map.image.width, map.image.height)
        .then(function () {
            console.log("Game map loaded:", gameMapsIndex);
        })
        .catch(function (e) {
            console.error("Failed to load game map:", e);
        });
    removeEverything();

}

let timerInterval = null;
let timeLeft = 0;

function startRoundTimer(seconds) {
    timeLeft = seconds;
    const timerEl = document.getElementById("timer");
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
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
    stopRoundTimer();
    asd = false;
    let sendData;
    if (!doesmarkerExist(0)) {
        sendData = { u: -1, v: -1 };
    }
    else {
        sendData = markerPosition();
    }
    sendData.timeLeft = timeLeft;
    sendData.map_i = gameMapsIndex;
    console.log("Sending guess:", sendData);
    const response = await postGameScore('http://127.0.0.1:3000/api/game/session_guess', sendData);
    showAnswer(response);
    // showUserScore(response);
    if (resolveGuess) {
        resolveGuess();
        resolveGuess = null;
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
    if (doesmarkerExist(0)) {
        connectMarker(0, 1, 0);
    }

    const panel = document.getElementById("guessPanel");
    document.getElementById("guessPanelScore").textContent = response.score ?? 0;
    document.getElementById("guessPanelDistance").textContent =
        response.distance != null ? `Távolság: ${response.distance} px` : "Rossz térkép vagy nincs jelölő";
    document.getElementById("guessPanelTotal").textContent = response.totalScore ?? 0;
    panel.classList.add("open");
}

async function fetchGameData(url) {
    let re;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Hiba a játék adatok lekérésekor: ' + response.statusText);
        }
        re = await response.json();
    } catch (error) {
        re = { message: error.message };
    }
    return re;
}

async function postGameScore(url, data) {
    let res = null;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        res = result;
    } catch (error) {
        console.error("Error sending guess:", error);
    }
    return res;
}

async function finishGame() {
    try {
        const response = await fetch('/api/finish_game_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        console.log("Finish game response:", result);
    } catch (error) {
        console.error("Error finishing game:", error);
    }
}

window.mapFullScreen = mapFullScreen;
window.markerPosition = markerPosition;
window.pictureFullScreen = pictureFullScreen;
window.clearImage = clearImage;
window.startGame = startGame;
window.nextMap = nextMap;
window.nextRound = nextRound;
window.sendGuess = sendGuess;
window.finishGame = finishGame;
