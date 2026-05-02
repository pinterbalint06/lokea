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
let gameMapId = null;
let commentIsInEditMode = false;
let commentIsSubmitting = false;

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
    document.getElementById("submitRatingBtn").addEventListener("click", handleCommentSubmit);
    document.getElementById("editCommentBtn").addEventListener("click", handleEditComment);
    document.getElementById("deleteCommentBtn").addEventListener("click", handleDeleteComment);
    document.getElementById("cancelCommentEditBtn").addEventListener("click", handleCancelCommentEdit);
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

        if (!Array.isArray(mapsData.maps) || mapsData.maps.length === 0) {
            canPlaceMarker = false;
            throw new Error("Nincsenek elérhető térképek a játékhoz.");
        }
        if (!gameData.game || typeof gameData.game.rounds !== 'number' || typeof gameData.game.roundTime !== 'number') {
            throw new Error("Érvénytelen játékadatok érkeztek a szervertől.");
        }
        gameMapId = gameData.game.gameMapId ?? null;
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
        const pointData = await fetchGameData('/api/game/round');
        if (!pointData.point) throw new Error("Failed to fetch random point");
        const point = pointData.point;
        const showCountdown = point.game.timeLeft > roundTime;
        document.getElementById("timer").textContent = formatSecondsToMinutes(
            showCountdown ? point.game.timeLeft - 3 : point.game.timeLeft
        );
        currentPointId = point.pointId;
        loadPointLowThenHigh(point.pointId);
        equirectangularViewer.setZoom(0);
        if (showCountdown) {
            await createCountdownTimer();
        }
        startRoundTimer(point.game.roundEndAt);
    } catch (error) {
        showError("Error creating point:", error);
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
    document.getElementById('mapTitle').textContent = map.title || '-';
    removeEverything();
    try {
        loadMaplowThenHigh(mapId);
    }
    catch (error) {
        showError("Error loading map:", error);
    }
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
        throw new Error(error.message || "Error loading point image");
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
        throw new Error(error.message || "Error loading map image");
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
    } catch (error) {
        showError("Hiba a játék befejezésekor: " + error.message);
    }

    const panel = document.getElementById('guessPanel');
    document.getElementById('finalScore').textContent = document.getElementById('guessPanelTotal').textContent || '0';
    panel.classList.add('open');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        panel.classList.add('game-over');
    }));
    loadUserComment();
    loadOtherComments();
    loadLeaderboard();
}

async function loadUserComment() {
    try {
        const response = await fetch(`/api/game-maps/${gameMapId}/my-comment`);
        if (!gameMapId) {
            throw new Error('Nincs elérhető pálya a megjegyzés betöltéséhez.');
        }
        if (response.ok) {
            const data = await response.json();
            if (data && data.rating) {
                showCommentViewState(data);
            } else {
                showCommentFormState(false);
            }
        } else if (response.status === 404) {
            showCommentFormState(false);
        }
    } catch (error) {
        showCommentFormState(false);
    }
}

function showCommentFormState(editMode) {
    commentIsInEditMode = editMode;
    document.getElementById('gameoverFormState').style.display = '';
    document.getElementById('gameoverViewState').style.display = 'none';
    document.getElementById('submitRatingBtn').textContent = editMode ? 'Módosítás mentése' : 'Értékelés küldése';
    document.getElementById('cancelCommentEditBtn').style.display = editMode ? '' : 'none';
    if (!editMode) {
        document.querySelectorAll('[name="gameOverRating"]').forEach(r => r.checked = false);
        document.getElementById('gameoverCommentText').value = '';
    }
}

function showCommentViewState(commentData) {
    document.getElementById('gameoverFormState').style.display = 'none';
    document.getElementById('gameoverViewState').style.display = '';
    document.getElementById('gameoverUserRating').style.setProperty('--rating', commentData.rating);
    document.getElementById('gameoverUserText').textContent = commentData.comment_text || '';
}

async function handleCommentSubmit() {
    const btn = document.getElementById('submitRatingBtn');
    try {
        if (commentIsSubmitting || !gameMapId) {
            throw new Error('Nem lehet elküldeni az értékelést');
        }
        const rating = document.querySelector('[name="gameOverRating"]:checked')?.value;
        if (!rating) {
            showGameOverToast('Kérlek válassz legalább 1 csillagot!', true);
            return;
        }
        commentIsSubmitting = true;
        btn.disabled = true;
        const formData = new FormData();
        formData.append('rating', rating);
        const text = document.getElementById('gameoverCommentText').value.trim();
        if (text) formData.append('comment', text);
        const method = commentIsInEditMode ? 'PUT' : 'POST';
        const response = await fetch(`/api/game-maps/${gameMapId}/my-comment`, { method, body: formData });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Hiba történt');
        }
        showGameOverToast(commentIsInEditMode ? 'Értékelésed frissítve!' : 'Értékelésed elküldve!');
        await loadUserComment();
        loadOtherComments();
    } catch (error) {
        showGameOverToast(error.message || 'Hiba az értékelés elküldésekor', true);
    } finally {
        commentIsSubmitting = false;
        btn.disabled = false;
    }
}

function handleEditComment() {
    const rating = document.getElementById('gameoverUserRating').style.getPropertyValue('--rating').trim();
    const text = document.getElementById('gameoverUserText').textContent;
    showCommentFormState(true);
    const ratingInput = document.querySelector(`[name="gameOverRating"][value="${rating}"]`);
    if (ratingInput) ratingInput.checked = true;
    document.getElementById('gameoverCommentText').value = text;
}

async function handleDeleteComment() {
    try {
        if (commentIsSubmitting || !gameMapId) {
            throw new Error('Nem lehet törölni az értékelést');
        }
        if (!confirm('Biztosan törlöd az értékelésedet?')) {
            throw new Error('Törlés megszakítva');
        }
        commentIsSubmitting = true;
        const response = await fetch(`/api/game-maps/${gameMapId}/my-comment`, { method: 'DELETE' });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Hiba történt');
        }
        showGameOverToast('Értékelésed törölve.');
        showCommentFormState(false);
        loadOtherComments();
    } catch (error) {
        showGameOverToast(error.message || 'Hiba a törléskor', true);
    } finally {
        commentIsSubmitting = false;
    }
}

function handleCancelCommentEdit() {
    if (!commentIsSubmitting) {
        loadUserComment();
    }
}

async function loadLeaderboard() {
    const container = document.getElementById('gameOverLeaderboard');
    try {
        if (!gameMapId) {
            throw new Error('Nincs elérhető pálya az eredménylista betöltéséhez.');
        }
        const response = await fetch(`/api/game-maps/${gameMapId}`);
        if (!response.ok) {
            throw new Error('Hiba történt az eredménylista betöltésekor.');
        }
        const data = await response.json();
        renderLeaderboard(container, data.game_map_details?.top_scores);
    } catch (error) {
        showGameOverToast(error.message || 'Hiba történt az eredménylista betöltésekor', true);
    }
}

function renderLeaderboard(container, topScores) {
    container.innerHTML = '';
    if (!topScores || topScores.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'gameover-comments-empty';
        empty.textContent = 'Még nincs játék ezen a pályán.';
        container.appendChild(empty);
    }
    else {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < topScores.length; i++) {
            fragment.appendChild(createLeaderboardItem(i + 1, topScores[i]));
        }
        container.appendChild(fragment);
    }
}

function createLeaderboardItem(rank, scoreData) {
    const item = document.createElement('article');
    item.className = 'gameover-score-item';

    const rankEl = document.createElement('span');
    rankEl.className = 'gameover-score-rank';
    rankEl.textContent = String(rank);
    if (rank <= 3) rankEl.dataset.rank = rank;

    const main = document.createElement('div');
    main.className = 'gameover-score-main';

    const name = document.createElement('p');
    name.className = 'gameover-score-name';
    name.textContent = scoreData.username;

    const time = document.createElement('small');
    time.className = 'gameover-score-time';
    time.textContent = `Elérve: ${formatScoreTime(scoreData.score_time)}`;

    main.appendChild(name);
    main.appendChild(time);

    const value = document.createElement('span');
    value.className = 'gameover-score-value';
    value.textContent = scoreData.score;

    item.appendChild(rankEl);
    item.appendChild(main);
    item.appendChild(value);

    return item;
}

function formatScoreTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('hu-HU', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

async function loadOtherComments() {
    const container = document.getElementById('gameOverComments');
    try {
        if (!gameMapId) {
            throw new Error('Nincs elérhető pálya a megjegyzések betöltéséhez.');
        }
        const response = await fetch(`/api/game-maps/${gameMapId}/comments`);
        if (!response.ok) {
            throw new Error('Hiba történt a megjegyzések betöltésekor.');
        }
        const data = await response.json();
        renderOtherComments(container, data.comments);
    } catch (error) {
        showGameOverToast(error.message || 'Hiba történt a megjegyzések betöltésekor', true);
    }
}

function renderOtherComments(container, comments) {
    container.innerHTML = '';
    if (!comments || comments.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'gameover-comments-empty';
        empty.textContent = 'Még nincsenek értékelések.';
        container.appendChild(empty);
    }
    else {
        const fragment = document.createDocumentFragment();
        for (const comment of comments) {
            fragment.appendChild(createCommentItem(comment));
        }
        container.appendChild(fragment);
    }

}

function createCommentItem(comment) {
    const item = document.createElement('div');
    item.className = 'gameover-comment-item';

    const author = document.createElement('strong');
    author.className = 'gameover-comment-author';
    author.textContent = comment.username || 'Ismeretlen';

    const stars = document.createElement('div');
    stars.className = 'rating-stars gameover-comment-stars';
    stars.style.setProperty('--rating', comment.rating);

    const header = document.createElement('div');
    header.className = 'gameover-comment-header';
    header.appendChild(author);
    header.appendChild(stars);
    item.appendChild(header);

    if (comment.comment_text) {
        const text = document.createElement('p');
        text.className = 'gameover-comment-text';
        text.textContent = comment.comment_text;
        item.appendChild(text);
    }

    return item;
}

let toastTimeout = null;
function showGameOverToast(msg, isError = false) {
    const existing = document.getElementById('gameoverToast');
    if (existing) existing.remove();
    if (toastTimeout) clearTimeout(toastTimeout);
    const toast = document.createElement('div');
    toast.id = 'gameoverToast';
    toast.className = 'gameover-toast' + (isError ? ' gameover-toast--error' : '');
    toast.textContent = msg;
    document.body.appendChild(toast);
    toastTimeout = setTimeout(() => toast.remove(), 3000);
}

window.mapFullScreen = mapFullScreen;
window.pictureFullScreen = pictureFullScreen;
window.nextRound = nextRound;
window.sendGuess = sendGuess;
window.finishGame = finishGame;
