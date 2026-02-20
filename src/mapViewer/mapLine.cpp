#include <vector>
#include <cmath>
#include <cstring>
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

    Vertex vertices[4];
    // initialize with zero z is -0.005 so it is between the markers and the map
    //                        x      y      z     w     nx    ny    nz    u     v
    vertices[LINE_TOP_LEFT] = { 0.0f, 0.0f, -0.005f,  1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f };
    vertices[LINE_TOP_RIGHT] = { 0.0f, 0.0f, -0.005f, 1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f };
    vertices[LINE_BOTTOM_LEFT] = { 0.0f, 0.0f, -0.005f, 1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f };
    vertices[LINE_BOTTOM_RIGHT] = { 0.0f, 0.0f, -0.005f, 1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f };

    constexpr uint32_t indices[] = {
        LINE_TOP_RIGHT, LINE_BOTTOM_LEFT, LINE_TOP_LEFT,
        LINE_TOP_RIGHT, LINE_BOTTOM_RIGHT, LINE_BOTTOM_LEFT
    };

    std::memcpy(getVertices(), vertices, sizeof(vertices));
    std::memcpy(getIndices(), indices, sizeof(indices));

    // TODO: materialban alpha csatorna támogatása
    Materials::Material lineMaterial = Materials::Material(Materials::Color::fromRGB(180.0f, 100.0f, 255.0f), 1.0f, 0.0f, 1.0f);
    setMaterial(lineMaterial);
}

MapLine::~MapLine()
{
}

void MapLine::updateLineGeometry(float startX, float startY, float endX, float endY, float screenWidth, float screenHeight)
{
    Vertex* vertices = getVertices();

    // thickness relative to screensize
    float halfThicknessX = thickness_ / screenWidth;
    float halfThicknessY = thickness_ / screenHeight;

    // vector from start to end
    Vec2 lineVector = Vec2(endX - startX, endY - startY);

    // Length
    float vectorLength = lineVector.length();
    if (vectorLength > 0.0001f)
    {
        // normalize direction
        lineVector.normalize();

        // normal vector (-y, x) multiplied by the half thicknesses
        // we use the normal vector to create the thickness of the line
        Vec2 normalVector = Vec2(-lineVector.y * halfThicknessX, lineVector.x * halfThicknessY);

        // starting point + normalVector
        vertices[LINE_TOP_LEFT].x = startX + normalVector.x;
        vertices[LINE_TOP_LEFT].y = startY + normalVector.y;

        // starting point - normalVector
        vertices[LINE_BOTTOM_LEFT].x = startX - normalVector.x;
        vertices[LINE_BOTTOM_LEFT].y = startY - normalVector.y;

        // ending point + normalVector
        vertices[LINE_TOP_RIGHT].x = endX + normalVector.x;
        vertices[LINE_TOP_RIGHT].y = endY + normalVector.y;

        // ending point - normalVector
        vertices[LINE_BOTTOM_RIGHT].x = endX - normalVector.x;
        vertices[LINE_BOTTOM_RIGHT].y = endY - normalVector.y;
    }

    // update GPU
    setUpOpenGL();
}