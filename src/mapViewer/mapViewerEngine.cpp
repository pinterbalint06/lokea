#include <emscripten/val.h>
#include <emscripten/html5.h>
#include <emscripten/console.h>
#include <string>
#include <cstring>
#include <algorithm>
#include <cmath>
#include <GLES3/gl3.h>

#include "core/rendering/shader.h"

#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"
#include "core/resources/texture.h"

#include "core/scene/camera/camera.h"

#include "core/engine.h"

#include "mapViewer/mapViewerSettings.h"
#include "mapViewer/mapViewerEngine.h"
#include "mapViewer/mapMarker.h"

enum VertexIndex
{
    TOP_LEFT = 0,
    TOP_RIGHT = 1,
    BOTTOM_LEFT = 2,
    BOTTOM_RIGHT = 3
};

void MapViewerEngine::createMapPlane()
{
    if (mapPlane_ == nullptr)
    {
        float startU = 0.0f;
        float endU = 1.0f;

        // squeeze the texture onto the plane according to aspect ratio
        // the image will be stretched to the canvas size and appear correctly
        float aspectRatio = (float)width_ / (float)height_;
        float off = (aspectRatio - 1.0f) * 0.5f;
        startU = -off;
        endU = 1.0f + off;
        Vertex vertices[4];
        //                        x      y      z     w     nx    ny    nz    u     v
        vertices[TOP_LEFT] = { -1.0f, 1.0f, -0.01f, 1.0f, 0.0f, 0.0f, 1.0f, startU, 0.0f };
        vertices[TOP_RIGHT] = { 1.0f, 1.0f, -0.01f, 1.0f, 0.0f, 0.0f, 1.0f, endU, 0.0f };
        vertices[BOTTOM_LEFT] = { -1.0f, -1.0f, -0.01f, 1.0f, 0.0f, 0.0f, 1.0f, startU, 1.0f };
        vertices[BOTTOM_RIGHT] = { 1.0f, -1.0f, -0.01f, 1.0f, 0.0f, 0.0f, 1.0f, endU, 1.0f };

        constexpr uint32_t indices[] = {
            TOP_RIGHT, BOTTOM_LEFT, TOP_LEFT,
            TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT
        };

        mapPlane_ = std::make_shared<Mesh>(sizeof(vertices) / sizeof(Vertex), sizeof(indices) / sizeof(uint32_t));
        std::memcpy(mapPlane_->getVertices(), vertices, sizeof(vertices));
        std::memcpy(mapPlane_->getIndices(), indices, sizeof(indices));

        recalculateUVPerPixel();
        addMesh(mapPlane_);
    }
}

void MapViewerEngine::updateSingleMarker(MapMarker *mapMarker)
{
    if (mapMarker && mapPlane_)
    {
        Vertex* mapVertices = mapPlane_->getVertices();

        float minMapU = mapVertices[TOP_LEFT].u;
        float minMapV = mapVertices[TOP_LEFT].v;
        // ranges
        float uRange = mapVertices[TOP_RIGHT].u - minMapU;
        float vRange = mapVertices[BOTTOM_LEFT].v - minMapV;

        // calculate which map to put the marker on
        // it is put on the closest to the view center
        float currentCenterU = (mapVertices[TOP_LEFT].u + mapVertices[TOP_RIGHT].u) * 0.5f;

        float markerToCenter = currentCenterU - mapMarker->getU();

        float closestMapStart = std::round(markerToCenter);
        float renderMarkerU = mapMarker->getU() + closestMapStart;

        // marker's coordinates inside the view
        float inRangeRelativeU = (renderMarkerU - minMapU) / uRange;
        float inRangeRelativeV = (mapMarker->getV() - minMapV) / vRange;

        // the plane starts at -1 and ends at 1
        // we have to turn the rangeRelative [0;1] coordinate to [-1;1]
        // [0;1] * 2 => [0;2]
        // [0;2] - 1 => [-1;1]
        // also flip the y axis by subtracting it from 1
        float inPlaneX = (inRangeRelativeU * 2.0f) - 1.0f;
        float inPlaneY = 1.0f - (inRangeRelativeV * 2.0f);

        // correct by aspect ratio
        float inverseAspectRatio = (float)height_ / (float)width_;
        float halfWidth = mapMarker->getWidth() * inverseAspectRatio * 0.5f;

        Vertex* markerVertices = mapMarker->getVertices();

        // center x around calculated coordinate
        markerVertices[TOP_LEFT].x = inPlaneX - halfWidth;
        markerVertices[TOP_RIGHT].x = inPlaneX + halfWidth;

        markerVertices[BOTTOM_LEFT].x = inPlaneX - halfWidth;
        markerVertices[BOTTOM_RIGHT].x = inPlaneX + halfWidth;

        // put the bottom to the click not centered around
        // so the markers bottom middle point marks the point
        markerVertices[TOP_LEFT].y = inPlaneY + mapMarker->getHeight();
        markerVertices[TOP_RIGHT].y = inPlaneY + mapMarker->getHeight();

        markerVertices[BOTTOM_LEFT].y = inPlaneY;
        markerVertices[BOTTOM_RIGHT].y = inPlaneY;

        // update gpu
        mapMarker->setUpOpenGL();
    }
}

void MapViewerEngine::updateAllMarkers()
{
    for (int i = 0; i < markers_.size(); i++)
    {
        updateSingleMarker(markers_[i].get());
    }
}

void MapViewerEngine::clearAllMarkers()
{
    for (int i = 0; i < markers_.size(); i++)
    {
        removeMesh(markers_[i]);
    }
    markers_.clear();
}

int MapViewerEngine::getMarkerIndexById(int id)
{
    int i = 0;
    while (i < markers_.size() && markers_[i]->getId() != id)
    {
        i++;
    }
    int foundIndex = -1;
    if (i < markers_.size())
    {
        foundIndex = i;
    }

    return foundIndex;
}

void MapViewerEngine::addMarkerByUV(int id, float u, float v, const std::string &type, const std::string &textureUrl)
{
    if (isMapLoaded_ && !doesMarkerExist(id))
    {
        std::shared_ptr<MapMarker> marker = std::make_shared<MapMarker>(id, type, textureUrl, u, v, 0.04375f, 0.0625f);

        markers_.push_back(marker);
        addMesh(marker);

        updateSingleMarker(marker.get());
    }
    else
    {
        emscripten_console_error("Point with given id already exists!");
    }
}

void MapViewerEngine::changeMarkerType(int id, const std::string &type, const std::string &textureUrl)
{
    int index = getMarkerIndexById(id);
    if (index != -1)
    {
        markers_[index]->changeType(type, textureUrl);
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }
}

void MapViewerEngine::addMarker(int id, float screenX, float screenY, const std::string &type, const std::string &textureUrl)
{
    if (isMapLoaded_ && !doesMarkerExist(id))
    {
        float clickedU, clickedV;
        getUVAtScreenPosition(screenX, screenY, clickedU, clickedV);

        clickedU = clickedU - std::floor(clickedU);

        addMarkerByUV(id, clickedU, clickedV, type, textureUrl);
    }
    else
    {
        emscripten_console_error("Point with given id already exists!");
    }
}

void MapViewerEngine::moveMarkerToImageCoordinates(int id, int xCoordinate, int yCoordinate)
{
    int index = getMarkerIndexById(id);
    if (isMapLoaded_ && index != -1)
    {
        // convert to uv
        float newU = (float)xCoordinate / mapWidth_;
        float newV = (float)yCoordinate / mapHeight_;

        markers_[index]->setU(newU);
        markers_[index]->setV(newV);

        updateSingleMarker(markers_[index].get());
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }
}

void MapViewerEngine::moveMarkerToScreen(int id, float screenX, float screenY)
{
    int index = getMarkerIndexById(id);
    if (isMapLoaded_ && index != -1)
    {
        float newU, newV;
        getUVAtScreenPosition(screenX, screenY, newU, newV);

        newU = newU - std::floor(newU);

        markers_[index]->setU(newU);
        markers_[index]->setV(newV);

        updateSingleMarker(markers_[index].get());
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }
}

void MapViewerEngine::removeMarker(int id)
{
    int index = getMarkerIndexById(id);
    if (isMapLoaded_ && index != -1)
    {
        removeMesh(markers_[index]);
        markers_.erase(markers_.begin() + index);
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }
}

void MapViewerEngine::changeMarkerId(int oldId, int newId)
{
    int index = getMarkerIndexById(oldId);
    if (isMapLoaded_ && index != -1)
    {
        markers_[index]->setId(newId);
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }
}

bool MapViewerEngine::doesMarkerExist(int id)
{
    return getMarkerIndexById(id) != -1;
}

emscripten::val MapViewerEngine::getMarkerPosition(int id)
{
    emscripten::val imageCoordinates = emscripten::val::object();
    int index = getMarkerIndexById(id);
    if (isMapLoaded_ && index != -1)
    {
        float markerU = markers_[index]->getU();
        float markerV = markers_[index]->getV();
        // drop the integer part of the uvs
        float markerUFractional = markerU - std::floor(markerU);
        float markerVFractional = markerV - std::floor(markerV);

        // u v multiplied by image dimensions is the pixel coordinates
        // also we floor it to an integer because image pixels are integers
        int imageCoordinateX = std::floor(markerUFractional * mapWidth_);
        int imageCoordinateY = std::floor(markerVFractional * mapHeight_);
        imageCoordinates.set("x", imageCoordinateX);
        imageCoordinates.set("y", imageCoordinateY);
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }

    return imageCoordinates;
}

bool MapViewerEngine::doesPointOverlapMarker(MapMarker *marker, float x, float y)
{
    Vertex* vertices = marker->getVertices();

    float minX = vertices[TOP_LEFT].x;
    float maxX = vertices[TOP_RIGHT].x;
    float minY = vertices[BOTTOM_LEFT].y;
    float maxY = vertices[TOP_LEFT].y;

    // if x in [minX;maxX] and y in [minY;maxY] then the point overlaps the marker (rectangle)
    return minX <= x && x <= maxX &&
        minY <= y && y <= maxY;
}

int MapViewerEngine::getMarkerIdAtScreenCoords(int screenX, int screenY)
{
    int foundId = -1;
    if (isMapLoaded_)
    {
        // the plane starts at -1 and ends at 1
        // we have to turn the rangeRelative [0;screenSize] coordinate to [-1;1]
        // [0;screenSize] / screenSize => [0;1]
        // [0;1] * 2 => [0;2]
        // [0;2] - 1 => [-1;1]
        // also flip the y axis by subtracting it from 1
        float planeX = ((float)screenX / width_) * 2.0f - 1.0f;
        float planeY = 1.0f - ((float)screenY / height_) * 2.0f;

        // iterate backwards so the one on the top will be found first
        int i = markers_.size() - 1;
        while (i >= 0 && !doesPointOverlapMarker(markers_[i].get(), planeX, planeY))
        {
            i--;
        }
        if (i >= 0)
        {
            foundId = markers_[i]->getId();
        }
    }
    else
    {
        emscripten_console_error("A map is not yet loaded!");
    }
    return foundId;
}

std::string MapViewerEngine::getMarkerType(int id)
{

    std::string type = "";
    int index = getMarkerIndexById(id);
    if (isMapLoaded_ && index != -1)
    {
        type = markers_[index]->getType();
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }

    return type;
}

MapViewerEngine::MapViewerEngine(const std::string &canvasID, int width, int height)
    : Engine(canvasID)
{
    setShadingMode(Shaders::SHADINGMODE::NO_SHADING);
    setProjectionType(PROJECTIONTYPE::ORTHOGRAPHIC);
    setZoom(5.0f / 23.0f);

    mapWidth_ = -1.0f;
    mapHeight_ = -1.0f;
    isMapLoaded_ = false;
    width_ = width;
    height_ = height;
    renderer_->setDefaultColor(255.0f, 0.0f, 255.0f);
    // set image dimension to 1:1 aspect ratio so it only covers the plane
    scene_->getCamera()->setImageDimensions(1.0f, 1.0f);

    // enable transparent background for marker
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    // disable depth mask so map markers are not overlapping
    glDepthMask(GL_FALSE);

    zoomLevel_ = settings_.minZoom;

    renderer_->setImageDimensions(width_, height_);

    createMapPlane();
}

MapViewerEngine::~MapViewerEngine()
{
    clearAllMarkers();
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
        updateAllMarkers();
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
            updateAllMarkers();
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

        float currentScreenCenterU = (vertices[TOP_LEFT].u + vertices[BOTTOM_RIGHT].u) * 0.5f;
        float currentScreenCenterV = (vertices[TOP_LEFT].v + vertices[BOTTOM_RIGHT].v) * 0.5f;

        zoomMapUV(zoomAmount, currentScreenCenterU, currentScreenCenterV);
    }
    else
    {
        emscripten_console_error("Plane was destroyed!");
    }
}

void MapViewerEngine::loadMap(const std::string & url, int mapWidth, int mapHeight, emscripten::val onSuccess, emscripten::val onError)
{
    if (mapPlane_ != nullptr)
    {
        loadTextureFromUrl(url, 0, onSuccess, onError);
        mapWidth_ = mapWidth;
        mapHeight_ = mapHeight;
        fitMapHorizontally();
        mapPlane_->setUpOpenGL();
        isMapLoaded_ = true;
        updateAllMarkers();
    }
    else
    {
        emscripten_console_error("Plane was destroyed!");
    }
}

void MapViewerEngine::loadMap(const std::string & url, int mapWidth, int mapHeight)
{
    loadMap(url, mapWidth, mapHeight, emscripten::val::undefined(), emscripten::val::undefined());
}

void MapViewerEngine::fitMapHorizontally()
{
    Vertex *vertices = mapPlane_->getVertices();

    float mapAspectRatio = (float)mapWidth_ / mapHeight_;
    float screenAspectRatio = ((float)width_ / height_) / mapAspectRatio;

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
        updateAllMarkers();
    }
    else
    {
        emscripten_console_error("Plane was destroyed!");
    }
}
