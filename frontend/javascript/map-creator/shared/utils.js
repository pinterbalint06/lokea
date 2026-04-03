import { CONSTANTS } from "./constants.js";

export function createSpinnerIcon() {
    const div = document.createElement("div");
    div.className = "spinner-border spinner-border-sm";
    return div;
}

export async function readImageFile(file) {
    let url = URL.createObjectURL(file);
    let imageBitmap;
    try {
        imageBitmap = await createImageBitmap(file);
        let returnObject = {
            url: url,
            width: imageBitmap.width,
            height: imageBitmap.height
        }
        imageBitmap.close();
        return returnObject;
    } catch (error) {
        URL.revokeObjectURL(url);
        if (imageBitmap) {
            imageBitmap.close();
        }
        throw error;
    }
}

export async function processUploadedImageFile(file) {
    if (file.size > CONSTANTS.MAX_FILE_SIZE) {
        throw new Error("Túl nagy fájlméret! (Max 10MB)");
    }
    if (!file.type.startsWith("image/")) {
        throw new Error("Csak kép elfogadott!");
    }
    return await readImageFile(file);
}

export function showToast(container, message, type = "", isClosable, options = {}, iconNode = null, onClosed = () => { }) {
    // Create element
    let toastElement = document.createElement("div");
    let typeClass;
    switch (type) {
        case "success":
            typeClass = "successColor";
            break;
        case "danger":
            typeClass = "dangerColor";
            break;
        default:
            typeClass = "uveg";
            break;
    }
    toastElement.classList.add("toast", "align-items-center", "border-0", typeClass);
    toastElement.setAttribute("role", "alert");
    toastElement.setAttribute("aria-live", "assertive");
    toastElement.setAttribute("aria-atomic", "true");

    let toastDiv = document.createElement("div");
    toastDiv.classList.add("d-flex");

    let toastBody = document.createElement("div");
    toastBody.classList.add("toast-body", "d-flex", "align-items-center");

    if (iconNode) {
        toastBody.appendChild(iconNode);
    }

    let messageP = document.createElement("p");
    messageP.classList.add("my-0", "ms-2", "p-0");
    messageP.innerText = message;
    toastBody.appendChild(messageP);

    toastDiv.appendChild(toastBody);

    toastElement.appendChild(toastDiv);

    if (isClosable) {
        let closeButton = document.createElement("button");
        closeButton.setAttribute("type", "button");
        closeButton.setAttribute("data-bs-dismiss", "toast");
        closeButton.setAttribute("aria-label", "Close");
        closeButton.classList.add("btn-close", "btn-close-white", "me-2", "m-auto");
        toastDiv.appendChild(closeButton);
    }

    toastElement.appendChild(toastDiv);

    container.prepend(toastElement);

    let toast = new bootstrap.Toast(toastElement, options);
    toast.show();

    toastElement.addEventListener("hidden.bs.toast", () => {
        onClosed();
        toast.dispose();
        toastElement.remove();
    });
    return toast;
}

export function savePreviousValue(event) {
    event.target.dataset.previousValue = event.target.value;
}

export function getGameMapIdFromUrl() {
    let pathParts = window.location.pathname.split("/");
    let id = parseInt(pathParts[2]);
    return id;
}
