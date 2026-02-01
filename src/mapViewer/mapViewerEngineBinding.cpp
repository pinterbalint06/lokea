#include <emscripten/bind.h>
#include <string>

#include "mapViewer/mapViewerEngine.h"

EMSCRIPTEN_BINDINGS(mapViewerEngineBinding)
{
    emscripten::class_<MapViewerEngine, emscripten::base<Engine>>("MapViewerEngine")
        .constructor<std::string>()
        .function("loadMap", &MapViewerEngine::loadMap);
}
