document.addEventListener("DOMContentLoaded", function () {
    // let kijelentkezGomb = document.getElementById('signoutBtn');
    // kijelentkezGomb.addEventListener("click", async function () {
    //     try {
    //         let response = await fetch("/api/signout", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             }
    //         });
    //         let data = await response.json();
    //         if (data.success) {
    //             window.location.href = '/login_page';
    //         }
    //         else {
    //             console.log("baj a kijelentkezésben, baj: " + data.error);
    //         }

    //     } catch (error) {
    //         console.log(`hálózati hiba: ${error}`);
    //     }
    // })
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        let sidebar = document.getElementById('sidebar');
        let sidebardiv = document.getElementById('sidebardiv');
        let ertek = document.getElementById('toggleSidebar');

        sidebar.classList.toggle('collapsed');
        let mik = document.querySelectorAll('.sidebarElementText');
        if (sidebar.classList.contains('collapsed')) {
            mik.forEach(element => {
                element.classList.add("d-none")
            });
            sidebardiv.classList.replace("col-2", "col-1");
            ertek.value = "⇥";
            ertek.title = "Expand";
        }
        else {
            mik.forEach(element => {
                element.classList.remove("d-none");
            });
            sidebardiv.classList.replace("col-1", "col-2");
            ertek.value = "☰";
            ertek.title = "Collapse";
        }
    });
});


