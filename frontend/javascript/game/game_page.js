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
            resolve();
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

function init() {
    mapViewerEngine = new MapViewer(mapCanvasId);
    mapViewerEngine.onClickHandler = (cursorX, cursorY) => {
        if (mapViewerEngine.doesMarkerExist(0)) {
            mapViewerEngine.moveMarker(0, cursorX, cursorY);
        } else {
            mapViewerEngine.placeMarker(0, cursorX, cursorY, 24.0, 32.0, "uploading");
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
    let isAutoRtoate = document.getElementById("autoRotate").checked;
    equirectangularViewer.setAutoRotate(isAutoRtoate);
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
        nextMap();

        const roundCount = gameData.game.rounds;
        const roundTime = gameData.game.roundTime;

        for (let i = 0; i < roundCount; i++) {
            console.log(`Starting round ${i + 1} of ${roundCount}`);
            document.getElementById(mapCanvasId).style.maxWidth = "";
            document.getElementById(mapCanvasId).style.width = "";
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
        ).then(() => console.log("Game image loaded:", point.point_id))
            .catch(e => console.error("Failed to load game image:", e));
    } catch (error) {
        console.error("Error creating point:", error);
    }
    await createCountdownTimer();
}

function nextMap() {
    gameMapsIndex++;
    console.log("Next map:" + gameMapsIndex);
    console.log(gameMaps.length);
    if (gameMaps.length <= gameMapsIndex) {
        gameMapsIndex = 0;
    }
    const map = gameMaps[gameMapsIndex];
    const imageDataUrl = `data:${map.image.mime_type};base64,${map.image.base64}`;
    mapViewerEngine.loadMap(imageDataUrl, map.image.width, map.image.height)
        .then(function () {
            console.log("Game map loaded:", map.mapI);
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
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = timeLeft;
        if (timeLeft <= 0) {
            sendGuess(); // auto-submit when time runs out
        }
    }, 1000);
}

function stopRoundTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

async function sendGuess() {
    stopRoundTimer();
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
    console.log("Guess response:", response);
    showAnswer(response);
    if (resolveGuess) {
        resolveGuess();
        resolveGuess = null;
    }
}

function showAnswer(response) {
    document.getElementById(mapCanvasId).style.maxWidth = "none";
    document.getElementById(mapCanvasId).style.width = "100%";
    placeMarkerByUV(1, response.pointu, response.pointv, 24.0, 32.0, "ready");
    if (doesmarkerExist(0)) {
        connectMarker(0, 1, 0);
    }
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
