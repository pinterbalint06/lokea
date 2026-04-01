//GET fetchings

export async function osszesUser() {
    try {
        let response = await fetch("/api/admin/users");
        let data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }

}

export async function getUser(id) {
    try {
        let response = await fetch(`/api/admin/user?id=${id}`);
        let data = await response.json();
        return data.users[0];
    } catch (error) {
        throw error;
    }
}

export async function sortedUser(params) {
    let roles = params.selectedRoles || [];
    try {
        let response = await fetch("/api/admin/sortedUsers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mireKeresek: params.selectOption,
                mit: params.kereso,
                status: params.selectedStatus,
                adminChecked: roles.includes("roleAdmin"),
                modChecked: roles.includes("roleModerator"),
                userChecked: roles.includes("roleUser")
            })
        });
        let data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

//TODO - atirni usersDisplay.jsbe

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

export async function newUser(username, email, password, role, is_2fa) {
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
                role,
                is_2fa
            })
        });

        let data = await response.json();
        console.log(data.message);

    } catch (error) {
        console.log("Hálózati vagy szerver hiba:");
    }
}

export async function userUpdate(user_id, username, email, role, is_2fa, deleted) {
    try {
        let response = await fetch("/api/admin/updateUserFromAdmin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id,
                username,
                email,
                role,
                is_2fa
            })
        });
        return response.ok;
    } catch (error) {
        console.log("Hálózati vagy szerver hiba:");
    }
}

export async function userToInactive(id, role, deleted) {
    let mitadokvissza;
    try {
        let response = await fetch("/api/admin/userToInactive", {
            method: "POST",
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

export async function uploadProfilePic(picture, id) {
    let fd = new FormData();
    fd.append("profilePic", picture);
    fd.append("user_id", id);
    try {
        let response = await fetch("/api/admin/updateProfilePicFromAdmin", {
            method: "POST",
            body: fd
        });

        if (response.ok) {
            console.log("sikerult a feltoltes");
        }
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

export async function deleteProfilePicture(id) {
    try {
        let response = await fetch("/api/admin/deleteProfilePicFromAdmin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: id
            })
        });

        if (response.ok) {
            console.log("sikerult a torles");
        }
    } catch (error) {
        console.log(`hálózati hiba: ${error}`);
    }
}

export async function sortedLogs(variables) {
    let { username, periodFrom, periodTo, roles, activities, page } = variables;
    try {
        let response = await fetch("/api/admin/sortedLogs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                periodFrom,
                periodTo,
                roles,
                activities,
                page: page || 1
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        let data = await response.json();
        return { logs: data.logs, total: data.total } || [];
    } catch (error) {
        console.error("Fetch error:", error.message);
        return [];
    }
}