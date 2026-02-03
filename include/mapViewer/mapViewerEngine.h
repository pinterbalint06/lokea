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
    float sens = 0.003f;
    float zoomSens = 0.02f;
    float zoomLevel;
    Mesh *createPlane(float aspectRatio);
    void limitVCoordinates(Vertex* vertices, int vertexCount);
public:
    MapViewerEngine(const std::string &canvasID, int width, int height);
    ~MapViewerEngine();
    void moveMap(float deltaX, float deltaY);
    void loadMap(const std::string &url, emscripten::val onSuccess, emscripten::val onError);
    void loadMap(const std::string &url);
    void zoomMap(float zoomAmount);
    void callRender();
};

#endif