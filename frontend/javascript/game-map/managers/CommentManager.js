import { EVENTS } from "../shared/EventBus.js";
import { formatDateTime } from "../shared/utils.js";
import { createElement } from "../../libs/utils/DOMUtils.js";
import { fetchGameMapComments } from "../shared/api.js";

export class CommentManager {
    constructor(eventBus, appStore) {
        this.bus = eventBus;
        this.store = appStore;

        this.elements = {};
        this.isLoading = false;
        this.abortController = null;

        this.#gatherElements();
        this.#bindEvents();
    }

    #gatherElements() {
        this.elements.commentsList = document.getElementById("commentsList");
    }

    #bindEvents() {
        this.bus.on(EVENTS.APP_INIT, () => {
            this.#loadComments(1);
        });
    }

    async #loadComments(page) {
        if (!this.isLoading) {
            this.isLoading = true;

            if (this.abortController) {
                this.abortController.abort();
            }
            this.abortController = new AbortController();

            this.#showLoadingState();

            try {
                const gameMapId = this.store.getState().gameMapId;
                const data = await fetchGameMapComments(gameMapId, page, this.abortController.signal);
                console.log(data);

                this.#render(data.comments);
            } catch (error) {
                if (error.name != "AbortError") {
                    this.#showErrorState();
                    this.bus.emit(EVENTS.TOAST_SHOW, {
                        msg: error.message || "Hiba történt a hozzászólások betöltésekor.",
                        type: "danger"
                    });
                }
            } finally {
                this.isLoading = false;
            }
        }
    }

    #showLoadingState() {
        const spinner = createElement("div", { class: "spinner-border spinner-border-sm" });
        const text = createElement("span", { class: "ms-2" });
        text.innerText = "Hozzászólások betöltése...";

        const loadingContainer = createElement("div", { class: "text-center p-3 opacity-50" }, [spinner, text]);
        this.elements.commentsList.replaceChildren(loadingContainer);
    }

    #showErrorState() {
        const errorText = createElement("p", { class: "text-danger text-center my-4" });
        errorText.innerText = "Nem sikerült betölteni a hozzászólásokat.";
        this.elements.commentsList.replaceChildren(errorText);
    }

    #render(comments) {
        const hasComments = comments.length > 0;
        const fragment = document.createDocumentFragment();

        if (hasComments) {
            for (const comment of comments) {
                fragment.appendChild(this.#createCommentItem(comment));
            }
        } else {
            const emptyText = createElement("p", { class: "text-center opacity-50 my-4" });
            emptyText.innerText = "Még nincsenek hozzászólások.";
            fragment.appendChild(emptyText);
        }

        this.elements.commentsList.replaceChildren(fragment);
    }

    #createCommentItem(comment) {
        const author = createElement("strong");
        author.innerText = comment.username || "Ismeretlen";

        const dateSpan = createElement("span", { class: "small opacity-75" });
        dateSpan.innerText = formatDateTime(comment.created_at);

        const header = createElement("div", {
            class: "d-flex justify-content-between align-items-center gap-2 flex-wrap"
        }, [author, dateSpan]);

        const children = [header];

        const stars = createElement("div", {
            class: "rating-stars",
            style: `--rating: ${comment.rating};`
        });
        const ratingWrapper = createElement("div", { class: "mt-1" }, [stars]);
        children.push(ratingWrapper);

        const commentText = createElement("p", { class: "comment-text mb-0 mt-2" });
        commentText.innerText = comment.comment_text;
        children.push(commentText);

        return createElement("article", { class: "comment-card" }, children);
    }
}
