#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>

#include "mapViewer/mapViewerEngine.h"

EMSCRIPTEN_BINDINGS(mapViewerEngineBinding)
{
    emscripten::class_<MapViewerEngine>("MapViewerEngine")
        .constructor<std::string, int, int>()
        .function("loadMap", emscripten::select_overload<void(const std::string&)>(&MapViewerEngine::loadMap))
        .function("moveMap", &MapViewerEngine::moveMap)
        .function("zoomMap", &MapViewerEngine::zoomMap)
        .function("render", &MapViewerEngine::callRender);
}
