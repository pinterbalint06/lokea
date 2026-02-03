#ifndef MAP_VIEWER_ENGINE_H
#define MAP_VIEWER_ENGINE_H

#include <emscripten/val.h>
#include <string>
#include <memory>

#include "core/engine.h"

// Forward declaration
class Mesh; // defined in "core/resources/mesh.h"
class Vertex; // defined in "core/resources/vertex.h"

class MapViewerEngine : private Engine
{
private:
    float sens = 0.001f;
    float zoomSens = 0.0125f;
    float zoomLevel;
    int width_, height_;
    Mesh *createPlane();
    void limitVCoordinates(Vertex* vertices, int vertexCount);
    void zoomMapUV(float zoomAmount, float zoomHereU, float zoomHereV);
public:
    MapViewerEngine(const std::string &canvasID, int width, int height);
    ~MapViewerEngine();
    void moveMap(float deltaX, float deltaY);
    void loadMap(const std::string &url, emscripten::val onSuccess, emscripten::val onError);
    void loadMap(const std::string &url);
    void zoomMapToCenter(float zoomAmount);
    void zoomMap(float zoomAmount, float zoomHereX, float zoomHereY);
    void render()
    {
        Engine::render();
    }
    void setCanvasSize(int width, int height);
};

#endif