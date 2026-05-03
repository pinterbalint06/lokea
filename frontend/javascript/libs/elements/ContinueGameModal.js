const DEFAULT_CONTINUE_GAME_TITLE = "Van egy elindított játékod";
const DEFAULT_CONTINUE_GAME_DESCRIPTION = "Szeretnéd folytatni az elkezdett játékodat? Ha nem folytatod, akkor többet nem tudos folytatni.";

export class ContinueGameModal {
    constructor(container = document.body) {
        this.container = container;
        this.overlay = null;
        this.descriptionElement = null;
        this.continueButton = null;
        this.dismissButton = null;
    }

    show(gameTitle, onContinue, onDismiss) {
        this.#ensureModal();

        const description = gameTitle
            ? `Van egy futó játékod ezen a pályán: ${gameTitle}. Szeretnéd folytatni?`
            : DEFAULT_CONTINUE_GAME_DESCRIPTION;

        this.overlay.querySelector("h3").innerText = DEFAULT_CONTINUE_GAME_TITLE;
        this.descriptionElement.innerText = description;

        this.continueButton.onclick = async () => {
            this.hide();
            await onContinue();
        };

        this.dismissButton.onclick = async () => {
            this.hide();
            await onDismiss();
        };

        this.overlay.classList.add("active");
    }

    hide() {
        if (this.overlay) this.overlay.classList.remove("active");
    }

    #ensureModal() {
        if (!this.overlay) {
            this.overlay = document.createElement("div");
            this.overlay.id = "continueGameModal";
            this.overlay.classList.add("modal-overlay");

            const modalBox = document.createElement("div");
            modalBox.classList.add("modal-box", "uveg");

            const titleElement = document.createElement("h3");
            titleElement.innerText = DEFAULT_CONTINUE_GAME_TITLE;

            this.descriptionElement = document.createElement("p");
            this.descriptionElement.innerText = DEFAULT_CONTINUE_GAME_DESCRIPTION;

            const buttonRow = document.createElement("div");
            buttonRow.classList.add("d-flex", "justify-content-center", "gap-3", "flex-wrap", "mt-3");

            this.continueButton = document.createElement("button");
            this.continueButton.type = "button";
            this.continueButton.classList.add("btn", "uvegbutton", "rounded-pill", "px-4");
            this.continueButton.innerText = "Folytatás";

            this.dismissButton = document.createElement("button");
            this.dismissButton.type = "button";
            this.dismissButton.classList.add("btn", "btn-outline-secondary", "rounded-pill", "px-4");
            this.dismissButton.innerText = "Játék befejezése";

            buttonRow.append(this.continueButton, this.dismissButton);
            modalBox.append(titleElement, this.descriptionElement, buttonRow);
            this.overlay.appendChild(modalBox);
            this.container.appendChild(this.overlay);
        }
    }
}
