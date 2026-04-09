export function createHTMLelement(tag, classes = [], text = "", id = "") {
    let htmlElement = document.createElement(tag);
    if (classes.length) htmlElement.classList.add(...classes);
    if (text || text == null) htmlElement.textContent = text;
    if (id) htmlElement.id = id;
    return htmlElement;
};

export function gombGeneral(type, text, svg, color, id) {
    let button = document.createElement('button');
    button.type = type;
    if (svg == null) {
        button.innerText = text;
    }
    else {
        button.appendChild(svggeneral(svg, "buttonIcon"));
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