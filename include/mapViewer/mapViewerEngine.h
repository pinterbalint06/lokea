#ifndef MAP_VIEWER_ENGINE_H
#define MAP_VIEWER_ENGINE_H

#include <emscripten/val.h>
#include <string>
#include <memory>

#include "core/engine.h"

// Forward declaration
class Mesh; // defined in "core/resources/mesh.h"

class MapViewerEngine : public Engine
{
private:
    Mesh *createPlane();
public:
    MapViewerEngine(const std::string &canvasID);
    ~MapViewerEngine();
    void loadMap(const std::string &url, emscripten::val onSuccess, emscripten::val onError);
};

#endif