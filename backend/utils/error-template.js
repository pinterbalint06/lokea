const fs = require("fs");
const path = require("path");

let template = "";

try {
    const templatePath = path.join(__dirname, "..", "..", "frontend", "html", "error.html");
    template = fs.readFileSync(templatePath, "utf8"); // szinkron mert egyszer fut le a szerver indításakor
} catch (error) {
    console.error("Unable to load error template html:\n", error);
    template = `
        <div style="text-align: center; margin-top: 50px;">
            <h1>Hiba ({{STATUS_CODE}})</h1>
            <p>{{ERROR_MESSAGE}}</p>
            <a href="/">Vissza a főoldalra</a>
        </div>
    `;
}

const sanitizeHtml = (value) => {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

const buildErrorHtml = (statusCode, message) => {
    return template
        .replace(/{{STATUS_CODE}}/g, sanitizeHtml(statusCode))
        .replace(/{{ERROR_MESSAGE}}/g, sanitizeHtml(message));
};

module.exports = {
    buildErrorHtml
};
