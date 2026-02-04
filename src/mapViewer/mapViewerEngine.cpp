#include <emscripten/val.h>
#include <emscripten/html5.h>
#include <emscripten/console.h>
#include <string>
#include <cstring>
#include <algorithm>

#include "core/rendering/shader.h"

#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"

#include "core/scene/camera/camera.h"

#include "core/engine.h"

#include "mapViewer/mapViewerSettings.h"
#include "mapViewer/mapViewerEngine.h"

enum VertexIndex
{
    TOP_LEFT = 0,
    TOP_RIGHT = 1,
    BOTTOM_LEFT = 2,
    BOTTOM_RIGHT = 3
};

Mesh *MapViewerEngine::createPlane()
{
    float startU = 0.0f;
    float endU = 1.0f;

    // squeeze the texture onto the plane according to aspect ratio
    // the image will be stretched to the canvas size and appear correctly
    float aspectRatio = ((float)width_ / (float)height_) / currentMapAspectRatio_;
    float off = (aspectRatio - 1.0f) * 0.5f;
    startU = -off;
    endU = 1.0f + off;
    Vertex vertices[4];
    //                            x      y      z     w     nx    ny    nz    u     v
    vertices[TOP_LEFT] = { -1.0f, 1.0f, -0.1f, 1.0f, 0.0f, 0.0f, 1.0f, startU, 0.0f };
    vertices[TOP_RIGHT] = { 1.0f, 1.0f, -0.1f, 1.0f, 0.0f, 0.0f, 1.0f, endU, 0.0f };
    vertices[BOTTOM_LEFT] = { -1.0f, -1.0f, -0.1f, 1.0f, 0.0f, 0.0f, 1.0f, startU, 1.0f };
    vertices[BOTTOM_RIGHT] = { 1.0f, -1.0f, -0.1f, 1.0f, 0.0f, 0.0f, 1.0f, endU, 1.0f };

    constexpr uint32_t indices[] = {
        TOP_RIGHT, BOTTOM_LEFT, TOP_LEFT,
        TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT
    };

    Mesh *plane = new Mesh(sizeof(vertices) / sizeof(Vertex), sizeof(indices) / sizeof(uint32_t));
    std::memcpy(plane->getVertices(), vertices, sizeof(vertices));
    std::memcpy(plane->getIndices(), indices, sizeof(indices));

    return plane;
}

MapViewerEngine::MapViewerEngine(const std::string &canvasID, int width, int height)
    : Engine(canvasID)
{
    setShadingMode(Shaders::SHADINGMODE::NO_SHADING);
    setProjectionType(PROJECTIONTYPE::ORTHOGRAPHIC);
    setZoom(0.218f);

    currentMapAspectRatio_ = 1.0f;
    width_ = width;
    height_ = height;
    renderer_->setDefaultColor(255.0f, 0.0f, 255.0f);
    // set image dimension to 1:1 aspect ratio so it only covers the plane
    scene_->getCamera()->setImageDimensions(1.0f, 1.0f);

    zoomLevel_ = settings_.minZoom;

    renderer_->setImageDimensions(width_, height_);
    mapPlane_ = createPlane();
    recalculateUVPerPixel();
    addMesh(mapPlane_);
}

MapViewerEngine::~MapViewerEngine()
{
    if (mapPlane_ != nullptr)
    {
        delete mapPlane_;
        mapPlane_ = nullptr;
    }
}

void MapViewerEngine::recalculateUVPerPixel()
{
    if (mapPlane_ != nullptr && width_ > 0 && height_ > 0)
    {
        Vertex *vertices = mapPlane_->getVertices();

        float uRange = vertices[TOP_RIGHT].u - vertices[TOP_LEFT].u;
        float vRange = vertices[BOTTOM_LEFT].v - vertices[TOP_LEFT].v;

        uPerPixel_ = uRange / (float)width_;
        vPerPixel_ = vRange / (float)height_;
    }
}

void MapViewerEngine::limitVCoordinates()
{
    if (mapPlane_ != nullptr)
    {
        Vertex *vertices = mapPlane_->getVertices();
        int vertexCount = mapPlane_->getVertexCount();

        // top vertices (0, 1) have minV
        float minV = vertices[TOP_LEFT].v;
        // bottom vertices (2, 3) have maxV
        float maxV = vertices[BOTTOM_LEFT].v;

        float vOffset = 0.0f;

        // max v range is 1
        if (minV < 0.0f)
        {
            // if the min is smaller than 0 we push it back
            vOffset = -minV;
        }
        else
        {
            if (maxV > 1.0f)
            {
                // if the max is bigger than 1 we push it back below 1
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
        recalculateUVPerPixel();
    }
    else
    {
        emscripten_console_error("Plane was destroyed!");
    }
}

void MapViewerEngine::moveMap(float deltaX, float deltaY)
{
    if (mapPlane_ != nullptr)
    {
        Vertex *vertices = mapPlane_->getVertices();
        int vertexCount = mapPlane_->getVertexCount();

        float dX = deltaX * uPerPixel_;
        float dY = deltaY * vPerPixel_;

        for (int i = 0; i < vertexCount; i++)
        {
            vertices[i].u += dX;
            vertices[i].v += dY;
        }
        limitVCoordinates();
        mapPlane_->setUpOpenGL();
    }
    else
    {
        emscripten_console_error("Plane was destroyed!");
    }
}

void MapViewerEngine::zoomMapUV(float zoomAmount, float zoomHereU, float zoomHereV)
{
    if (mapPlane_ != nullptr)
    {
        Vertex *vertices = mapPlane_->getVertices();
        int vertexCount = mapPlane_->getVertexCount();

        float oldZoomLevel = zoomLevel_;

        zoomLevel_ += zoomAmount * settings_.zoomSensitivity;
        zoomLevel_ = std::clamp(zoomLevel_, settings_.minZoom, settings_.maxZoom);

        if (zoomLevel_ != oldZoomLevel)
        {
            float zoomFactor = oldZoomLevel / zoomLevel_;
            for (int i = 0; i < vertexCount; i++)
            {
                // translate vertice to top left apply zoom and retranslate by center
                vertices[i].u = (vertices[i].u - zoomHereU) * zoomFactor + zoomHereU;
                vertices[i].v = (vertices[i].v - zoomHereV) * zoomFactor + zoomHereV;
            }

            limitVCoordinates();
            mapPlane_->setUpOpenGL();
        }
    }
    else
    {
        emscripten_console_error("Plane was destroyed!");
    }
}

void MapViewerEngine::getUVAtScreenPosition(float screenX, float screenY, float &u, float &v)
{
    if (mapPlane_ != nullptr)
    {
        Vertex *vertices = mapPlane_->getVertices();

        // calculate currently visible uv range
        float currentRangeU = vertices[TOP_RIGHT].u - vertices[TOP_LEFT].u;
        float currentRangeV = vertices[BOTTOM_LEFT].v - vertices[TOP_LEFT].v;

        // convert screen xy to uv coordinates
        float screenRatioX = screenX / (float)width_;
        float screenRatioY = screenY / (float)height_;

        // add vertices[TOP_LEFT].uv so it starts at the correct place and scale by the currently visible uv range
        u = vertices[TOP_LEFT].u + (screenRatioX * currentRangeU);
        v = vertices[TOP_LEFT].v + (screenRatioY * currentRangeV);
    }
    else
    {
        emscripten_console_error("Plane was destroyed!");
    }
}

void MapViewerEngine::zoomMap(float zoomAmount, float zoomHereScreenX, float zoomHereScreenY)
{
    float zoomHereU = 0.0f;
    float zoomHereV = 0.0f;
    getUVAtScreenPosition(zoomHereScreenX, zoomHereScreenY, zoomHereU, zoomHereV);

    zoomMapUV(zoomAmount, zoomHereU, zoomHereV);
}

void MapViewerEngine::zoomMapToCenter(float zoomAmount)
{
    if (mapPlane_ != nullptr)
    {
        Vertex *vertices = mapPlane_->getVertices();

        float currentScreenCenterU = (vertices[TOP_LEFT].u + vertices[BOTTOM_RIGHT].u) / 2.0f;
        float currentScreenCenterV = (vertices[TOP_LEFT].v + vertices[BOTTOM_RIGHT].v) / 2.0f;

        zoomMapUV(zoomAmount, currentScreenCenterU, currentScreenCenterV);
    }
    else
    {
        emscripten_console_error("Plane was destroyed!");
    }
}

void MapViewerEngine::loadMap(const std::string &url, float imageAspectRatio, emscripten::val onSuccess, emscripten::val onError)
{
    if (mapPlane_ != nullptr)
    {
        loadTextureFromUrl(url, 0, onSuccess, onError);
        currentMapAspectRatio_ = imageAspectRatio;
        fitMapHorizontally();
        mapPlane_->setUpOpenGL();
    }
}

void MapViewerEngine::loadMap(const std::string &url, float imageAspectRatio)
{
    loadMap(url, imageAspectRatio, emscripten::val::undefined(), emscripten::val::undefined());
}

void MapViewerEngine::fitMapHorizontally()
{
    Vertex *vertices = mapPlane_->getVertices();

    float screenAspectRatio = ((float)width_ / height_) / currentMapAspectRatio_;

    // first we calculate the center of the horizontal axis
    float currentCenterU = (vertices[TOP_LEFT].u + vertices[TOP_RIGHT].u) * 0.5f;

    // we keep the current height
    float currentMapHeightV = vertices[BOTTOM_LEFT].v - vertices[TOP_LEFT].v;

    // change width according to aspect ratio
    float newMapWidthU = currentMapHeightV * screenAspectRatio;

    // we calculate half of the new width
    float halfWidth = newMapWidthU * 0.5f;

    // old center - new half width = left boundary of the new view
    vertices[TOP_LEFT].u = currentCenterU - halfWidth;
    vertices[BOTTOM_LEFT].u = currentCenterU - halfWidth;

    // old center + new half width = right boundary of the new view
    vertices[TOP_RIGHT].u = currentCenterU + halfWidth;
    vertices[BOTTOM_RIGHT].u = currentCenterU + halfWidth;

    recalculateUVPerPixel();
}

void MapViewerEngine::setCanvasSize(int width, int height)
{
    width_ = width;
    height_ = height;

    std::string canvID = "#" + canvas_;
    emscripten_set_canvas_element_size(canvID.c_str(), width_, height_);
    renderer_->setImageDimensions(width_, height_);

    if (mapPlane_ != nullptr)
    {
        fitMapHorizontally();

        // update GPU
        mapPlane_->setUpOpenGL();
    }
    else
    {
        emscripten_console_error("Plane was destroyed!");
    }
}
