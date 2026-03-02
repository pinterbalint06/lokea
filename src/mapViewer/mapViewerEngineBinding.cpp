#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>

#include "mapViewer/mapViewerSettings.h"
#include "mapViewer/mapViewerEngine.h"

EMSCRIPTEN_BINDINGS(mapViewerSettingsBinding)
{
    emscripten::value_object<MapViewerSettings>("MapViewerSettings")
        .field("minZoom", &MapViewerSettings::minZoom)
        .field("maxZoom", &MapViewerSettings::maxZoom)
        .field("zoomSensitivity", &MapViewerSettings::zoomSensitivity);
}

EMSCRIPTEN_BINDINGS(mapViewerEngineBinding)
{
    emscripten::class_<MapViewerEngine>("MapViewerEngine")
        .constructor<const std::string&, int, int, const std::string&>()
        .function("loadMap", emscripten::select_overload<void(const std::string&, int, int)>(&MapViewerEngine::loadMap))
        .function("loadMapPromise", emscripten::select_overload<void(const std::string&, int, int, emscripten::val, emscripten::val)>(&MapViewerEngine::loadMap))
        .function("moveMap", &MapViewerEngine::moveMap)
        .function("zoomMapToCenter", &MapViewerEngine::zoomMapToCenter)
        .function("zoomMap", &MapViewerEngine::zoomMap)
        .function("render", &MapViewerEngine::render)
        .function("setCanvasSize", &MapViewerEngine::setCanvasSize)
        .function("getSettings", &MapViewerEngine::getSettings)
        .function("setSettings", &MapViewerEngine::setSettings)
        .function("placeMarker", &MapViewerEngine::placeMarker)
        .function("removeMarker", &MapViewerEngine::removeMarker)
        .function("getMarkerPosition", &MapViewerEngine::getMarkerPosition);
}
