#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>

#include "core/engine.h"

EMSCRIPTEN_BINDINGS(engineBinding)
{
    emscripten::class_<Engine>("Engine")
        .constructor<std::string>()
        .function("zoomBy", &Engine::zoom)
        .function("rotateCamera", &Engine::rotateCamera)
        .function("setCameraRotation", &Engine::setCameraRotation)
        .function("setCameraPosition", &Engine::setCameraPosition)
        .function("resetCameraPosition", &Engine::resetCameraPosition)
        .function("render", &Engine::render)
        .function("initTexture", emscripten::optional_override(
            [](Engine &self, int width, int height, int meshIndex) -> int
            {
                return (int)self.initTexture(width, height, meshIndex);
            }))
        .function("uploadTextureToGPU", &Engine::uploadTextureToGPU)
        .function("deleteTexture", &Engine::deleteTexture)
        .function("loadTextureFromUrl", emscripten::select_overload<void(const std::string&, int)>(&Engine::loadTextureFromUrl))
        .function("loadTextureFromUrlPromise", emscripten::select_overload<void(const std::string&, int, emscripten::val, emscripten::val)>(&Engine::loadTextureFromUrl))
        .property("yaw", &Engine::getYaw, &Engine::setYaw)
        .property("pitch", &Engine::getPitch, &Engine::setPitch)
        .function("setCanvasSize", &Engine::setCanvasSize)
        .function("setProjectionType", emscripten::select_overload<void(int)>(&Engine::setProjectionType))
        .property("zoom", &Engine::getZoom, &Engine::setZoom);
}
