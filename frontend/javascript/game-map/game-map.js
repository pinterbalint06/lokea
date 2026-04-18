import { AppStore } from "./shared/AppStore.js";
import { EventBus, EVENTS } from "./shared/EventBus.js";
import { getGameMapIdFromUrl } from "./shared/utils.js";
import { LeaderboardManager } from "./managers/LeaderboardManager.js";
import { DetailsManager } from "./managers/DetailsManager.js";
import { EditManager } from "./managers/EditManager.js";
import { ToastManager } from "./managers/ToastManager.js";
import { DataManager } from "./managers/DataManager.js";

async function init() {
    const eventBus = new EventBus();
    const gameMapId = getGameMapIdFromUrl();
    const appStore = new AppStore(eventBus, gameMapId);

    new ToastManager(eventBus);

    new DetailsManager(eventBus);
    new LeaderboardManager(eventBus, appStore);
    new EditManager(eventBus, appStore);
    new DataManager(eventBus, appStore);

    eventBus.emit(EVENTS.APP_INIT, { gameMapId });
}

document.addEventListener("DOMContentLoaded", init);

// TODO: isowner elkeszitese
// TODO: cover image betoltese
// TODO: cover image szerkesztesee
// TODO: cim, leiras szerkesztese
// TODO: kommentek betoltese
// TODO: kommenteles
// TODO: komment szerkesztese
// TODO: komment torlese
