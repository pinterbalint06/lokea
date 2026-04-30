import i18next, { initI18next } from "./utils/i18next.js";
import { showAlert } from "./utils/domUtils.js";

function extractError(data) {
    let errorMessage = "Ismeretlen hiba történt / Unknown error";
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        errorMessage = data.errors.map(e => e.msg || e).join('\n');
    } else {
        if (data.error && Array.isArray(data.error) && data.error.length > 0) {
            errorMessage = data.error.map(e => e.msg || e).join('\n');
        } else {
            if (data.error) {
                errorMessage = data.error;
            } else {
                if (data.message) {
                    errorMessage = data.message;
                }
            }
        }
    }
    return errorMessage;
}

//GET fetchings

export async function nyelvSzinkronizalas() {
    try {
        let response = await fetch('/api/getLanguage');
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        await initI18next(data.language);
        return data.language;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function osszesUser() {
    try {
        let response = await fetch("/api/admin/getUsers");
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return { users: data.users, total: data.total };
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function getUser(id) {
    try {
        let response = await fetch(`/api/admin/getUser?id=${id}`);
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data.users[0];
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function getUserData() {
    try {
        let response = await fetch('/api/getUserData');
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data.users;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function sortedUser(params) {
    try {
        const queryParams = new URLSearchParams({
            mireKeresek: params.mireKeresek,
            mit: params.mit,
            status: params.status,
            adminChecked: params.adminChecked,
            modChecked: params.modChecked,
            userChecked: params.userChecked,
            lordChecked: params.lordChecked,
            page: params.page
        }).toString();

        let response = await fetch(`/api/admin/sortedUsers?${queryParams}`);
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return { users: data.users, total: data.total };
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function getProfilePicture(route) {
    try {
        let response = await fetch(`/api/getProfilePic?route=${route}`);
        if (!response.ok) {
            let data = await response.json().catch(() => ({}));
            throw new Error(extractError(data));
        }
        let blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function getDashboardInfo() {
    try {
        let response = await fetch("/api/admin/getDashboardInfo");
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function getLogs() {
    try {
        let response = await fetch("/api/admin/getLogs");
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return { logs: data.logs, total: data.total };
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

//POST fetchings

export async function kijelentkezes() {
    try {
        let response = await fetch("/api/signout", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        let data = await response.json();
        if (!response.ok || !data.success) throw new Error(extractError(data));
        window.location.href = '/login_page';
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function newUser(username, email, password, role) {
    try {
        let response = await fetch("/api/admin/signupFromAdmin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role })
        });
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function userUpdate(user_id, username, email, role) {
    try {
        let response = await fetch("/api/admin/updateUserFromAdmin", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, username, email, role })
        });
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return response.ok;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function userSelfUpdate(username, email) {
    try {
        let response = await fetch("/api/admin/userSelfUpdate", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email })
        });
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function updatePassword(oldPass, newPass) {
    try {
        let response = await fetch("/api/updatePassword", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldPass: oldPass, newPass: newPass })
        });
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function updateDarkMode(is_dark) {
    try {
        let response = await fetch("/api/admin/userDarkMode", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ darkmode: is_dark })
        });
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function updateLanguage(language) {
    try {
        let response = await fetch("/api/admin/updateLanguage", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language })
        });
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data.language;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function getAdminSettings() {
    try {
        let response = await fetch("/api/admin/getAdminSettings");
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return { darkmode: data.darkmode, selectedChart: data.selectedChart };
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function updateAdminSettings(darkmode, selected_chart) {
    try {
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
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function uploadProfilePic(picture, id = -1) {
    try {
        let fd = new FormData();
        let link = "/api/admin/updateProfilePicFromAdmin";
        fd.append("profilePic", picture);
        if (id == -1) link = "/api/updateProfilePic";
        else fd.append("user_id", id);

        let response = await fetch(link, { method: "PUT", body: fd });
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function exportUsers(filters) {
    try {
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
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function sortedLogs(variables) {
    try {
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
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function exportLogs(filters) {
    try {
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
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

//delete fetchings

export async function deleteProfile() {
    try {
        let response = await fetch("/api/inactiveUser", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        let data = await response.json();
        if (!response.ok || !data.success) throw new Error(extractError(data));
        return data.success;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function userToInactive(id, role, deleted) {
    try {
        let response = await fetch("/api/admin/userToInactive", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: id, role, deleted })
        });
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data.message;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}

export async function deleteProfilePicture(id = -1) {
    try {
        let link = (id !== -1) ? "/api/admin/deleteProfilePicFromAdmin" : "/api/deleteProfilePic";
        let response = await fetch(link, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: id })
        });
        let data = await response.json();
        if (!response.ok) throw new Error(extractError(data));
        return data;
    } catch (error) {
        showAlert(error.message);
        throw error;
    }
}