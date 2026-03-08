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