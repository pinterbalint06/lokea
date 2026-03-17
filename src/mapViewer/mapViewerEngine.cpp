#include <emscripten/val.h>
#include <emscripten/html5.h>
#include <emscripten/console.h>
#include <string>
#include <cstring>
#include <vector>
#include <algorithm>
#include <cmath>
#include <GLES3/gl3.h>

#include "core/rendering/shader.h"

#include "core/math/mathUtils.h"
#include "core/math/vector.h"

#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"
#include "core/resources/texture.h"

#include "core/scene/camera/camera.h"

#include "core/engine.h"

#include "mapViewer/mapViewerSettings.h"
#include "mapViewer/mapViewerEngine.h"
#include "mapViewer/mapMarker.h"
#include "mapViewer/mapLine.h"

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

        Materials::Material mat = Materials::Material::Error();
        Texture *mapTexture = new Texture();
        TextureOptions options = TextureStyle::Default;
        options.wrapT = GL_CLAMP_TO_EDGE;
        mat.setTexture(mapTexture);
        mapPlane_->setMaterial(mat);

        recalculateUVPerPixel();
        addMesh(mapPlane_);
    }
}

void MapViewerEngine::updateSingleMarker(MapMarker *mapMarker)
{
    if (mapMarker && mapPlane_)
    {
        std::vector<Vec2> positions;

        Vertex* mapVertices = mapPlane_->getVertices();
        float minMapU = mapVertices[TOP_LEFT].u;
        float minMapV = mapVertices[TOP_LEFT].v;
        float uRange = mapVertices[TOP_RIGHT].u - minMapU;
        float vRange = mapVertices[BOTTOM_LEFT].v - minMapV;

        float u = mapMarker->getU();
        float v = mapMarker->getV();

        float distanctToLeftEdge = minMapU - u;
        int startOffset = std::floor(distanctToLeftEdge);

        float distanctToRightEdge = minMapU + uRange - u;
        int endOffset = std::ceil(distanctToRightEdge);

        for (int offset = startOffset; offset <= endOffset; offset++)
        {
            float wrappedU = u + offset;
            float inRangeRelativeU = (wrappedU - minMapU) / uRange;
            float inRangeRelativeV = (v - minMapV) / vRange;

            float planeX = (inRangeRelativeU * 2.0f) - 1.0f;
            float planeY = 1.0f - (inRangeRelativeV * 2.0f);

            positions.push_back(Vec2(planeX, planeY));
        }

        mapMarker->updateRenderPosition(positions, (float)width_, (float)height_, (float)mapWidth_, (float)mapHeight_, uPerPixel_, vPerPixel_);
    }
}

void MapViewerEngine::rotateMarker(int id, float angleRadians)
{
    int index = getMarkerIndexById(id);
    if (isMapLoaded_ && index != -1)
    {
        markers_[index]->setRotation(angleRadians);
        updateSingleMarker(markers_[index].get());
    }
}

void MapViewerEngine::updateAllMarkers()
{
    for (int i = 0; i < markers_.size(); i++)
    {
        updateSingleMarker(markers_[i].get());
    }
    updateAllLines();
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

int MapViewerEngine::getLineIndexById(int id)
{
    int i = 0;
    while (i < lines_.size() && lines_[i]->getId() != id)
    {
        i++;
    }
    int foundIndex = -1;
    if (i < lines_.size())
    {
        foundIndex = i;
    }

    return foundIndex;
}

void MapViewerEngine::addMarkerByUV(int id, float u, float v, const std::string &textureUrl, float width, float height)
{
    if (isMapLoaded_ && !doesMarkerExist(id))
    {
        std::shared_ptr<MapMarker> marker = std::make_shared<MapMarker>(id, textureUrl, u, v, width, height);

        markers_.push_back(marker);
        addMesh(marker);

        updateSingleMarker(marker.get());
    }
    else
    {
        emscripten_console_error("Point with given id already exists!");
    }
}

void MapViewerEngine::changeMarkerTexture(int id, const std::string &textureUrl)
{
    int index = getMarkerIndexById(id);
    if (index != -1)
    {
        markers_[index]->changeTexture(textureUrl);
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }
}

void MapViewerEngine::resizeMarker(int id, float newWidth, float newHeight)
{
    int index = getMarkerIndexById(id);
    if (index != -1)
    {
        markers_[index]->setWidth(newWidth);
        markers_[index]->setHeight(newHeight);
        updateSingleMarker(markers_[index].get());
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }

}

void MapViewerEngine::addMarker(int id, float screenX, float screenY, const std::string &textureUrl, float width, float height)
{
    if (isMapLoaded_ && !doesMarkerExist(id))
    {
        float clickedU, clickedV;
        getUVAtScreenPosition(screenX, screenY, clickedU, clickedV);

        clickedU = clickedU - std::floor(clickedU);

        addMarkerByUV(id, clickedU, clickedV, textureUrl, width, height);
    }
    else
    {
        emscripten_console_error("Point with given id already exists!");
    }
}

void MapViewerEngine::addMarkerByImageCoordinates(int id, float imageX, float imageY, const std::string &textureUrl, float width, float height)
{
    if (isMapLoaded_ && !doesMarkerExist(id))
    {
        float UCoord = imageX / mapWidth_;
        float VCoord = imageY / mapHeight_;

        addMarkerByUV(id, UCoord, VCoord, textureUrl, width, height);
    }
    else
    {
        emscripten_console_error("Point with given id already exists!");
    }
}

void MapViewerEngine::moveMarkerToImageCoordinates(int id, int xCoordinate, int yCoordinate)
{
    // convert to uv
    float newU = (float)xCoordinate / mapWidth_;
    float newV = (float)yCoordinate / mapHeight_;

    moveMarkerToUV(id, newU, newV);
}

void MapViewerEngine::moveMarkerToUV(int id, float u, float v)
{
    int index = getMarkerIndexById(id);
    if (isMapLoaded_ && index != -1)
    {
        markers_[index]->setU(u);
        markers_[index]->setV(v);

        updateSingleMarker(markers_[index].get());
        updateLinesWithMarker(id);
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
        updateLinesWithMarker(id);
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

void MapViewerEngine::removeLine(int id)
{
    int index = getLineIndexById(id);
    if (isMapLoaded_ && index != -1)
    {
        removeMesh(lines_[index]);
        lines_.erase(lines_.begin() + index);
    }
    else
    {
        emscripten_console_error("Line doesn't exist!");
    }
}

bool MapViewerEngine::isAlreadyConnected(int markerId1, int markerId2)
{
    int i = 0;
    while (
        i < lines_.size()
        &&
        !(
            (lines_[i]->getStartMarkerId() == markerId1 && lines_[i]->getEndMarkerId() == markerId2) ||
            (lines_[i]->getStartMarkerId() == markerId2 && lines_[i]->getEndMarkerId() == markerId1)
            )
    )
    {
        i++;
    }
    return i < lines_.size();
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

void MapViewerEngine::setMarkerSelectable(int id, bool selectable)
{
    int index = getMarkerIndexById(id);
    if (isMapLoaded_ && index != -1)
    {
        markers_[index]->setSelectable(selectable);
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }
}

void MapViewerEngine::setMarkerFixedToMap(int id, bool fixedToMap)
{
    int index = getMarkerIndexById(id);
    if (isMapLoaded_ && index != -1)
    {
        markers_[index]->setFixedToMap(fixedToMap);
        updateSingleMarker(markers_[index].get());
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }
}

emscripten::val MapViewerEngine::getCenterOffsetByImageCoords(float imageX, float imageY)
{
    emscripten::val offset = emscripten::val::object();
    if (isMapLoaded_ && mapPlane_ != nullptr)
    {
        // target UV coords
        float targetU = imageX / mapWidth_;
        float targetV = imageY / mapHeight_;

        Vertex *vertices = mapPlane_->getVertices();

        // curruent center UV coords
        float currentCenterU = (vertices[TOP_LEFT].u + vertices[TOP_RIGHT].u) * 0.5f;
        float currentCenterV = (vertices[TOP_LEFT].v + vertices[BOTTOM_LEFT].v) * 0.5f;

        // find the closest repeating map on the U axis to prevent jumping
        float distanceToCenterU = currentCenterU - targetU;
        float closestMapStart = std::round(distanceToCenterU);
        float wrappedTargetU = targetU + closestMapStart;

        float diffU = wrappedTargetU - currentCenterU;
        float diffV = targetV - currentCenterV;

        // convert back to pixel
        float deltaX = diffU / uPerPixel_;
        float deltaY = diffV / vPerPixel_;

        offset.set("x", deltaX);
        offset.set("y", deltaY);
    }
    else
    {
        offset.set("x", 0.0f);
        offset.set("y", 0.0f);
    }
    return offset;
}

bool MapViewerEngine::doesMarkerExist(int id)
{
    return getMarkerIndexById(id) != -1;
}

bool MapViewerEngine::doesLineExist(int id)
{
    return getLineIndexById(id) != -1;
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
        imageCoordinates.set("u", markerUFractional);
        imageCoordinates.set("v", markerVFractional);
    }
    else
    {
        emscripten_console_error("Point doesn't exist!");
    }

    return imageCoordinates;
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
        while (i >= 0 && !(markers_[i]->doesPointOverlap(planeX, planeY) && markers_[i]->isSelectable()))
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
    renderer_->setDefaultColor(168.0f, 129.0f, 202.0f);
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

void MapViewerEngine::UVToPlaneRelativeCoordinates(float u, float v, float &planeX, float &planeY)
{
    if (mapPlane_)
    {
        Vertex* mapVertices = mapPlane_->getVertices();

        float minMapU = mapVertices[TOP_LEFT].u;
        float minMapV = mapVertices[TOP_LEFT].v;
        // ranges
        float uRange = mapVertices[TOP_RIGHT].u - minMapU;
        float vRange = mapVertices[BOTTOM_LEFT].v - minMapV;

        // calculate which map to project to
        // it is put on the closest to the view center
        float currentCenterU = (mapVertices[TOP_LEFT].u + mapVertices[TOP_RIGHT].u) * 0.5f;

        float distanceToCenter = currentCenterU - u;

        float closestMapStart = std::round(distanceToCenter);
        float wrappedU = u + closestMapStart;

        // normalize to [0;1]
        float inRangeRelativeU = (wrappedU - minMapU) / uRange;
        float inRangeRelativeV = (v - minMapV) / vRange;

        // the plane starts at -1 and ends at 1
        // we have to turn the rangeRelative [0;1] coordinate to [-1;1]
        // [0;1] * 2 => [0;2]
        // [0;2] - 1 => [-1;1]
        // also flip the y axis by subtracting it from 1
        planeX = (inRangeRelativeU * 2.0f) - 1.0f;
        planeY = 1.0f - (inRangeRelativeV * 2.0f);
    }
}

void MapViewerEngine::connectMarkers(int id1, int id2, int lineId, float thickness, uint8_t r, uint8_t g, uint8_t b, uint8_t a)
{
    if (isMapLoaded_ && doesMarkerExist(id1) && doesMarkerExist(id2))
    {
        if (!isAlreadyConnected(id1, id2))
        {
            if (!doesLineExist(lineId))
            {
                std::shared_ptr<MapLine> line = std::make_shared<MapLine>(lineId, id1, id2, thickness, r, g, b, a);
                lines_.push_back(line);

                addMesh(line);

                updateSingleLine(line.get());
            }
            else
            {
                emscripten_console_error("Line with given ID already exists");
            }
        }
        else
        {
            emscripten_console_error("Markers are already connected");
        }
    }
    else
    {
        emscripten_console_error("Map not loaded or invalid marker ID");
    }
}

void MapViewerEngine::updateSingleLine(MapLine *line)
{
    int startMarkerId = line->getStartMarkerId();
    int endMarkerId = line->getEndMarkerId();

    int startMarkerIndex = getMarkerIndexById(startMarkerId);
    int endMarkerIndex = getMarkerIndexById(endMarkerId);
    if (startMarkerIndex != -1 && endMarkerIndex != -1)
    {
        MapMarker *startMarker = markers_[startMarkerIndex].get();
        MapMarker *endMarker = markers_[endMarkerIndex].get();

        float uStart = startMarker->getU();
        float vStart = startMarker->getV();
        float uEnd = endMarker->getU();
        float vEnd = endMarker->getV();

        Vertex* mapVertices = mapPlane_->getVertices();
        float minMapU = mapVertices[TOP_LEFT].u;
        float minMapV = mapVertices[TOP_LEFT].v;
        float uRange = mapVertices[TOP_RIGHT].u - minMapU;
        float vRange = mapVertices[BOTTOM_LEFT].v - minMapV;

        std::vector<Vec2> startPositions;
        std::vector<Vec2> endPositions;

        float minU = std::min(uStart, uEnd);
        float maxU = std::max(uStart, uEnd);

        // Find repetition loop bounds relative to visible extent
        float distanceToLeftEdge = minMapU - maxU;
        int startOffset = std::floor(distanceToLeftEdge);
        float distanceToRightEdge = minMapU + uRange - minU;
        int endOffset = std::ceil(distanceToRightEdge);

        for (int offset = startOffset; offset <= endOffset; offset++)
        {
            // starting point
            float wrappedU1 = uStart + offset;
            float inRangeRelativeU1 = (wrappedU1 - minMapU) / uRange;
            float inRangeRelativeV1 = (vStart - minMapV) / vRange;
            float planeX1 = (inRangeRelativeU1 * 2.0f) - 1.0f;
            float planeY1 = 1.0f - (inRangeRelativeV1 * 2.0f);
            startPositions.push_back(Vec2(planeX1, planeY1));

            // ending point
            float wrappedU2 = uEnd + offset;
            float inRangeRelativeU2 = (wrappedU2 - minMapU) / uRange;
            float inRangeRelativeV2 = (vEnd - minMapV) / vRange;
            float planeX2 = (inRangeRelativeU2 * 2.0f) - 1.0f;
            float planeY2 = 1.0f - (inRangeRelativeV2 * 2.0f);
            endPositions.push_back(Vec2(planeX2, planeY2));
        }

        line->updateLineGeometry(startPositions, endPositions, (float)width_, (float)height_);
    }
    else
    {
        emscripten_console_error("One of the endpoints of the line didn't exist");
    }
}

void MapViewerEngine::updateLinesWithMarker(int markerId)
{
    if (doesMarkerExist(markerId))
    {
        for (int i = 0; i < lines_.size(); i++)
        {
            if (lines_[i]->getStartMarkerId() == markerId || lines_[i]->getEndMarkerId() == markerId)
            {
                updateSingleLine(lines_[i].get());
            }
        }
    }
    else
    {
        emscripten_console_error("Marker with given ID doesn't exist");
    }
}

void MapViewerEngine::updateAllLines()
{
    if (mapPlane_)
    {
        for (int i = 0; i < lines_.size(); i++)
        {
            updateSingleLine(lines_[i].get());
        }
    }
}

void MapViewerEngine::clearAllLines()
{
    for (int i = 0; i < lines_.size(); i++)
    {
        removeMesh(lines_[i]);
    }
    lines_.clear();
}

void MapViewerEngine::changeLineColor(int lineId, uint8_t r, uint8_t g, uint8_t b, uint8_t a)
{
    int index = getLineIndexById(lineId);
    if (index != -1)
    {
        lines_[index]->setColor(r, g, b, a);
    }
    else
    {
        emscripten_console_error("Line with given ID doesn't exist");
    }
}