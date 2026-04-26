#include <vector>
#include <cmath>
#include <memory>
#include <GLES3/gl3.h>

#include "core/math/vector.h"

#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"
#include "core/resources/texture.h"

#include "mapViewer/mapLine.h"

enum LineVertexIndex
{
    LINE_TOP_LEFT = 0,
    LINE_TOP_RIGHT = 1,
    LINE_BOTTOM_LEFT = 2,
    LINE_BOTTOM_RIGHT = 3
};

MapLine::MapLine(int id, int startMarkerId, int endMarkerId, float thickness, uint8_t r, uint8_t g, uint8_t b, uint8_t a)
    : Mesh(4, 6)
{
    id_ = id;
    startMarkerId_ = startMarkerId;
    endMarkerId_ = endMarkerId;
    thickness_ = thickness;

    std::vector<Vertex> &vertices = getVertices();

    float unitStartX = 0.0f;
    float unitEndX = 1.0f;
    float unitTopY = 0.5f;
    float unitBottomY = -0.5f;

    vertices[LINE_TOP_LEFT].x = unitStartX;
    vertices[LINE_TOP_LEFT].y = unitTopY;
    vertices[LINE_TOP_LEFT].z = -0.005f;
    vertices[LINE_TOP_LEFT].u = 0.0f;
    vertices[LINE_TOP_LEFT].v = 0.0f;

    vertices[LINE_TOP_RIGHT].x = unitEndX;
    vertices[LINE_TOP_RIGHT].y = unitTopY;
    vertices[LINE_TOP_RIGHT].z = -0.005f;
    vertices[LINE_TOP_RIGHT].u = 0.0f;
    vertices[LINE_TOP_RIGHT].v = 0.0f;

    vertices[LINE_BOTTOM_LEFT].x = unitStartX;
    vertices[LINE_BOTTOM_LEFT].y = unitBottomY;
    vertices[LINE_BOTTOM_LEFT].z = -0.005f;
    vertices[LINE_BOTTOM_LEFT].u = 0.0f;
    vertices[LINE_BOTTOM_LEFT].v = 0.0f;

    vertices[LINE_BOTTOM_RIGHT].x = unitEndX;
    vertices[LINE_BOTTOM_RIGHT].y = unitBottomY;
    vertices[LINE_BOTTOM_RIGHT].z = -0.005f;
    vertices[LINE_BOTTOM_RIGHT].u = 0.0f;
    vertices[LINE_BOTTOM_RIGHT].v = 0.0f;

    std::vector<uint32_t> &indices = getIndices();
    indices = { LINE_TOP_RIGHT, LINE_BOTTOM_LEFT, LINE_TOP_LEFT, LINE_TOP_RIGHT, LINE_BOTTOM_RIGHT, LINE_BOTTOM_LEFT };

    Materials::Material lineMaterial = Materials::Material(Materials::Color::fromRGBA(r, g, b, a));
    setMaterial(lineMaterial);
}

MapLine::~MapLine()
{
}

void MapLine::updateLineGeometry(const std::vector<Vec2> &startPositions, const std::vector<Vec2> &endPositions, float screenWidth, float screenHeight)
{
    if (startPositions.size() > 0 && endPositions.size() > 0)
    {
        const Vec2 clipDifference = endPositions[0] - startPositions[0];

        // clip space -> pixel conversion:
        // clip space is [-1;1] so length is 2
        // 1 clip space is half the screen's pixels
        const float pixelsPerClipX = screenWidth / 2.0f;
        const float pixelsPerClipY = screenHeight / 2.0f;

        const float pixelDifferenceX = clipDifference.x * pixelsPerClipX;
        const float pixelDifferenceY = clipDifference.y * pixelsPerClipY;

        const float lengthInPixels = std::sqrt(
            (pixelDifferenceX * pixelDifferenceX) +
            (pixelDifferenceY * pixelDifferenceY));

        if (lengthInPixels > 0.0001f)
        {
            const float angleRadians = std::atan2(pixelDifferenceY, pixelDifferenceX);

            const Mat4 scaleToPixels = Mat4::scale(lengthInPixels, thickness_, 1.0f);
            const Mat4 rotation = Mat4::rotationZ(angleRadians);

            const float clipPerPixelX = 2.0f / screenWidth;
            const float clipPerPixelY = 2.0f / screenHeight;

            const Mat4 scaleToClipSpace = Mat4::scale(clipPerPixelX, clipPerPixelY, 1.0f);

            meshData_.modelMatrix = scaleToPixels * rotation * scaleToClipSpace;
        }

        setInstances(startPositions);
        setUpOpenGL();
    }
}

void MapLine::setColor(uint8_t r, uint8_t g, uint8_t b, uint8_t a)
{
    Materials::Material mat = getMaterial();
    mat.setColor(Materials::Color::fromRGBA(r, g, b, a));
    setMaterial(mat);
}

void MapLine::rewriteEndpointMarkerId(int oldMarkerId, int newMarkerId)
{
    if (startMarkerId_ == oldMarkerId)
    {
        startMarkerId_ = newMarkerId;
    }
    else
    {
        if (endMarkerId_ == oldMarkerId)
        {
            endMarkerId_ = newMarkerId;
        }
    }
}
