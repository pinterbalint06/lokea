import { fetchAndValidate } from "../../libs/network/fetch.js";
import { handleResponseError } from "../../libs/network/fetch.js";

export async function fetchGameMapDetails(gameMapId) {
    return await fetchAndValidate(`/api/game-maps/${gameMapId}`, "game_map_details");
}

export async function startGameSession(formData) {
    const response = await fetch("/api/lobby/session", {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}

export async function fetchGameMapFavoriteStatus(gameMapId) {
    const response = await fetch(`/api/game-maps/${gameMapId}/favorite`);
    if (!response.ok) {
        await handleResponseError(response);
    }
    const data = await response.json();
    return data.is_favorited;
}

export async function uploadGameMapCoverImage(gameMapId, file, abortSignal = null) {
    const formData = new FormData();
    formData.append("coverImage", file);

    const response = await fetch(`/api/game-maps/${gameMapId}/cover-image`, {
        method: "PUT",
        body: formData,
        signal: abortSignal
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}

export async function deleteGameMapCoverImage(gameMapId) {
    const response = await fetch(`/api/game-maps/${gameMapId}/cover-image`, {
        method: "DELETE"
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}

export async function updateGameMapDetails(gameMapId, details, abortSignal = null) {
    const formData = new FormData();

    if (details.title != undefined) {
        formData.append("title", details.title);
    }

    if (details.description != undefined) {
        formData.append("description", details.description);
    }

    const response = await fetch(`/api/game-maps/${gameMapId}`, {
        method: "PUT",
        body: formData,
        signal: abortSignal
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}

export async function fetchGameMapComments(gameMapId, page = 1, signal = null) {
    return await fetchAndValidate(`/api/game-maps/${gameMapId}/comments?page=${page}`, undefined, signal);
}

export async function postGameMapComment(gameMapId, formData, abortSignal = null) {
    const response = await fetch(`/api/game-maps/${gameMapId}/my-comment`, {
        method: "POST",
        body: formData,
        signal: abortSignal
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}

export async function fetchUserComment(gameMapId, abortSignal = null) {
    return await fetchAndValidate(`/api/game-maps/${gameMapId}/my-comment`, undefined, abortSignal);
}

export async function updateUserComment(gameMapId, formData, abortSignal = null) {
    const response = await fetch(`/api/game-maps/${gameMapId}/my-comment`, {
        method: "PUT",
        body: formData,
        signal: abortSignal
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}

export async function deleteUserComment(gameMapId, abortSignal = null) {
    const response = await fetch(`/api/game-maps/${gameMapId}/my-comment`, {
        method: "DELETE",
        signal: abortSignal
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}

export async function deleteGameMap(gameMapId, abortSignal = null) {
    const response = await fetch(`/api/game-maps/${gameMapId}`, {
        method: "DELETE",
        signal: abortSignal
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}
