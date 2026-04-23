export function formatSecondsToMinutes(seconds) {
    let minutesPart = Math.floor(seconds / 60).toString().padStart(2, "0");
    let secondsPart = (seconds % 60).toString().padStart(2, "0");
    return `${minutesPart}:${secondsPart}`;
}