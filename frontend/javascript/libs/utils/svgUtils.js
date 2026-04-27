const SVG_NS = "http://www.w3.org/2000/svg";

export function createSVGIcon(icon, style = { fill: "white" }) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", icon.viewBox);

    Object.assign(svg.style, style);

    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", icon.href);

    svg.appendChild(use);
    return svg;
}
