document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('signoutBtn').addEventListener("click", async function () {
        kijelentkezes();
    });
    document.getElementById('toggleSidebar').addEventListener('click', function () {
        sidebarvaltoztat();
    });
    let navlinkek = document.querySelectorAll(".nav-link[data-route]");
    navlinkek.forEach(element => {
        element.addEventListener("click", function () {
            aktivEltuntet();
            this.classList.add("active");
        })
    })

});

async function kijelentkezes() {
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

function sidebarvaltoztat() {
    let sidebar = document.getElementById('sidebar');
    let sidebardiv = document.getElementById('sidebardiv');
    let contentdisplay = document.getElementById('contentDisplay');
    let ertek = document.getElementById('toggleSidebar');

    sidebar.classList.toggle('collapsed');
    let mik = document.querySelectorAll('.sidebarElementText');
    if (sidebar.classList.contains('collapsed')) {
        mik.forEach(element => {
            element.classList.add("d-none")
        });
        sidebardiv.classList.replace("col-2", "col-1");
        contentdisplay.classList.replace("col-10", "col-11");
        ertek.value = "⇥";
        ertek.title = "Expand";
    }
    else {
        mik.forEach(element => {
            element.classList.remove("d-none");
        });
        sidebardiv.classList.replace("col-1", "col-2");
        contentdisplay.classList.replace("col-11", "col-10");
        ertek.value = "☰";
        ertek.title = "Collapse";
    }
}

function aktivEltuntet() {
    let aktivok = document.querySelectorAll('.active');
    aktivok.forEach(element => {
        element.classList.remove("active");
    })
}






