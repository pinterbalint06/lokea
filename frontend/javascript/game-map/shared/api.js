import { fetchAndValidate } from "../../libs/network/fetch.js";

export async function fetchGameMapDetails(gameMapId) {
    return await fetchAndValidate(`/api/game-maps/${gameMapId}`, "game_map_details");
}
