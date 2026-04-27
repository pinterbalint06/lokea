import i18next, { initI18next } from "./utils/i18next.js";

function extractError(data) {
    if (data.error) return data.error;
    if (data.errors && data.errors.length > 0) return data.errors[0].msg;
    if (data.message) return data.message;
    return "Ismeretlen hiba történt / Unknown error";
}

//GET fetchings

export async function nyelvSzinkronizalas() {
    let response = await fetch('/api/admin/getLanguage');
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    await initI18next(data.language);
    return data.language;
}

export async function osszesUser() {
    let response = await fetch("/api/admin/getUsers");
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return { users: data.users, total: data.total };
}

export async function getUser(id) {
    let response = await fetch(`/api/admin/getUser?id=${id}`);
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data.users[0];
}

export async function getUserData() {
    let response = await fetch('/api/getUserData');
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data.users;
}

export async function sortedUser(params) {
    const queryParams = new URLSearchParams({
        mireKeresek: params.mireKeresek,
        mit: params.mit,
        status: params.status,
        adminChecked: params.adminChecked,
        modChecked: params.modChecked,
        userChecked: params.userChecked,
        page: params.page
    }).toString();

    let response = await fetch(`/api/admin/sortedUsers?${queryParams}`);
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return { users: data.users, total: data.total };
}

export async function getProfilePicture(route) {
    let response = await fetch(`/api/getProfilePic?route=${route}`);
    if (!response.ok) {
        let data = await response.json().catch(() => ({}));
        throw new Error(extractError(data));
    }
    let blob = await response.blob();
    return URL.createObjectURL(blob);
}

export async function getDashboardInfo() {
    let response = await fetch("/api/admin/getDashboardInfo");
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data;
}

export async function getLogs() {
    let response = await fetch("/api/admin/getLogs");
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return { logs: data.logs, total: data.total };
}

//POST fetchings

export async function kijelentkezes() {
    let response = await fetch("/api/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    let data = await response.json();
    if (!response.ok || !data.success) throw new Error(extractError(data));
    window.location.href = '/login_page';
}

export async function newUser(username, email, password, role) {
    let response = await fetch("/api/admin/signupFromAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role })
    });
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data;
}

export async function userUpdate(user_id, username, email, role) {
    let response = await fetch("/api/admin/updateUserFromAdmin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, username, email, role })
    });
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return response.ok;
}

export async function userSelfUpdate(username, email) {
    let response = await fetch("/api/admin/userSelfUpdate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email })
    });
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data;
}

export async function updatePassword(oldPass, newPass) {
    let response = await fetch("/api/updatePassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPass: oldPass, newPass: newPass })
    });
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data;
}

export async function updateDarkMode(is_dark) {
    let response = await fetch("/api/admin/userDarkMode", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ darkmode: is_dark })
    });
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data;
}

export async function updateLanguage(language) {
    let response = await fetch("/api/admin/updateLanguage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language })
    });
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data.language;
}

export async function getAdminSettings() {
    let response = await fetch("/api/admin/getAdminSettings");
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return { darkmode: data.darkmode, selectedChart: data.selectedChart };
}

export async function updateAdminSettings(darkmode, selected_chart) {
    let response = await fetch("/api/admin/updateAdminSettings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            darkmode: darkmode,
            selected_chart: selected_chart === "" ? null : selected_chart
        })
    });
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data;
}

export async function uploadProfilePic(picture, id = -1) {
    let fd = new FormData();
    let link = "/api/admin/updateProfilePicFromAdmin";
    fd.append("profilePic", picture);
    if (id == -1) link = "/api/updateProfilePic";
    else fd.append("user_id", id);

    let response = await fetch(link, { method: "PUT", body: fd });
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data;
}

export async function exportUsers(filters) {
    const response = await fetch('/api/admin/exportUsers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
    });
    if (!response.ok) {
        let data = await response.json().catch(() => ({}));
        throw new Error(extractError(data));
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

export async function sortedLogs(variables) {
    let { username, periodFrom, periodTo, roles, activities, page } = variables;
    const queryParams = new URLSearchParams();
    if (username) queryParams.append('username', username);
    if (periodFrom) queryParams.append('periodFrom', periodFrom);
    if (periodTo) queryParams.append('periodTo', periodTo);
    queryParams.append('page', page || 1);

    if (Array.isArray(roles)) {
        roles.forEach(role => queryParams.append('roles', role));
    }
    if (Array.isArray(activities)) {
        activities.forEach(act => queryParams.append('activities', act));
    }

    let response = await fetch(`/api/admin/sortedLogs?${queryParams.toString()}`);
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return { logs: data.logs, total: data.total };
}

export async function exportLogs(filters) {
    const response = await fetch('/api/admin/exportLogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
    });
    if (!response.ok) {
        let data = await response.json().catch(() => ({}));
        throw new Error(extractError(data));
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `logs_export_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

//delete fetchings

export async function deleteProfile() {
    let response = await fetch("/api/inactiveUser", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
    let data = await response.json();
    if (!response.ok || !data.success) throw new Error(extractError(data));
    return data.success;
}

export async function userToInactive(id, role, deleted) {
    let response = await fetch("/api/admin/userToInactive", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, role, deleted })
    });
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data.message;
}

export async function deleteProfilePicture(id = -1) {
    let link = (id !== -1) ? "/api/admin/deleteProfilePicFromAdmin" : "/api/deleteProfilePic";
    let response = await fetch(link, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id })
    });
    let data = await response.json();
    if (!response.ok) throw new Error(extractError(data));
    return data;
}