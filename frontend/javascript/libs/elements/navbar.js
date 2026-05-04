import { showToast } from "../utils.js";
import i18next from "../language/i18next.js";
import { createElement } from "../utils/DOMutils.js";

function buildNavbar() {
    const logoImg = createElement("img", {
        src: "/images/lokea.webp",
        alt: "Lokea logo",
        class: "navPic"
    });

    const brandLink = createElement("a", { class: "navbar-brand", href: "/" }, [logoImg]);

    const mapsLink = createElement("a", {
        class: "nav-link",
        href: "/game-maps",
        "data-i18n": "game-maps:choosing.mapsLabel"
    });
    mapsLink.textContent = "Pályák";

    const mapsItem = createElement("li", { class: "nav-item nav-item-hide-sm" }, [mapsLink]);
    const navList = createElement("ul", { class: "navbar-nav me-auto ms-3" }, [mapsItem]);

    const profilePicImg = createElement("img", {
        id: "navbarProfilePic",
        src: "/images/default.png",
        alt: "profPic",
        class: "rounded-circle border border-2 navPic"
    });

    const dropdownToggle = createElement("a", {
        href: "#",
        class: "d-block link-light text-decoration-none dropdown-toggle",
        "data-bs-toggle": "dropdown",
        "aria-expanded": "false"
    }, [profilePicImg]);

    const signOutLink = createElement("a", {
        class: "dropdown-item text-danger",
        id: "signOut",
        href: "#",
        "data-i18n": "main:dropdown.logout"
    });
    signOutLink.textContent = "Kijelentkezés";

    const signOutItem = createElement("li", {}, [signOutLink]);

    const dropdownMenu = createElement("ul", {
        class: "dropdown-menu dropdown-menu-end text-small"
    }, [signOutItem]);

    const dropdown = createElement("div", { class: "dropdown" }, [dropdownToggle, dropdownMenu]);

    const containerFluid = createElement("div", { class: "container-fluid" }, [brandLink, navList, dropdown]);

    return createElement("nav", { class: "navbar navbar-expand-lg navbar-shared" }, [containerFluid]);
}

export function mountNavbar(target = "#navbar-mount") {
    const mountPoint = typeof target === "string" ? document.querySelector(target) : target;
    if (mountPoint) {
        mountPoint.appendChild(buildNavbar());

        mountPoint.querySelectorAll(".nav-link[href]").forEach((link) => {
            const linkPath = new URL(link.getAttribute("href"), window.location.origin).pathname;
            if (window.location.pathname === linkPath || window.location.pathname.startsWith(linkPath + '/')) {
                link.setAttribute("aria-current", "page");
            }
        });

        const profilePic = mountPoint.querySelector("#navbarProfilePic");
        if (profilePic) {
            const tester = new Image();
            tester.onload = () => { profilePic.src = tester.src; };
            tester.src = "/api/users/me/profile-picture";
        }

        const dropdownToggle = mountPoint.querySelector('[data-bs-toggle="dropdown"]');
        if (dropdownToggle && window.bootstrap?.Dropdown) {
            new window.bootstrap.Dropdown(dropdownToggle, {
                popperConfig: { strategy: 'fixed' }
            });
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
                    const toastContainer = document.getElementById('toastPlace') ?? document.getElementById('toastContainer') ?? document.body;
                    showToast(toastContainer, i18next.t("main:apiMain.logout.error", { defaultValue: "A kijelentkezés nem sikerült." }), 'danger', true);
                }
            });
        }
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mountNavbar());
} else {
    mountNavbar();
}
