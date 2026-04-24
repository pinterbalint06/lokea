#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>

#include "mapViewer/mapViewerEngine.h"

EMSCRIPTEN_BINDINGS(mapViewerEngineBinding)
{
    emscripten::class_<MapViewerEngine>("MapViewerEngine")
        .constructor<const std::string&, int, int>()
        .function("loadMap", emscripten::select_overload<void(const std::string&, int, int)>(&MapViewerEngine::loadMap))
        .function("loadMapPromise", emscripten::select_overload<void(const std::string&, int, int, emscripten::val, emscripten::val)>(&MapViewerEngine::loadMap))
        .function("moveMap", &MapViewerEngine::moveMap)
        .function("zoomMapToCenter", &MapViewerEngine::zoomMapToCenter)
        .function("zoomMap", &MapViewerEngine::zoomMap)
        .function("render", &MapViewerEngine::render)
        .function("setCanvasSize", &MapViewerEngine::setCanvasSize)
        .function("addMarker", &MapViewerEngine::addMarker)
        .function("addMarkerByUV", &MapViewerEngine::addMarkerByUV)
        .function("placeMarkerByImageCoordinates", &MapViewerEngine::addMarkerByImageCoordinates)
        .function("moveMarkerToUV", &MapViewerEngine::moveMarkerToUV)
        .function("moveMarkerToImageCoordinates", &MapViewerEngine::moveMarkerToImageCoordinates)
        .function("removeMarker", &MapViewerEngine::removeMarker)
        .function("getMarkerPosition", &MapViewerEngine::getMarkerPosition)
        .function("moveMarkerToScreen", &MapViewerEngine::moveMarkerToScreen)
        .function("doesMarkerExist", &MapViewerEngine::doesMarkerExist)
        .function("changeMarkerTexture", &MapViewerEngine::changeMarkerTexture)
        .function("getMarkerIdAtScreenCoords", &MapViewerEngine::getMarkerIdAtScreenCoords)
        .function("changeMarkerId", &MapViewerEngine::changeMarkerId)
        .function("clearAllMarkers", &MapViewerEngine::clearAllMarkers)
        .function("rotateMarker", &MapViewerEngine::rotateMarker)
        .function("connectMarkers", &MapViewerEngine::connectMarkers)
        .function("removeLine", &MapViewerEngine::removeLine)
        .function("clearAllLines", &MapViewerEngine::clearAllLines)
        .function("setMarkerSelectable", &MapViewerEngine::setMarkerSelectable)
        .function("setMarkerFixedToMap", &MapViewerEngine::setMarkerFixedToMap)
        .function("doesLineExist", &MapViewerEngine::doesLineExist)
        .function("isAlreadyConnected", &MapViewerEngine::isAlreadyConnected)
        .function("getCenterOffsetByImageCoords", &MapViewerEngine::getCenterOffsetByImageCoords)
        .function("changeLineColor", &MapViewerEngine::changeLineColor)
        .function("getZoomLevel", &MapViewerEngine::getZoomLevel)
        .function("resizeMarker", &MapViewerEngine::resizeMarker);
}
