let editor = null;

function getElements() {
    return {
        enterEditModeBtn: document.getElementById("enterEditModeBtn"),
        saveMetadataBtn: document.getElementById("saveMetadataBtn"),
        cancelMetadataBtn: document.getElementById("cancelMetadataBtn"),
        metadataEditActions: document.getElementById("metadataEditActions"),
        titleDisplay: document.getElementById("titleDisplay"),
        titleInput: document.getElementById("titleInput"),
        descriptionDisplay: document.getElementById("descriptionDisplay"),
        descriptionInput: document.getElementById("descriptionInput"),
        editMapButton: document.getElementById("editMapButton")
    };
}

function bindEditorEvents(editor) {
    editor.elements.enterEditModeBtn.addEventListener("click", onEnterEditModeClick);
    editor.elements.saveMetadataBtn.addEventListener("click", onSaveMetadataClick);
    editor.elements.cancelMetadataBtn.addEventListener("click", onCancelMetadataClick);
    editor.elements.titleInput.addEventListener("keydown", onTitleInputKeydown);
    editor.elements.descriptionInput.addEventListener("keydown", onDescriptionInputKeydown);
}

function onEnterEditModeClick() {
    if (editor) {
        enterEditMode(editor);
    }
}

function onSaveMetadataClick() {
    if (editor) {
        saveEdits(editor);
    }
}

function onCancelMetadataClick() {
    if (editor) {
        cancelEdit(editor);
    }
}

function onTitleInputKeydown(event) {
    if (editor) {
        if (event.key == "Enter") {
            event.preventDefault();
            saveEdits(editor);
        }

        if (event.key == "Escape") {
            event.preventDefault();
            cancelEdit(editor);
        }
    }
}

function onDescriptionInputKeydown(event) {
    if (editor) {
        if (event.key == "Escape") {
            event.preventDefault();
            cancelEdit(editor);
        }
    }
}

function setEditMode(editor, enabled) {
    editor.elements.titleDisplay.classList.toggle("d-none", enabled);
    editor.elements.descriptionDisplay.classList.toggle("d-none", enabled);
    editor.elements.titleInput.classList.toggle("d-none", !enabled);
    editor.elements.descriptionInput.classList.toggle("d-none", !enabled);
    editor.elements.metadataEditActions.classList.toggle("d-none", !enabled);
    editor.elements.enterEditModeBtn.classList.toggle("d-none", enabled);
    editor.elements.enterEditModeBtn.disabled = enabled;

    if (enabled) {
        editor.elements.titleInput.focus();
        editor.elements.titleInput.select();
    }
}

function enterEditMode(editor) {
    if (!editor.isEditing) {
        editor.originalTitle = editor.elements.titleDisplay.textContent.trim();
        editor.originalDescription = editor.elements.descriptionDisplay.textContent.trim();
        editor.elements.titleInput.value = editor.originalTitle;
        editor.elements.descriptionInput.value = editor.originalDescription;
        editor.isEditing = true;
        setEditMode(editor, true);
    }
}

function saveEdits(editor) {
    if (editor.isEditing) {
        const nextTitle = editor.elements.titleInput.value.trim();
        const nextDescription = editor.elements.descriptionInput.value.trim();

        if (nextTitle.length > 0) {
            editor.elements.titleDisplay.textContent = nextTitle;
            editor.elements.descriptionDisplay.textContent = nextDescription;
            editor.isEditing = false;
            setEditMode(editor, false);
        } else {
            editor.elements.titleInput.focus();
            editor.elements.titleInput.select();
        }
    }
}

function cancelEdit(editor) {
    if (editor.isEditing) {
        editor.elements.titleInput.value = editor.originalTitle;
        editor.elements.descriptionInput.value = editor.originalDescription;
        editor.elements.titleDisplay.textContent = editor.originalTitle;
        editor.elements.descriptionDisplay.textContent = editor.originalDescription;
        editor.isEditing = false;
        setEditMode(editor, false);
    }
}

function init() {
    const elements = getElements();

    elements.editMapButton.addEventListener("click", (event) => {
        event.preventDefault();
        let currentUrl = window.location.href;

        if (currentUrl.endsWith("/")) {
            currentUrl = currentUrl.slice(0, -1);
        }

        window.location.href = currentUrl + "/edit";
    });

    editor = {
        elements,
        isEditing: false,
        originalTitle: elements.titleDisplay.textContent.trim(),
        originalDescription: elements.descriptionDisplay.textContent.trim()
    };
    bindEditorEvents(editor);
}

document.addEventListener("DOMContentLoaded", init);
