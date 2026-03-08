const SVG_NS = "http://www.w3.org/2000/svg";

export function createSvgIcon(icon, height) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.style.height = height;
    svg.style.fill = "white";
    svg.setAttribute("viewBox", icon.viewBox);

    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", icon.href);

    svg.appendChild(use);
    return svg;
}