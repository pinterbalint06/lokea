import i18next, { initI18next } from "./utils/i18next.js";

//GET fetchings

export async function nyelvSzinkronizalas() {
    try {
        let response = await fetch('/api/admin/getLanguage');
        let data = await response.json();
        console.log(data)

        await initI18next(data.language);

        console.log("Sikeres nyelv betöltés:", data.language);
    } catch (error) {
        console.error("Nyelv hiba:", error);
    }
}

export async function osszesUser() {
    try {
        let response = await fetch("/api/admin/getUsers");
        let data = await response.json();
        return { users: data.users, total: data.total };
    } catch (error) {
        throw error;
    }

}

export async function getUser(id) {
    try {
        let response = await fetch(`/api/admin/getUser?id=${id}`);
        let data = await response.json();
        return data.users[0];
    } catch (error) {
        throw error;
    }
}

export async function getUserData() {
    try {
        let response = await fetch('/api/getUserData');
        if (response.ok) {
            let data = await response.json();
            return data.users;
        }
        else {
            throw new Error("baj");
        }
    } catch (error) {
        console.error(error);
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
            page: params.page
        }).toString();

        let response = await fetch(`/api/admin/sortedUsers?${queryParams}`);

        let data = await response.json();
        return { users: data.users, total: data.total };
    } catch (error) {
        throw error;
    }
}

export async function getProfilePicture(route) {
    try {
        let response = await fetch(`/api/getProfilePic?route=${route}`);
        let blob = await response.blob();

        let objectURL = URL.createObjectURL(blob);
        return objectURL;
    } catch (error) {
        console.log(error);
    }
}

export async function getDashboardInfo() {
    try {
        let response = await fetch("/api/admin/getDashboardInfo");
        let data = await response.json();
        return data;
    } catch (error) {
        console.error(error.message);
    }
}

export async function getLogs() {
    try {
        let response = await fetch("/api/admin/getLogs");
        let data = await response.json();
        return { logs: data.logs, total: data.total };
    } catch (error) {
        console.error(error.message);
    }
}

//POST fetchings

export async function kijelentkezes() {
    try {
        let response = await fetch("/api/signout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let data = await response.json();
        if (data.success) {
            window.location.href = '/login_page';
        }
        else {
            console.log("baj a kijelentkezésben, baj: " + data.error);
        }

    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

export async function newUser(username, email, password, role) {
    try {
        let response = await fetch("/api/admin/signupFromAdmin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password,
                role
            })
        });

        let data = await response.json();
        console.log(data.message);

    } catch (error) {
        console.log("Hálózati vagy szerver hiba");
    }
}

export async function userUpdate(user_id, username, email, role) {
    try {
        let response = await fetch("/api/admin/updateUserFromAdmin", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id,
                username,
                email,
                role
            })
        });
        return response.ok;
    } catch (error) {
        console.log("Hálózati vagy szerver hiba");
    }
}

export async function userSelfUpdate(username, email) {
    try {
        let response = await fetch("/api/admin/userSelfUpdate", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email
            })
        });
        return response;
    } catch (error) {
        console.log("Hálózati vagy szerver hiba");
    }
}

export async function updatePassword(oldPass, newPass) {
    try {
        let response = await fetch("/api/updatePassword", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                oldPass: oldPass,
                newPass: newPass
            })
        })
        return response;
    } catch (error) {
        console.log("Hálózati vagy szerver hiba");
    }
}

export async function updateDarkMode(is_dark) {
    try {
        let response = await fetch("/api/admin/userDarkMode", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                darkmode: is_dark
            })
        })
        return response;
    } catch (error) {
        console.log("Hálózati vagy szerver hiba");
    }
}

export async function updateLanguage(language) {
    let result = null;
    try {
        let response = await fetch("/api/admin/updateLanguage", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language })
        });
        let data = await response.json();

        if (response.ok) {
            console.log("Nyelv frissítve:", data.language);
            result = data.language;
        } else {
            console.error("Szerver hiba:", data.message);
        }
    } catch (error) {
        console.error("Hálózati hiba:", error);
    }

    return result;
}

export async function getAdminSettings() {
    try {
        let response = await fetch("/api/admin/getAdminSettings");
        if (!response.ok) throw new Error("Hiba a letöltésnél");
        let data = await response.json();
        return {
            darkmode: data.darkmode,
            selectedChart: data.selectedChart
        };
    } catch (error) {
        console.error(error.message);
        return { darkmode: 0, selectedChart: 'activity-week' };
    }
}

export async function updateAdminSettings(darkmode, selected_chart) {
    try {
        let response = await fetch("/api/admin/updateAdminSettings", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                darkmode: darkmode,
                selected_chart: selected_chart === "" ? null : selected_chart
            })
        });
        return response;
    } catch (error) {
        console.error("Hiba az API hívás során");
    }
}

export async function uploadProfilePic(picture, id = -1) {
    let fd = new FormData();
    let link = "/api/admin/updateProfilePicFromAdmin";
    fd.append("profilePic", picture);
    if (id == -1) {
        link = "/api/updateProfilePic";
    }
    else {
        fd.append("user_id", id);
    }
    try {
        let response = await fetch(link, {
            method: "PUT",
            body: fd
        });
        let data = await response.json();

        if (response.ok) {
            console.log(data.message);
        }
        else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
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

        if (!response.ok) throw new Error('Szerver hiba az exportáláskor');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        let a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (err) {
        console.error("Export hiba:", err);
        alert("Hiba történt az exportálás során!");
    }
}

export async function sortedLogs(variables) {
    let { username, periodFrom, periodTo, roles, activities, page } = variables;
    try {
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

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        let data = await response.json();
        return { logs: data.logs, total: data.total };
    } catch (error) {
        console.error("Fetch error:", error.message);
        return { logs: [], total: 0 };
    }
}

export async function exportLogs(filters) {
    try {
        const response = await fetch('/api/admin/exportLogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filters)
        });

        if (!response.ok) throw new Error('Szerver hiba');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        let a = document.createElement('a');
        a.href = url;
        a.download = `logs_export_${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (err) {
        console.error("Export hiba:", err);
        alert("Nem sikerült a logok exportálása!");
    }
}

//delete fetchings

export async function deleteProfile() {
    try {
        let response = await fetch("/api/inactiveUser", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let data = await response.json();
        if (data.success) {
            alert("Sikeres törlés!");
        }
        else {
            console.error("baj a törlésben, baj: " + data.error);
        }
        return data.success;
    } catch (error) {
        console.error(`hálózati hiba: ${error}`);
    }
}

export async function userToInactive(id, role, deleted) {
    let mitadokvissza;
    try {
        let response = await fetch("/api/admin/userToInactive", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: id,
                role,
                deleted
            })
        });
        if (response.status == 204) {
            mitadokvissza = "Sikerült a törlés";
        }
        else {
            mitadokvissza = (await response.json()).message;
        }
    } catch (error) {
        console.error(error);
        mitadokvissza = "Baj";
    }
    return mitadokvissza;
}

export async function deleteProfilePicture(id = -1) {
    let link = (id !== -1) ? "/api/admin/deleteProfilePicFromAdmin" : "/api/deleteProfilePic";

    try {
        let response = await fetch(link, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user_id: id })
        });

        let data = await response.json();

        if (response.ok) {
            console.log(data.message);
            return data;
        } else {
            throw new Error(data.message || "Hiba a törlés során");
        }
    } catch (error) {
        console.error(`Hálózati hiba: ${error.message}`);
        throw error;
    }
}