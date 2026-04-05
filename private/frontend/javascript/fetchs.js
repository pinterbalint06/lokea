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
    let roles = params.selectedRoles || [];
    try {
        let response = await fetch("/api/admin/sortedUsers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mireKeresek: params.mireKeresek,
                mit: params.mit,
                status: params.status,
                adminChecked: params.adminChecked,
                modChecked: params.modChecked,
                userChecked: params.userChecked
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
        console.log("Hálózati vagy szerver hiba");
    }
}

export async function userUpdate(user_id, username, email, role, is_2fa) {
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
        console.log("Hálózati vagy szerver hiba");
    }
}

export async function userSelfUpdate(username, email, is_2fa) {
    try {
        let response = await fetch("/api/admin/userSelfUpdate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                is_2fa
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
        let response = await fetch("/api/updatePassword", {
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

export async function uploadProfilePic(picture, id = -1) {
    let fd = new FormData();
    let link = "/api/admin/updateProfilePicFromAdmin";
    fd.append("profilePic", picture);
    if (id == -1) {
        link = "/api/updateProfilePic";
        fd.append("user_id", id);
    }
    try {
        let response = await fetch(link, {
            method: "POST",
            body: fd
        });

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

//delete fetchings

export async function deleteProfile() {
    try {
        let response = await fetch("/api/inactiveUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let data = await response.json();
        if (data.success) {
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
        else {
            console.error("baj a törlésben, baj: " + data.error);
        }

    } catch (error) {
        console.error(`hálózati hiba: ${error}`);
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

export async function deleteProfilePicture(id = -1) {
    let link = (id = -1) ? "/api/admin/deleteProfilePicFromAdmin" : "/api/deleteProfilePic";
    try {
        let response = await fetch(link, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
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