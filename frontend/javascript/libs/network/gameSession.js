import { handleResponseError } from "./fetch.js";

export async function fetchActiveGameSession() {
    const response = await fetch("/api/choose-game/session");

    if (!response.ok) {
        await handleResponseError(response);
    }

    return response.json();
}

export async function finishGameSession() {
    const response = await fetch("/api/game/session", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}
