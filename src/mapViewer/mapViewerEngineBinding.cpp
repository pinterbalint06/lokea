#include <emscripten/bind.h>
#include <string>

#include "mapViewer/mapViewerEngine.h"

EMSCRIPTEN_BINDINGS(mapViewerEngineBinding)
{
    emscripten::class_<MapViewerEngine, emscripten::base<Engine>>("MapViewerEngine")
        .constructor<std::string, int, int>()
        .function("loadMap", &MapViewerEngine::loadMap)
        .function("moveMap", &MapViewerEngine::moveMap);
}
