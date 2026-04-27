export function createHTMLelement(tag, classes = [], text = "", id = "") {
    let htmlElement = document.createElement(tag);
    if (classes.length) htmlElement.classList.add(...classes);
    if (text) htmlElement.textContent = text;
    if (id) htmlElement.id = id;
    return htmlElement;
};

export function gombGeneral(type, text, svg, color, id, classes = []) {
    let button = document.createElement('button');
    button.type = type;
    if (svg != null) {
        button.appendChild(svggeneral(svg, "buttonIcon"));
    }
    if (text != null) {
        let textNode = document.createTextNode(text);
        button.appendChild(textNode);
    }
    if (id != null) {
        button.id = id;
    }
    button.classList.add('btn');
    switch (color) {
        case "red":
            button.classList.add('btn-danger');
            break;
        case "blue":
            button.classList.add('btn-primary');
            break;
        case "lightblue":
            button.classList.add('btn-info');
            break;
        case "green":
            button.classList.add('btn-success');
            break;
        case "link":
            button.classList.add('btn-link');
            break;
    }
    if (classes != null) {
        button.classList.add(...classes);
    }
    return button;
}

export function inputGeneral(type, placeholder, value, id, osztalyok, disabled) {
    let input = document.createElement('input');
    input.type = type;
    if (placeholder != null) {
        input.placeholder = placeholder;
    }
    if (value != null) {
        input.value = value;
    }
    input.id = id;
    if (osztalyok != null) {
        input.classList.add(...osztalyok);
    }
    input.disabled = disabled;
    return input;
}

export function labelGeneral(id, text, classes) {
    let label = document.createElement('label');
    label.setAttribute('for', id);
    label.innerText = text;
    if (classes != null) {
        label.classList.add(...classes);
    }
    return label;
}

export function svggeneral(name, className) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add(className);

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `../images/icons/sprite.svg#${name}`);

    svg.appendChild(use);
    return svg;
}

export function makeSubtitle(text) {
    let subtitle = document.createElement('h5');
    subtitle.classList.add("subtitle");
    subtitle.innerText = text;
    return subtitle;
}

export function formatDate(date) {
    let rawDate = new Date(date);

    let formattedDate = rawDate.toLocaleString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/\.\s/g, '. ').replace(/,+/g, '');

    return formattedDate;
}

export function formatTime(date) {
    let rawDate = new Date(date);

    return new Intl.DateTimeFormat('hu-HU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(rawDate);
}

export function lapozasGeneral(totalRecords, pageFunction, currentPage, ...args) {
    const limit = 15;
    let maxPage = Math.ceil(totalRecords / limit);

    let paginationDiv = createHTMLelement('div', ["d-flex", "justify-content-center", "align-items-center", "gap-3", "border", "rounded", "mt-3", "mb-5", "mx-auto", "p-2"]);
    paginationDiv.style.width = "fit-content";

    let prevBtn = gombGeneral("button", "Previous", null, "green", null);
    prevBtn.disabled = (currentPage.page === 1);
    prevBtn.addEventListener("click", async () => {
        if (currentPage.page > 1) {
            currentPage.page--;
            await pageFunction(...args);
        }
    });

    let nextBtn = gombGeneral("button", "Next", null, "green", null);
    nextBtn.disabled = (currentPage.page >= maxPage || maxPage === 0);
    nextBtn.addEventListener("click", async () => {
        if (currentPage.page < maxPage) {
            currentPage.page++;
            await pageFunction(...args);
        }
    });

    let pageInfo = createHTMLelement('span', ["align-self-center", "fw-bold"], `${currentPage.page} / ${maxPage}`);

    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextBtn);
    return paginationDiv;
}

export function createSection(id, title, isOpen = false) {
    let item = createHTMLelement('div', ['accordion-item', 'mb-3', 'border-0', 'shadow-sm']);

    let header = createHTMLelement('h2', ['accordion-header']);

    let button = gombGeneral('button', title, null, null, null, ['accordion-button']);
    if (!isOpen) button.classList.add('collapsed');
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', `#collapse-${id}`);

    let collapse = createHTMLelement('div', ['accordion-collapse', 'collapse'], null, `collapse-${id}`);
    if (isOpen) collapse.classList.add('show');
    collapse.setAttribute('data-bs-parent', '#settingsAccordion');

    let body = createHTMLelement('div', ['accordion-body']);

    header.appendChild(button);
    collapse.appendChild(body);
    item.appendChild(header);
    item.appendChild(collapse);

    return { item, body };
};

export async function createPreview(file) {

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.src = url;
    await new Promise(res => img.onload = res);
    URL.revokeObjectURL(url);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 400;

    let size = Math.min(img.width, img.height);

    let sx = (img.width - size) / 2;
    let sy = (img.height - size) / 2;

    ctx.drawImage(
        img,
        sx, sy,
        size, size,
        0, 0,
        400, 400
    );

    return canvas.toDataURL("image/webp");
}

export function showAlert(message, type = 'danger') {
    let container = document.getElementById('alert-container');
    if (!container) {
        container = createHTMLelement('div', ['position-fixed', 'top-0', 'end-0', 'p-3'], null, 'alert-container');
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    let alertDiv = createHTMLelement('div', ['alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show', 'shadow']);
    alertDiv.setAttribute('role', 'alert');

    let textSpan = createHTMLelement('span', [], message);
    let closeBtn = createHTMLelement('button', ['btn-close']);
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('data-bs-dismiss', 'alert');
    closeBtn.setAttribute('aria-label', 'Close');

    alertDiv.appendChild(textSpan);
    alertDiv.appendChild(closeBtn);
    container.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}