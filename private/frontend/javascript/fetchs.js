//GET fetchings

export async function osszesUser() {
    let response = await fetch("/api/admin/users");
    let data = await response.json();
    return data;
}

export async function getUser(id) {
    let response = await fetch(`/api/admin/user?id=${id}`);
    let data = await response.json();
    return data.users[0];
}

export async function sortedUser() {
    let kereso = document.getElementById('keresoInput').value;
    let selectOption = document.getElementById('keresoSelect').value;
    let selectedStatus = document.querySelector('input[name="sort1"]:checked').id;
    let selectedRoles = Array.from(
        document.querySelectorAll('input[name="sort2"]:checked')
    ).map(cb => cb.id);
    let response = await fetch("/api/admin/sortedUsers", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mireKeresek: selectOption,
            mit: kereso,
            status: selectedStatus,
            adminChecked: selectedRoles.includes("roleAdmin"),
            modChecked: selectedRoles.includes("roleModerator"),
            userChecked: selectedRoles.includes("roleUser")
        })
    });
    let data = await response.json();
    return data;
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

export async function getLogs() {
    try {
        let response = await fetch("/api/admin/getLogs");
        let data = await response.json();
        return data;
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