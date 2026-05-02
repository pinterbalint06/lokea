export function createElement(tagName, attributes = {}, children = []) {
    const element = document.createElement(tagName);

    for (const attributeName in attributes) {
        element.setAttribute(attributeName, attributes[attributeName]);
    }

    for (const child of children) {
        element.appendChild(child);
    }

    return element;
}

export function createHTMLelement(tag, classes = [], text = "", id = "") {
    let htmlElement = document.createElement(tag);
    if (classes.length) htmlElement.classList.add(...classes);
    if (text) htmlElement.textContent = text;
    if (id) htmlElement.id = id;
    return htmlElement;
};

export function makeSubtitle(text) {
    let subtitle = document.createElement('h5');
    subtitle.classList.add("subtitle");
    subtitle.innerText = text;
    return subtitle;
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

export function gombGeneral(type, text, svg, color, id) {
    let button = document.createElement('button');
    button.type = type;
    if (svg == null) {
        button.innerText = text;
    }
    else {
        button.appendChild(makeSvg(svg, ["buttonIcon"], null));
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
    return button;
}

export function makeSvg(name, svgclasses, useclasses) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (svgclasses) {
        svg.classList.add(...svgclasses);
    }
    let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    if (useclasses) {
        use.classList.add(...useclasses);
    }

    use.setAttribute("href", `../images/icons/sprite.svg#${name}`);

    svg.appendChild(use);
    return svg;
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
