document.addEventListener("DOMContentLoaded", function () {
    initRoundTimeRange();
    document.getElementById("settingsForm").addEventListener("submit", function (e) {
        e.preventDefault();
        startGame();
    });
});
function initRoundTimeRange() {
    let timeRange = document.getElementById("times");
    updateTimeValue();
    timeRange.addEventListener("input", updateTimeValue);
}
function updateTimeValue() {
    let timeValue = document.getElementById("timesValue");
    let timeRange = document.getElementById("times");
    let seconds = Number.parseInt(timeRange.value);
    timeValue.value = formatSecondsToMinutes(seconds);
    timeValue.textContent = formatSecondsToMinutes(seconds);
};


function formatSecondsToMinutes(seconds) {
    let minutesPart = Math.floor(seconds / 60).toString().padStart(2, "0");
    let secondsPart = (seconds % 60).toString().padStart(2, "0");
    return `${minutesPart}:${secondsPart}`;
}
