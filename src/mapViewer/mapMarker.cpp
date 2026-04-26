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

constexpr int MAX_MARKER_REPETITIONS = 10;

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

    for (int i = 0; i < MAX_MARKER_REPETITIONS; i++)
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
    for (int i = 0; i < MAX_MARKER_REPETITIONS; i++)
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

    Texture *texture = new Texture(true, true);
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
    Texture *texture = getMaterial().getTexture();
    if (texture)
    {
        delete texture;
    }
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

    if (fixedToMap_ && isMapValid && isZoomValid)
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

    float planePerPixelX = 2.0f / screenWidth;
    float planePerPixelY = 2.0f / screenHeight;

    for (int i = 0; i < MAX_MARKER_REPETITIONS; i++)
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
                float halfWidthPx = markerWidthInScreenPixels * 0.5f;
                float fullHeightPx = markerHeightInScreenPixels;

                // rotation formula: 
                // x' = x*cos - y*sin
                // y' = x*sin + y*cos
                float topLeftX = (-halfWidthPx * cosine) - (fullHeightPx * sine);
                float topLeftY = (-halfWidthPx * sine) + (fullHeightPx * cosine);

                // both half width and height is positive so it is standard rotation formula (+w, +h)
                float topRightX = (halfWidthPx * cosine) - (fullHeightPx * sine);
                float topRightY = (halfWidthPx * sine) + (fullHeightPx * cosine);

                // we only add the height to top so here y is 0
                // bottom left (-w, 0) is -normalizedHalfWidth
                float bottomLeftX = -halfWidthPx * cosine;
                float bottomLeftY = -halfWidthPx * sine;

                // bottom right (+w, 0)
                float bottomRightX = halfWidthPx * cosine;
                float bottomRightY = halfWidthPx * sine;

                // left is -normalizedHalfWidth so it is -widthCosine (-w, +h)
                // x' = -x*cos - y*sin 
                float topLeftPlaneOffsetX = topLeftX * planePerPixelX;
                float topLeftPlaneOffsetY = topLeftY * planePerPixelY;

                vertices[markerRepetitionId + TOP_LEFT].x = planeX + topLeftPlaneOffsetX;
                vertices[markerRepetitionId + TOP_LEFT].y = planeY + topLeftPlaneOffsetY;

                float topRightPlaneOffsetX = topRightX * planePerPixelX;
                float topRightPlaneOffsetY = topRightY * planePerPixelY;

                vertices[markerRepetitionId + TOP_RIGHT].x = planeX + topRightPlaneOffsetX;
                vertices[markerRepetitionId + TOP_RIGHT].y = planeY + topRightPlaneOffsetY;

                float bottomLeftPlaneOffsetX = bottomLeftX * planePerPixelX;
                float bottomLeftPlaneOffsetY = bottomLeftY * planePerPixelY;

                vertices[markerRepetitionId + BOTTOM_LEFT].x = planeX + bottomLeftPlaneOffsetX;
                vertices[markerRepetitionId + BOTTOM_LEFT].y = planeY + bottomLeftPlaneOffsetY;

                float bottomRightPlaneOffsetX = bottomRightX * planePerPixelX;
                float bottomRightPlaneOffsetY = bottomRightY * planePerPixelY;

                vertices[markerRepetitionId + BOTTOM_RIGHT].x = planeX + bottomRightPlaneOffsetX;
                vertices[markerRepetitionId + BOTTOM_RIGHT].y = planeY + bottomRightPlaneOffsetY;
            }
            else
            {
                // center x around calculated coordinate
                float leftX = planeX - normalizedHalfWidth;
                float rightX = planeX + normalizedHalfWidth;

                vertices[markerRepetitionId + TOP_LEFT].x = leftX;
                vertices[markerRepetitionId + TOP_RIGHT].x = rightX;
                vertices[markerRepetitionId + BOTTOM_LEFT].x = leftX;
                vertices[markerRepetitionId + BOTTOM_RIGHT].x = rightX;

                // put the bottom to the given coordinate
                // so the markers bottom middle point marks the point
                float topY = planeY + normalizedFullHeight;
                float bottomY = planeY;

                vertices[markerRepetitionId + TOP_LEFT].y = topY;
                vertices[markerRepetitionId + TOP_RIGHT].y = topY;
                vertices[markerRepetitionId + BOTTOM_LEFT].y = bottomY;
                vertices[markerRepetitionId + BOTTOM_RIGHT].y = bottomY;
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
    int offset = repetitionIndex * 4;

    int cornerIndices[4];
    cornerIndices[0] = TOP_LEFT;
    cornerIndices[1] = TOP_RIGHT;
    cornerIndices[2] = BOTTOM_LEFT;
    cornerIndices[3] = BOTTOM_RIGHT;

    float minX = vertices_[offset + cornerIndices[0]].x;
    float maxX = vertices_[offset + cornerIndices[0]].x;
    float minY = vertices_[offset + cornerIndices[0]].y;
    float maxY = vertices_[offset + cornerIndices[0]].y;

    for (int i = 1; i < 4; i++)
    {
        float vX = vertices_[offset + cornerIndices[i]].x;
        float vY = vertices_[offset + cornerIndices[i]].y;

        if (vX < minX)
        {
            minX = vX;
        }
        if (vX > maxX)
        {
            maxX = vX;
        }

        if (vY < minY)
        {
            minY = vY;
        }
        if (vY > maxY)
        {
            maxY = vY;
        }
    }

    // if pointX in [minX;maxX] and y in [minY;maxY] then the point overlaps the marker (rectangle)
    return (pointX >= minX && pointX <= maxX && pointY >= minY && pointY <= maxY);
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
