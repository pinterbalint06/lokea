export function formatSecondsToMinutes(seconds) {
    let normalizedSeconds = Math.max(0, Math.floor(seconds)); 
    let minutesPart = Math.floor(normalizedSeconds / 60).toString().padStart(2, "0");
    let secondsPart = (normalizedSeconds % 60).toString().padStart(2, "0");
    return `${minutesPart}:${secondsPart}`;
}