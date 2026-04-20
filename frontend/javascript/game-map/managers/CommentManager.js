import { EVENTS } from "../shared/EventBus.js";
import { formatDateTime } from "../shared/utils.js";
import { createElement } from "../../libs/utils/DOMUtils.js";
import { fetchGameMapComments, postGameMapComment, fetchUserComment, updateUserComment, deleteUserComment } from "../shared/api.js";
import { HoldToUnlockButton } from "../../libs/elements/HoldToUnlockButton.js";

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
        this.elements.commentForm = document.getElementById("commentForm");
        this.elements.commentText = document.getElementById("commentText");
        this.elements.ratingInputs = document.querySelectorAll("input[name='rating']");

        this.elements.userCommentSection = document.getElementById("userCommentSection");
        this.elements.userCommentRating = document.getElementById("userCommentRating");
        this.elements.userCommentText = document.getElementById("userCommentText");
        this.elements.editCommentBtn = document.getElementById("editCommentBtn");
        this.elements.deleteCommentBtn = document.getElementById("deleteCommentBtn");

        this.elements.holdToDeleteCommentBtn = new HoldToUnlockButton(this.elements.deleteCommentBtn, 1500);
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
            this.#loadUserComment();
            this.#loadComments();
        });

        this.elements.commentForm.addEventListener("submit", (event) => this.#handleCommentSubmit(event));

        this.elements.editCommentBtn.addEventListener("click", () => this.#handleEditComment());

        this.elements.holdToDeleteCommentBtn.addEventListener("confirm", () => {
            this.#handleDeleteComment()
        });

        this.elements.holdToDeleteCommentBtn.addEventListener("earlyClick", () => {
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: "A törléshez tartsd lenyomva a gombot legalább 1,5 másodpercig!",
                type: "warning"
            });
        });
    }

    async #loadUserComment() {
        try {
            const gameMapId = this.store.getState().gameMapId;
            const userComment = await fetchUserComment(gameMapId);

            if (userComment) {
                this.#renderUserComment(userComment);
            } else {
                this.#hideUserComment();
            }
        } catch (error) {
            if (error.name != "AbortError") {
                this.#hideUserComment();
            }
        }
    }

    #renderUserComment(comment) {
        this.elements.userCommentRating.style.setProperty("--rating", comment.rating);
        this.elements.userCommentText.innerText = comment.comment_text || "";

        this.elements.userCommentSection.classList.remove("d-none");
        this.elements.commentForm.classList.add("d-none");
        this.elements.commentForm.removeAttribute("data-edit-mode");
    }

    #hideUserComment() {
        this.elements.userCommentSection.classList.add("d-none");

        this.elements.commentForm.classList.remove("d-none");
        this.elements.commentForm.removeAttribute("data-edit-mode");
        this.elements.commentForm.reset();
    }

    #handleEditComment() {
        const rating = this.elements.userCommentRating.style.getPropertyValue("--rating").trim();
        const text = this.elements.userCommentText.innerText;

        this.elements.commentText.value = text;
        const ratingInput = document.querySelector(`input[name="rating"][value="${rating}"]`);
        if (ratingInput) {
            ratingInput.checked = true;
        }

        this.elements.userCommentSection.classList.add("d-none");
        this.elements.commentForm.classList.remove("d-none");
        this.elements.commentForm.setAttribute("data-edit-mode", "true");

        this.elements.commentForm.scrollIntoView({ behavior: "smooth" });
    }

    async #handleDeleteComment() {
        try {
            const gameMapId = this.store.getState().gameMapId;
            await deleteUserComment(gameMapId);

            this.#hideUserComment();
            this.elements.commentForm.reset();

            this.currentPage = 0;
            this.totalCommentCount = null;
            this.#loadComments();

            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: "Hozzászólásod sikeresen törölve!",
                type: "success"
            });
        } catch (error) {
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: error.message || "Hiba történt a hozzászólás törlésekor.",
                type: "danger"
            });
        }
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

    async #handleCommentSubmit(event) {
        event.preventDefault();

        const formData = new FormData(this.elements.commentForm);
        const commentText = formData.get("comment");
        const rating = formData.get("rating");

        if (rating) {
            try {
                if (commentText && commentText.trim()) {
                    formData.set("comment", commentText.trim());
                } else {
                    formData.delete("comment");
                }

                const gameMapId = this.store.getState().gameMapId;

                const isEditMode = this.elements.commentForm.getAttribute("data-edit-mode") == "true";
                if (isEditMode) {
                    await updateUserComment(gameMapId, formData); // TODO: ha frissites es nem valtozott ne kuldje el
                } else {
                    await postGameMapComment(gameMapId, formData);
                }

                await this.#loadUserComment();

                this.elements.commentForm.reset();
                this.elements.commentForm.removeAttribute("data-edit-mode");

                this.currentPage = 0;
                this.totalCommentCount = null;
                this.#loadComments();

                this.bus.emit(EVENTS.TOAST_SHOW, {
                    msg: isEditMode ? "Hozzászólásod sikeresen frissítve!" : "Hozzászólásod sikeresen mentve!",
                    type: "success"
                });
            } catch (error) {
                this.bus.emit(EVENTS.TOAST_SHOW, {
                    msg: error.message || "Hiba történt a hozzászólás elküldésekor.",
                    type: "danger"
                });
            }
        } else {
            this.bus.emit(EVENTS.TOAST_SHOW, {
                msg: "Kérlek értékeld legalább 1 csillaggal!",
                type: "danger"
            });
        }
    }
}
