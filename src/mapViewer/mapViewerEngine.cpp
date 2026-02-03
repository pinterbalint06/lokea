#include <emscripten/val.h>
#include <string>
#include <cstring>

#include "core/rendering/shader.h"

#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"

#include "mapViewer/mapViewerEngine.h"

#include "core/engine.h"

Mesh *MapViewerEngine::createPlane()
{
    constexpr Vertex vertices[] = {
        //  x      y      z     w       nx    ny    nz      u     v
        { -1.0f,  1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f },
        {  1.0f,  1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   1.0f, 0.0f },
        { -1.0f, -1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   0.0f, 1.0f },
        {  1.0f, -1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   1.0f, 1.0f }
    };

    constexpr uint32_t indices[] = {
        1, 2, 0,
        1, 3, 2
    };

    Mesh *plane = new Mesh(sizeof(vertices) / sizeof(Vertex), sizeof(indices) / sizeof(uint32_t));
    std::memcpy(plane->getVertices(), vertices, sizeof(vertices));
    std::memcpy(plane->getIndices(), indices, sizeof(indices));

    return plane;
}


MapViewerEngine::MapViewerEngine(const std::string &canvasID) : Engine(canvasID)
{
    setShadingMode(Shaders::SHADINGMODE::NO_SHADING);
    setProjectionType(1);
    setZoom(0.22);

    Mesh *plane = createPlane();
    addMesh(plane);
}

MapViewerEngine::~MapViewerEngine()
{
}

void MapViewerEngine::loadMap(const std::string &url, emscripten::val onSuccess, emscripten::val onError)
{

}
