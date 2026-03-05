#include <string>
#include <cstring>
#include <cmath>
#include <vector>
#include <GLES3/gl3.h>

#include "core/math/vector.h"

#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"
#include "core/resources/texture.h"

#include "mapViewer/mapMarker.h"

constexpr int MAX_MARKER_REPETITIONS = 10; // Cap to prevent geometry overflow

enum VertexIndex
{
    TOP_LEFT = 0,
    TOP_RIGHT = 1,
    BOTTOM_LEFT = 2,
    BOTTOM_RIGHT = 3
};

MapMarker::MapMarker(int id, const std::string &textureUrl, float u, float v, float width, float height) : Mesh(4 * MAX_MARKER_REPETITIONS, 6 * MAX_MARKER_REPETITIONS)
{
    id_ = id;
    u_ = u;
    v_ = v;
    width_ = width;
    height_ = height;
    selectable_ = true;
    fixedToMap_ = false;
    rotation_ = 0.0f;

    Vertex vertices[4 * MAX_MARKER_REPETITIONS];

    for (int i = 0; i < MAX_MARKER_REPETITIONS; ++i)
    {
        int markerRepetitionId = i * 4;
        //                                             x        y     z     w     nx    ny    nz    u     v
        vertices[markerRepetitionId + TOP_LEFT] = { -10.0f,  -10.0f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f };
        vertices[markerRepetitionId + TOP_RIGHT] = { -10.0f,  -10.0f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, 1.0f, 0.0f };
        vertices[markerRepetitionId + BOTTOM_LEFT] = { -10.0f, -10.0f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 1.0f };
        vertices[markerRepetitionId + BOTTOM_RIGHT] = { -10.0f, -10.0f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, 1.0f, 1.0f };
    }

    uint32_t indices[6 * MAX_MARKER_REPETITIONS];
    int indicesIndex = 0;
    for (int i = 0; i < MAX_MARKER_REPETITIONS; ++i)
    {
        int markerRepetitionId = i * 4;
        indices[indicesIndex++] = markerRepetitionId + TOP_RIGHT;
        indices[indicesIndex++] = markerRepetitionId + BOTTOM_LEFT;
        indices[indicesIndex++] = markerRepetitionId + TOP_LEFT;
        indices[indicesIndex++] = markerRepetitionId + TOP_RIGHT;
        indices[indicesIndex++] = markerRepetitionId + BOTTOM_RIGHT;
        indices[indicesIndex++] = markerRepetitionId + BOTTOM_LEFT;
    }

    std::memcpy(getVertices(), vertices, sizeof(vertices));
    std::memcpy(getIndices(), indices, sizeof(indices));

    Texture *texture = new Texture(true);
    TextureOptions textureOptions;
    textureOptions.wrapS = GL_CLAMP_TO_EDGE;
    textureOptions.wrapT = GL_CLAMP_TO_EDGE;
    textureOptions.magFilter = GL_LINEAR;
    textureOptions.minFilter = GL_LINEAR;
    texture->setOptions(textureOptions);

    texture->loadFromUrl(textureUrl);

    Materials::Material newTexMat = getMaterial();
    newTexMat.setTexture(texture);
    setMaterial(newTexMat);
}

MapMarker::~MapMarker()
{
}

void MapMarker::changeTexture(const std::string &textureUrl)
{
    Texture *texture = getMaterial().getTexture();
    texture->clear();
    texture->loadFromUrl(textureUrl);
}

void MapMarker::updateRenderPosition(const std::vector<Vec2> &positions, float screenWidth, float screenHeight, float totalMapWidth, float totalMapHeight, float mapRatioPerPixelX, float mapRatioPerPixelY)
{
    Vertex* vertices = getVertices();

    float markerWidthInScreenPixels;
    float markerHeightInScreenPixels;

    bool isMapValid = (totalMapWidth > 0.0f && totalMapHeight > 0.0f);
    bool isZoomValid = (mapRatioPerPixelX > 0.0f && mapRatioPerPixelY > 0.0f);

    if (isFixedToMap_ && isMapValid && isZoomValid)
    {
        float markerWidthU = width_ / totalMapWidth;
        float markerHeightU = height_ / totalMapHeight;

        markerWidthInScreenPixels = markerWidthU / mapRatioPerPixelX;
        markerHeightInScreenPixels = markerHeightU / mapRatioPerPixelY;
    }
    else
    {
        markerWidthInScreenPixels = width_;
        markerHeightInScreenPixels = height_;
    }

    float normalizedHalfWidth = markerWidthInScreenPixels / screenWidth;
    float normalizedFullHeight = (markerHeightInScreenPixels / screenHeight) * 2.0f;

    float cosine = 1.0f;
    float sine = 0.0f;

    if (rotation_ != 0.0f)
    {
        cosine = cos(rotation_);
        sine = sin(rotation_);
    }

    // Pre-calculate vector components for width and height
    // rotation formula: 
    // x' = x*cos - y*sin
    // y' = x*sin + y*cos
    // x' = widthCosine - widthSine
    // y' = heightSine + heightCosine
    float widthCosine = normalizedHalfWidth * cosine;
    float widthSine = normalizedHalfWidth * sine;
    float heightCosine = normalizedFullHeight * cosine;
    float heightSine = normalizedFullHeight * sine;

    for (int i = 0; i < MAX_MARKER_REPETITIONS; ++i)
    {
        int markerRepetitionId = i * 4;

        if (i < positions.size())
        {
            float planeX = positions[i].x;
            float planeY = positions[i].y;

            // left side is -half and right side is +half so it is centered along the x axis
            // and add the whole height to the top so the bottom starts at the given coordinates
            if (rotation_ != 0.0f)
            {
                // rotation formula: 
                // x' = x*cos - y*sin
                // y' = x*sin + y*cos

                // left is -normalizedHalfWidth so it is -widthCosine (-w, +h)
                // x' = -x*cos - y*sin 
                vertices[markerRepetitionId + TOP_LEFT].x = planeX - widthCosine - heightSine;
                vertices[markerRepetitionId + TOP_LEFT].y = planeY - widthSine + heightCosine;

                // both half width and height is positive so it is standard rotation formula (+w, +h)
                vertices[markerRepetitionId + TOP_RIGHT].x = planeX + widthCosine - heightSine;
                vertices[markerRepetitionId + TOP_RIGHT].y = planeY + widthSine + heightCosine;

                // we only add the height to top so here y is 0
                // bottom left (-w, 0) is -normalizedHalfWidth
                vertices[markerRepetitionId + BOTTOM_LEFT].x = planeX - widthCosine;
                vertices[markerRepetitionId + BOTTOM_LEFT].y = planeY - widthSine;

                // bottom right (+w, 0)
                vertices[markerRepetitionId + BOTTOM_RIGHT].x = planeX + widthCosine;
                vertices[markerRepetitionId + BOTTOM_RIGHT].y = planeY + widthSine;
            }
            else
            {
                // center x around calculated coordinate
                vertices[markerRepetitionId + TOP_LEFT].x = planeX - normalizedHalfWidth;
                vertices[markerRepetitionId + TOP_RIGHT].x = planeX + normalizedHalfWidth;
                vertices[markerRepetitionId + BOTTOM_LEFT].x = planeX - normalizedHalfWidth;
                vertices[markerRepetitionId + BOTTOM_RIGHT].x = planeX + normalizedHalfWidth;

                // put the bottom to the given coordinate
                // so the markers bottom middle point marks the point
                vertices[markerRepetitionId + TOP_LEFT].y = planeY + normalizedFullHeight;
                vertices[markerRepetitionId + TOP_RIGHT].y = planeY + normalizedFullHeight;
                vertices[markerRepetitionId + BOTTOM_LEFT].y = planeY;
                vertices[markerRepetitionId + BOTTOM_RIGHT].y = planeY;
            }
        }
        else
        {
            // hide unused offscreen
            for (int j = 0; j < 4; ++j)
            {
                vertices[markerRepetitionId + j].x = -10.0f;
                vertices[markerRepetitionId + j].y = -10.0f;
            }
        }
    }

    // update gpu
    setUpOpenGL();
}

bool MapMarker::doesPointOverlapRepetition(float pointX, float pointY, int repetitionIndex)
{
    float minX = vertices_[repetitionIndex * 4 + TOP_LEFT].x;
    float maxX = vertices_[repetitionIndex * 4 + TOP_RIGHT].x;
    float minY = vertices_[repetitionIndex * 4 + BOTTOM_LEFT].y;
    float maxY = vertices_[repetitionIndex * 4 + TOP_LEFT].y;

    // if pointX in [minX;maxX] and y in [minY;maxY] then the point overlaps the marker (rectangle)
    return (minX <= pointX && pointX <= maxX && minY <= pointY && pointY <= maxY);
}

bool MapMarker::doesPointOverlap(float pointX, float pointY)
{
    int i = 0;
    while (i < MAX_MARKER_REPETITIONS && !doesPointOverlapRepetition(pointX, pointY, i))
    {
        i++;
    }
    return i < MAX_MARKER_REPETITIONS;
}
