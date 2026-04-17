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
        button.appendChild(makeSvg(svg, "buttonIcon"));
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
        use.classList.add(...svgclasses);
    }
    let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    if (useclasses) {
        use.classList.add(...useclasses);
    }

    use.setAttribute("href", `../images/icons/sprite.svg#${name}`);

    svg.appendChild(use);
    return svg;
}

