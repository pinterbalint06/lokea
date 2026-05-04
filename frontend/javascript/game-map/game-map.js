import { AppStore } from "./shared/AppStore.js";
import { EventBus, EVENTS } from "./shared/EventBus.js";
import { getGameMapIdFromUrl } from "./shared/utils.js";
import { LeaderboardManager } from "./managers/LeaderboardManager.js";
import { DetailsManager } from "./managers/DetailsManager.js";
import { EditManager } from "./managers/EditManager.js";
import { ToastManager } from "./managers/ToastManager.js";
import { DataManager } from "./managers/DataManager.js";
import { CoverImageManager } from "./managers/CoverImageManager.js";
import { ModalManager } from "./managers/ModalManager.js";
import { CommentManager } from "./managers/CommentManager.js";
import { GameStartManager } from "./managers/GameStartManager.js";
import { translatePage, nyelvSzinkronizalas } from "../libs/i18next/translation.js";
import i18next from "../libs/language/i18next.js";

async function init() {
    try {
        await nyelvSzinkronizalas() || 'hu';
        translatePage();
    } catch (error) {
        console.error(i18next.t("game-maps:choosing.errors.languageLoad", { defaultValue: "Hiba a nyelvi adatok betöltésekor:" }), error);
    }
    const eventBus = new EventBus();
    const gameMapId = getGameMapIdFromUrl();
    const appStore = new AppStore(eventBus, gameMapId);
    let editManager = null;

    new ToastManager(eventBus);

    new CoverImageManager(eventBus, appStore);
    new DetailsManager(eventBus);
    new LeaderboardManager(eventBus, appStore);
    new ModalManager(eventBus, appStore);
    new DataManager(eventBus, appStore);
    new CommentManager(eventBus, appStore);
    new GameStartManager(eventBus, appStore);

    eventBus.on(EVENTS.STATE_UPDATED, ({ state }) => {
        if (!editManager && state.gameMapDetails.isOwner) {
            editManager = new EditManager(eventBus, appStore);
        }
    });

    eventBus.emit(EVENTS.APP_INIT, { gameMapId });
}

document.addEventListener("DOMContentLoaded", init);
