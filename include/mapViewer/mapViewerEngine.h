#ifndef MAP_VIEWER_ENGINE_H
#define MAP_VIEWER_ENGINE_H

#include <emscripten/val.h>
#include <string>
#include <memory>

#include "core/engine.h"

// Forward declaration
class Mesh;               // defined in "core/resources/mesh.h"
class Vertex;             // defined in "core/resources/vertex.h"
struct mapViewerSettings; // defined in "mapViewer/mapViewerSettings.h"

class MapViewerEngine : private Engine
{
private:
    float zoomLevel_;
    int width_, height_;
    Mesh *mapPlane_;
    MapViewerSettings settings_;
    float currentMapAspectRatio_;
    // used as pan sensitivity so we use dPixel * texture coordinate per pixel when panning
    float uPerPixel_, vPerPixel_;

    Mesh *createPlane();
    void recalculateUVPerPixel();
    void limitVCoordinates();
    void fitMapHorizontally();
    void getUVAtScreenPosition(float screenX, float screenY, float &u, float &v);
    void zoomMapUV(float zoomAmount, float zoomHereU, float zoomHereV);

public:
    MapViewerEngine(const std::string &canvasID, int width, int height);
    ~MapViewerEngine();

    MapViewerSettings &getSettings() { return settings_; }

    void setSettings(MapViewerSettings newSettings)
    {
        settings_ = newSettings;
        // call zoom with no change to recalculate zoom
        zoomMapUV(0.0f, 0.0f, 0.0f);
    }

    void moveMap(float deltaX, float deltaY);
    void loadMap(const std::string &url, float imageAspectRatio, emscripten::val onSuccess, emscripten::val onError);
    void loadMap(const std::string &url, float imageAspectRatio);
    void zoomMapToCenter(float zoomAmount);
    void zoomMap(float zoomAmount, float zoomHereScreenX, float zoomHereScreenY);
    void render() { Engine::render(); }
    void setCanvasSize(int width, int height);
};

#endif