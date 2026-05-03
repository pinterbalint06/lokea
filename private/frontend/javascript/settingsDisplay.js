import { getUserData, deleteProfile, deleteProfilePicture, uploadProfilePic, userSelfUpdate, updatePassword, updateDarkMode, getProfilePicture, updateAdminSettings, updateLanguage } from "./fetchs.js";
import { createHTMLelement, inputGeneral, gombGeneral, labelGeneral, makeSubtitle, createPreview, createSection, showAlert } from "./utils/domUtils.js";
import { validalvaUsername, validalvaEmail, validalvaJelszo, wrongInput } from "/javascript/libs/utils/validations.js";
import i18next from "./utils/i18next.js";

export async function settingsDisplayre(adminSettings) {
    let hova = document.getElementById('content');
    hova.innerHTML = "";

    tempPfp = null;
    let deleteLast = false;
    let data = await getUserData();
    currentSettings = {
        username: data.username,
        email: data.email
    }

    let container = createHTMLelement('div', ['container', 'p-4']);

    let accordion = createHTMLelement('div', ['accordion'], null, 'settingsAccordion');

    let personalSec = createSection('personal', i18next.t('admin:settings.personal_settings'), true);
    let saveAllBtn = gombGeneral("button", i18next.t('admin:settings.save_settings'), null, "green", null, ['w-100', 'mt-4', 'py-3', 'fw-bold']);
    saveAllBtn.addEventListener("click", async function () {
        try {
            await checkModification();
            if (tempPfp != null) {
                await uploadProfilePic(tempPfp);
                let dropdownPfp = document.getElementById('dropdownPfp');
                if (dropdownPfp) {
                    dropdownPfp.src = await createPreview(tempPfp);
                }
            } else {
                if (deleteLast) {
                    await deleteProfilePicture();
                    let dropdownPfp = document.getElementById('dropdownPfp');
                    if (dropdownPfp) {
                        dropdownPfp.src = "../images/default.png";
                    }
                }
            }
            showAlert(i18next.t('admin:settings.settings_saved'), 'success');
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });

    let uiSec = createSection('ui', i18next.t('admin:settings.ui_settings'));

    let row = createHTMLelement('div', ['row']);

    let pfpCol = createHTMLelement('div', ["col-12", "col-md-4", "d-flex", "flex-column", "align-items-center"]);

    let dropzone = createHTMLelement('div', ["dropzone"]);
    dropzone.addEventListener("dragover", function (e) {
        e.preventDefault();
    });

    dropzone.addEventListener("drop", function (e) {
        e.preventDefault();

        let file = e.dataTransfer.files[0];
        tempPfp = file;
        let reader = new FileReader();
        reader.onload = function (ev) {
            pfp.src = ev.target.result;
        }
        reader.readAsDataURL(file);
    });

    let pfp = createHTMLelement('img', ["img-fluid", "img-thumbnail", "settingsPfp"]);
    if (data.filepath == null) {
        pfp.src = "../images/default.png";
    } else {
        objectURL = await getProfilePicture(data.user_id);
        pfp.src = objectURL;
    }

    let newPfpInput = inputGeneral("file", null, null, "newPfpInput", ["form-control", "d-none"], false);
    newPfpInput.setAttribute("accept", "image/*");
    newPfpInput.addEventListener("change", async function () {
        if (this.files.length != 0) {
            let file = this.files[0];
            tempPfp = file;
            pfp.src = await createPreview(file);
        }
    });

    dropzone.appendChild(pfp);
    dropzone.appendChild(newPfpInput);
    dropzone.addEventListener("click", () => newPfpInput.click());
    pfpCol.appendChild(dropzone);

    if (data.filepath != null) {
        let deletePfpButton = gombGeneral("button", i18next.t('admin:settings.delete_profile_picture'), "trash-2", "red", null);
        deletePfpButton.addEventListener("click", () => {
            pfp.src = "../images/default.png";
            deleteLast = true;
        });
        pfpCol.appendChild(deletePfpButton);
    }

    let dataCol = createHTMLelement('div', ["col-12", "col-md-8"]);

    let date = new Date(data.created_at);
    dataCol.appendChild(makeSubtitle(i18next.t('admin:settings.registered') + date.toLocaleString("hu-HU")));
    dataCol.appendChild(makeSubtitle(i18next.t('admin:settings.username')));
    dataCol.appendChild(inputGeneral("text", "username", data.username, "usernameInput", ["form-control"], false));
    dataCol.appendChild(makeSubtitle(i18next.t('admin:settings.email_address')));
    dataCol.appendChild(inputGeneral("text", "email", data.email, "emailInput", ["form-control"], false));
    dataCol.appendChild(makeSubtitle(i18next.t('admin:settings.security')));

    let buttonsDiv = createHTMLelement('div', ["d-flex", "gap-2", "my-3"]);

    let changePassBtn = gombGeneral("button", i18next.t('admin:settings.change_password'), null, null, null, ["btn", "btn-purple", "rounded-pill"]);
    changePassBtn.setAttribute('data-bs-toggle', 'collapse');
    changePassBtn.setAttribute('data-bs-target', '#passwordCollapse');

    let deleteProfileBtn = gombGeneral("button", i18next.t('admin:settings.delete_account'), null, "red", null);
    deleteProfileBtn.addEventListener("click", async function () {
        if (await deleteProfile()) {
            window.location.href = "/main";
        }
    });

    let collapseDiv = createHTMLelement('div', ['collapse'], null, 'passwordCollapse');

    let innerCard = createHTMLelement('div', ["d-flex", "flex-column", "border", "rounded", "p-3", "bg-light"]);

    let passGroup1 = createHTMLelement('div', ['mb-2']);
    passGroup1.appendChild(labelGeneral('oldPassword', i18next.t('admin:settings.old_password')));
    passGroup1.appendChild(inputGeneral('password', null, null, 'oldPassword', ["form-control"], false));

    let passGroup2 = createHTMLelement('div', ['mb-2']);
    passGroup2.appendChild(labelGeneral('newPassword', i18next.t('admin:settings.new_password')));
    passGroup2.appendChild(inputGeneral('password', null, null, 'newPassword', ["form-control"], false));

    let savePassBtn = gombGeneral('button', i18next.t('admin:settings.save'), null, "green", null, ["btn-sm"]);
    savePassBtn.onclick = jelszoValtoztat;

    innerCard.appendChild(passGroup1);
    innerCard.appendChild(passGroup2);
    innerCard.appendChild(savePassBtn);
    collapseDiv.appendChild(innerCard);

    buttonsDiv.appendChild(changePassBtn);
    buttonsDiv.appendChild(deleteProfileBtn);
    dataCol.appendChild(buttonsDiv);
    dataCol.appendChild(collapseDiv);

    row.appendChild(pfpCol);
    row.appendChild(dataCol);
    personalSec.body.appendChild(row);
    personalSec.body.appendChild(saveAllBtn);

    uiSec.body.appendChild(makeSubtitle(i18next.t('admin:settings.select_language')));
    let langSelect = document.createElement('select');
    langSelect.id = 'languageSelect';
    langSelect.classList.add('form-select', 'mb-3');
    let optHu = new Option(i18next.t('admin:settings.hungarian'), "hu");
    let optEn = new Option(i18next.t('admin:settings.english'), "en");
    langSelect.add(optHu);
    langSelect.add(optEn);
    langSelect.value = i18next.resolvedLanguage;
    langSelect.addEventListener("change", async function () {
        let updatedLang = await updateLanguage(this.value);
        if (updatedLang) {
            await i18next.changeLanguage(updatedLang);
            settingsDisplayre(adminSettings);
        }
    });
    uiSec.body.appendChild(langSelect);

    uiSec.body.appendChild(makeSubtitle(i18next.t('admin:settings.dark_mode')));
    let darkSwitchDiv = createHTMLelement('div', ['form-check', 'form-switch']);
    let darkInput = inputGeneral("checkbox", null, null, "darkMode", ["form-check-input"], false);
    darkInput.checked = (data.darkmode == 1);
    darkInput.onclick = async function () {
        await updateDarkMode(this.checked);
        showAlert(i18next.t('admin:settings.modification_success'), 'success');
    };
    let darkLabel = document.createElement('label');
    darkLabel.innerText = i18next.t('admin:settings.enable_dark_mode');
    darkSwitchDiv.appendChild(darkInput);
    darkSwitchDiv.appendChild(darkLabel);
    uiSec.body.appendChild(darkSwitchDiv);

    let adminSec = createSection('admin', i18next.t('admin:settings.admin_settings'));

    adminSec.body.appendChild(makeSubtitle(i18next.t('admin:settings.admin_darkmode')));
    let adminDarkDiv = createHTMLelement('div', ['form-check', 'form-switch', 'mb-3']);
    let adminDarkInput = inputGeneral("checkbox", null, null, "adminDarkMode", ["form-check-input"], false);

    adminDarkInput.checked = (adminSettings.darkmode == 1);

    let adminDarkLabel = document.createElement('label');
    adminDarkLabel.innerText = i18next.t('admin:settings.enable_admin_dark_mode');
    adminDarkDiv.appendChild(adminDarkInput);
    adminDarkDiv.appendChild(adminDarkLabel);
    adminSec.body.appendChild(adminDarkDiv);

    adminSec.body.appendChild(makeSubtitle(i18next.t('admin:settings.default_stats_view')));
    let chartSelect = document.createElement('select');
    chartSelect.id = 'adminChartSelect';
    chartSelect.classList.add('form-select', 'mb-3');

    chartSelect.add(new Option(i18next.t('admin:settings.daily_activity'), "activity-day"));
    chartSelect.add(new Option(i18next.t('admin:settings.weekly_activity'), "activity-week"));
    chartSelect.add(new Option(i18next.t('admin:settings.weekly_registrations'), "registrations"));
    chartSelect.add(new Option(i18next.t('admin:settings.weekly_matches'), "matches"));

    chartSelect.value = adminSettings.selectedChart || "activity-week";
    adminSec.body.appendChild(chartSelect);

    let adminSaveBtn = gombGeneral("button", i18next.t('admin:settings.save_admin_settings'), null, "green", null, ['w-100']);
    adminSaveBtn.addEventListener("click", async function () {
        const isDark = adminDarkInput.checked ? 1 : 0;
        const chartVal = chartSelect.value === "" ? null : chartSelect.value;

        try {
            await updateAdminSettings(isDark, chartVal);
            showAlert(i18next.t('admin:settings.admin_settings_saved'), 'success');
            document.body.dataset.bsTheme = (adminDarkInput.checked) ? 'dark' : 'light';
            adminSettings.darkmode = adminDarkInput.checked ? 1 : 0;
            adminSettings.selectedChart = chartSelect.value;
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });
    adminSec.body.appendChild(adminSaveBtn);

    accordion.appendChild(personalSec.item);
    accordion.appendChild(uiSec.item);
    accordion.appendChild(adminSec.item);
    container.appendChild(accordion);

    hova.appendChild(container);
}

async function checkModification() {
    let valtozas = false;
    let inInput = {
        username: document.getElementById('usernameInput').value,
        email: document.getElementById('emailInput').value
    }
    Object.keys(inInput).forEach(key => {
        if (inInput[key] == currentSettings[key]) {
            inInput[key] = null;
        }
        else {
            valtozas = true;
        }
    });
    if (valtozas) {
        let siker = true;
        if (inInput.username != null && !validalvaUsername(inInput.username)) {
            wrongInput(document.getElementById('usernameInput'));
            siker = false;
        }
        if (inInput.email != null && !validalvaEmail(inInput.email)) {
            wrongInput(document.getElementById('emailInput'));
            siker = false;
        }
        if (siker) {
            await saveModification(inInput.username, inInput.email);
        }
        else {
            throw new Error(i18next.t('admin:users.validation_required') || "Kérlek, javítsd a pirossal jelölt mezőket!");
        }
    }
}

async function saveModification(username, email) {
    await userSelfUpdate(username, email);
}

async function jelszoValtoztat() {
    let passwordCollapse = document.getElementById('passwordCollapse');
    let oldPass = document.getElementById('oldPassword');
    let newPass = document.getElementById('newPassword');
    if (oldPass.value == newPass.value) {
        showAlert(i18next.t('admin:settings.password_same_error'), 'danger');
    }
    else {
        if (validalvaJelszo(newPass.value)) {
            try {
                await updatePassword(oldPass.value, newPass.value);
                showAlert(i18next.t('admin:settings.password_change_success'), 'success');
                let bsCollapse = bootstrap.Collapse.getInstance(passwordCollapse) || new bootstrap.Collapse(passwordCollapse);
                if (bsCollapse) bsCollapse.hide();
                oldPass.value = '';
                newPass.value = '';
            } catch (error) {
                showAlert(`Hiba! ${error.message}`, 'danger');
            }
        }
        else {
            showAlert(i18next.t('admin:settings.password_requirements_error'), 'danger');
        }
    }
}

let settingsModal;
let currentSettings;
let objectURL;
let tempPfp;