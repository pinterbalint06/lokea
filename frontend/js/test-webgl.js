document.addEventListener("DOMContentLoaded", function () {
    Module.onRuntimeInitialized = function () {
        console.log("module betoltve");
        Module.updateCanvasSize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", function () {
            Module.updateCanvasSize(this.window.innerWidth, this.window.innerHeight);
        });
    };
});