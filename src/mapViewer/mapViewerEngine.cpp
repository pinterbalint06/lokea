#include <emscripten/val.h>
#include <string>
#include <cstring>

#include "core/rendering/shader.h"

#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"

#include "mapViewer/mapViewerEngine.h"

#include "core/engine.h"

Mesh *MapViewerEngine::createPlane(float aspectRatio)
{
    float uMult = 1.0f;
    float vMult = 1.0f;

    if (aspectRatio > 1.0f)
    {
        uMult = aspectRatio;
    }
    else
    {
        vMult = 1.0f / aspectRatio;
    }
    const Vertex vertices[] = {
        //  x      y      z     w       nx    ny    nz        u     v
        { -1.0f,  1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   0.0f,  0.0f  },
        {  1.0f,  1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   uMult, 0.0f  },
        { -1.0f, -1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   0.0f,  vMult },
        {  1.0f, -1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   uMult, vMult }
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


MapViewerEngine::MapViewerEngine(const std::string &canvasID, int width, int height) : Engine(canvasID)
{
    setShadingMode(Shaders::SHADINGMODE::NO_SHADING);
    setProjectionType(1);
    setZoom(0.22);

    renderer_->setImageDimensions(width, height);
    float aspectRatio = (float)width / height;
    Mesh *plane = createPlane(aspectRatio);
    addMesh(plane);
}

MapViewerEngine::~MapViewerEngine()
{
}

void MapViewerEngine::moveMap(float deltaX, float deltaY)
{
    Mesh *plane = scene_->getMesh(0);
    Vertex *vertices = plane->getVertices();
    int vertexCount = plane->getVertexCount();
    for (int i = 0; i < vertexCount; i++)
    {
        vertices[i].u += deltaX * sens;
        vertices[i].v += deltaY * sens;
    }
    plane->setUpOpenGL();
}

void MapViewerEngine::loadMap(const std::string &url, emscripten::val onSuccess, emscripten::val onError)
{

}
