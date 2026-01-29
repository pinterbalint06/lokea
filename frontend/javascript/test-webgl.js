import ModuleBuilder from './terrain.js';

// |------------------|
// | GLOBAL VARIABLES |
// |------------------|

let terrainEngine;
let Module;
const canvasId = "canvas";
const meret = 256;

// |------------------------------|
// | MAIN LOOP AND INITIALIZATION |
// |------------------------------|

document.addEventListener("DOMContentLoaded", function () {
    ModuleBuilder().then((modu) => {
        Module = modu;
        initModule();
    });
});

function initModule() {
    // Initialize the terrainEngine
    terrainEngine = new Module.TerrainEngine(canvasId, meret);
    terrainEngine.setCanvasSize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", function () {
        terrainEngine.setCanvasSize(this.window.innerWidth, this.window.innerHeight);
    });
    mainLoop();
}

function mainLoop() {
    terrainEngine.render();
    requestAnimationFrame(mainLoop);
}