import { translatePage, nyelvSzinkronizalas } from "../libs/i18next/translation.js";
import i18next from "../libs/language/i18next.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await nyelvSzinkronizalas() || 'hu';
        translatePage();
    } catch (error) {
        console.error(i18next.t("error-page:languageLoadError", { defaultValue: "Hiba a nyelvi adatok betöltésekor:" }), error);
    }

    const backBtn = document.getElementById("backBtn");

    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.history.back();
        });
    }
});
