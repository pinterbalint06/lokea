#include <emscripten/val.h>
#include <emscripten/html5.h>
#include <string>
#include <cstring>

#include "core/rendering/shader.h"

#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"

#include "core/scene/camera/camera.h"

#include "core/engine.h"

#include "mapViewer/mapViewerEngine.h"

constexpr float minZoom = 1.0f;
constexpr float maxZoom = 50.0f;

Mesh *MapViewerEngine::createPlane(float aspectRatio)
{
    float startU = 0.0f;
    float endU = 1.0f;

    float uMult = aspectRatio;
    float off = (uMult - 1.0f) * 0.5f;
    startU = -off;
    endU = 1.0f + off;
    const Vertex vertices[] = {
        //  x      y      z     w       nx    ny    nz        u     v
        { -1.0f,  1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   startU, 0.0f }, // TOP LEFT
        {  1.0f,  1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   endU,   0.0f }, // TOP RIGHT
        { -1.0f, -1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   startU, 1.0f }, // BOTTOM LEFT
        {  1.0f, -1.0f,  -0.1f, 1.0f,   0.0f, 0.0f, 1.0f,   endU,   1.0f }  // BOTTOM RIGHT
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
    setProjectionType(PROJECTIONTYPE::ORTHOGRAPHIC);
    setZoom(0.218f);
    renderer_->setDefaultColor(255.0f, 0.0f, 255.0f);
    scene_->getCamera()->setImageDimensions(width, width);
    zoomLevel = 1.0f;

    renderer_->setImageDimensions(width, height);
    float aspectRatio = (float)width / height;
    Mesh *plane = createPlane(aspectRatio);
    addMesh(plane);
}

MapViewerEngine::~MapViewerEngine()
{
}

void MapViewerEngine::limitVCoordinates(Vertex* vertices, int vertexCount)
{
    float minV = vertices[0].v;
    float maxV = vertices[0].v;

    for (int i = 1; i < vertexCount; i++)
    {
        if (vertices[i].v < minV)
        {
            minV = vertices[i].v;
        }
        else
        {
            if (vertices[i].v > maxV)
            {
                maxV = vertices[i].v;
            }
        }
    }

    float height = maxV - minV;
    float vOffset = 0.0f;

    if (minV < 0.0f)
    {
        vOffset = 0.0f - minV;
    }
    else
    {
        if (maxV > 1.0f)
        {
            vOffset = 1.0f - maxV;
        }
    }

    if (vOffset != 0.0f)
    {
        for (int i = 0; i < vertexCount; i++)
        {
            vertices[i].v += vOffset;
        }
    }
}

void MapViewerEngine::moveMap(float deltaX, float deltaY)
{
    Mesh *plane = scene_->getMesh(0);
    Vertex *vertices = plane->getVertices();
    int vertexCount = plane->getVertexCount();

    float zoomCorrectedSensitivity = (1.0f / zoomLevel) * sens;
    float dX = deltaX * zoomCorrectedSensitivity;
    float dY = deltaY * zoomCorrectedSensitivity;

    for (int i = 0; i < vertexCount; i++)
    {
        vertices[i].u += dX;
        vertices[i].v += dY;
    }
    limitVCoordinates(vertices, 4);
    plane->setUpOpenGL();
}

void MapViewerEngine::zoomMap(float zoomAmount)
{
    Mesh *plane = scene_->getMesh(0);
    Vertex *vertices = plane->getVertices();
    int vertexCount = plane->getVertexCount();

    float currentScreenCenterU = (vertices[0].u + vertices[3].u) / 2.0f;
    float currentScreenCenterV = (vertices[0].v + vertices[3].v) / 2.0f;

    float oldZoomLevel = zoomLevel;
    zoomLevel += zoomAmount * zoomSens;
    zoomLevel = std::clamp(zoomLevel, minZoom, maxZoom);
    float zoomFactor = oldZoomLevel / zoomLevel;

    if (zoomFactor != 1.0f)
    {
        for (int i = 0; i < vertexCount; i++)
        {
            // translate vertice to top left apply zoom and retranslate by center
            vertices[i].u = (vertices[i].u - currentScreenCenterU) * zoomFactor + currentScreenCenterU;
            vertices[i].v = (vertices[i].v - currentScreenCenterV) * zoomFactor + currentScreenCenterV;
        }

        limitVCoordinates(vertices, 4);
        plane->setUpOpenGL();
    }
}

void MapViewerEngine::loadMap(const std::string &url, emscripten::val onSuccess, emscripten::val onError)
{
    loadTextureFromUrl(url, 0);
}

void MapViewerEngine::loadMap(const std::string &url)
{
    loadMap(url, emscripten::val::undefined(), emscripten::val::undefined());
}

void MapViewerEngine::setCanvasSize(int width, int height)
{
    std::string canvID = "#" + canvas_;
    emscripten_set_canvas_element_size(canvID.c_str(), width, height);
    renderer_->setImageDimensions(width, height);

    Mesh *plane = scene_->getMesh(0);
    Vertex *vertices = plane->getVertices();

    float screenAspectRatio = (float)width / (float)height;

    // first we calculate the center of the horizontal axis
    float currentCenterU = (vertices[0].u + vertices[1].u) * 0.5f;

    // current height
    float currentMapHeightV = vertices[2].v - vertices[0].v;

    // by aspect ratio we keep the height and make more visible in width
    float newMapWidthU = currentMapHeightV * screenAspectRatio;

    // we calculate the half of the new widht
    float halfWidth = newMapWidthU * 0.5f;

    // old center - new half width = left point of the new view
    vertices[0].u = currentCenterU - halfWidth;
    vertices[2].u = currentCenterU - halfWidth;

    // old center + new half width = right point of the new view
    vertices[1].u = currentCenterU + halfWidth;
    vertices[3].u = currentCenterU + halfWidth;

    // zpdate GPU
    plane->setUpOpenGL();
}
