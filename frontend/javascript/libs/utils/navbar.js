const NAVBAR_CSS_HREF = "/css/navbar.css";

const NAVBAR_HTML = `
<nav class="navbar navbar-expand-lg navbar-shared">
    <div class="container-fluid">
        <a class="navbar-brand" href="/">
            <img src="/images/lokea.webp" alt="Lokea logo" class="navPic">
        </a>
        <ul class="navbar-nav me-auto ms-3">
            <li class="nav-item nav-item-hide-sm">
                <a class="nav-link" href="/game-maps">Pályák</a>
            </li>
        </ul>
        <div class="dropdown">
            <a href="#" class="d-block link-light text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <img id="navbarProfilePic" src="/images/default.png" alt="profPic" class="rounded-circle border border-2 navPic">
            </a>
            <ul class="dropdown-menu dropdown-menu-end text-small">
                <li><a class="dropdown-item text-danger" id="signOut" href="#">Sign out</a></li>
            </ul>
        </div>
    </div>
</nav>
`;

function ensureNavbarCSS() {
    if (document.querySelector(`link[data-navbar-shared]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = NAVBAR_CSS_HREF;
    link.dataset.navbarShared = "true";
    document.head.appendChild(link);
}

export function mountNavbar(target = "#navbar-mount") {
    const mountPoint = typeof target === "string" ? document.querySelector(target) : target;
    if (!mountPoint) return;

    ensureNavbarCSS();
    mountPoint.innerHTML = NAVBAR_HTML;

    mountPoint.querySelectorAll(".nav-link[href]").forEach((link) => {
        const linkPath = new URL(link.getAttribute("href"), window.location.origin).pathname;
        if (linkPath === window.location.pathname) {
            link.setAttribute("aria-current", "page");
        }
    });

    const profilePic = mountPoint.querySelector("#navbarProfilePic");
    if (profilePic) {
        const tester = new Image();
        tester.onload = () => { profilePic.src = tester.src; };
        tester.src = "/api/users/me/profile-picture";
    }

    const signOutBtn = mountPoint.querySelector("#signOut");
    if (signOutBtn) {
        signOutBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            try {
                const response = await fetch("/api/auth/logout", { method: "DELETE" });
                if (!response.ok) throw new Error();
                window.location.href = "/";
            } catch {
                throw new Error("Failed to sign out");
            }
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountNavbar());
} else {
    mountNavbar();
}
