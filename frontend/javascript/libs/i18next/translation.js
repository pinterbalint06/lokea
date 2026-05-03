import i18next, { initI18next } from "../language/i18next.js";

export function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.innerText = i18next.t(key);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(element => {
        const key = element.getAttribute('data-i18n-label');
        element.dataset.label = i18next.t(key) + ':';
    });
    document.documentElement.lang = i18next.language;
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (titleKey) {
        document.title = i18next.t(titleKey);
    }
}

export async function nyelvSzinkronizalas() {
    try {
        //todo - pull request utan vissza
        // let response = await fetch('/api/users/language');
        // let data = await response.json();
        // if (!response.ok) throw new Error(data);
        await initI18next('en');
        return 'en';
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}