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

        this.currentPage = 0;
        this.totalPages = 0;
        this.totalCommentCount = null;
        this.observer = null;
        this.sentinel = null;

        this.#gatherElements();
        this.#renderCommentCount();
        this.#setupObserver();
        this.#bindEvents();
    }

    #gatherElements() {
        this.elements.commentsList = document.getElementById("commentsList");
        this.elements.commentsCountBadge = document.getElementById("commentsCountBadge");
    }

    #setupObserver() {
        this.sentinel = createElement("div", { class: "py-1 w-100" });
        this.observer = new IntersectionObserver((entries) => {
            const [entry] = entries;

            if (entry.isIntersecting) {
                if (!this.isLoading) {
                    if (this.currentPage < this.totalPages) {
                        this.#loadComments();
                    }
                }
            }
        }, {
            root: this.elements.commentsList,
            rootMargin: "300px",
            threshold: 0.1
        });
    }

    #bindEvents() {
        this.bus.on(EVENTS.APP_INIT, () => {
            this.#loadComments();
        });
    }

    async #loadComments() {
        if (!this.isLoading) {
            this.isLoading = true;
            this.currentPage++;

            if (this.abortController) {
                this.abortController.abort();
            }
            this.abortController = new AbortController();

            this.#showLoadingState();

            try {
                const gameMapId = this.store.getState().gameMapId;
                const data = await fetchGameMapComments(gameMapId, this.currentPage, this.abortController.signal);

                this.totalPages = data.pagination.totalPages;
                this.totalCommentCount = data.pagination.totalCount;
                this.#renderCommentCount();

                this.#render(data.comments);
            } catch (error) {
                this.currentPage--;

                if (error.name != "AbortError") {
                    if (this.currentPage == 0 && this.totalCommentCount == null) {
                        this.#renderCommentCount();
                    }

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

        const loadingContainer = createElement("div", {
            id: "commentsLoader",
            class: "text-center p-3 opacity-50 w-100"
        }, [spinner, text]);

        if (this.currentPage == 1) {
            this.elements.commentsList.replaceChildren(loadingContainer);
        } else {
            this.sentinel.remove();
            this.elements.commentsList.appendChild(loadingContainer);
        }
    }

    #removeLoadingState() {
        const loader = document.getElementById("commentsLoader");
        if (loader) {
            loader.remove();
        }
    }

    #renderCommentCount() {
        if (this.elements.commentsCountBadge && this.totalCommentCount != null) {
            this.elements.commentsCountBadge.innerText = this.totalCommentCount.toLocaleString("hu-HU");
        }
    }

    #showErrorState() {
        this.#removeLoadingState();

        if (this.currentPage == 0) {
            const errorText = createElement("p", { class: "text-danger text-center my-4" });
            errorText.innerText = "Nem sikerült betölteni a hozzászólásokat.";
            this.elements.commentsList.replaceChildren(errorText);
        } else {
            this.elements.commentsList.appendChild(this.sentinel);
        }
    }

    #render(comments) {
        this.#removeLoadingState();

        const hasComments = comments.length > 0;
        const fragment = document.createDocumentFragment();

        if (hasComments) {
            for (const comment of comments) {
                fragment.appendChild(this.#createCommentItem(comment));
            }
        } else {
            if (this.currentPage == 1) {
                const emptyText = createElement("p", { class: "text-center opacity-50 my-4" });
                emptyText.innerText = "Még nincsenek hozzászólások.";
                fragment.appendChild(emptyText);
            }
        }

        if (this.currentPage == 1) {
            this.elements.commentsList.replaceChildren(fragment);
        } else {
            this.elements.commentsList.appendChild(fragment);
        }

        if (this.currentPage < this.totalPages) {
            this.elements.commentsList.appendChild(this.sentinel);
            this.observer.observe(this.sentinel);
        } else {
            this.observer.unobserve(this.sentinel);
            this.sentinel.remove();
        }
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
