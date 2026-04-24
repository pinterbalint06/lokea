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

constexpr int MAX_LINE_REPETITIONS = 10;

enum LineVertexIndex
{
    LINE_TOP_LEFT = 0,
    LINE_TOP_RIGHT = 1,
    LINE_BOTTOM_LEFT = 2,
    LINE_BOTTOM_RIGHT = 3
};

MapLine::MapLine(int id, int startMarkerId, int endMarkerId, float thickness, uint8_t r, uint8_t g, uint8_t b, uint8_t a)
    : Mesh(4 * MAX_LINE_REPETITIONS, 6 * MAX_LINE_REPETITIONS)
{
    id_ = id;
    startMarkerId_ = startMarkerId;
    endMarkerId_ = endMarkerId;
    thickness_ = thickness;

    Vertex vertices[4 * MAX_LINE_REPETITIONS];

    // initialize with zero z is -0.005 so it is between the markers and the map
    // hiding all lines off-screen initially
    for (int i = 0; i < MAX_LINE_REPETITIONS; i++)
    {
        int vIdx = i * 4;
        //                                   x        y        z      w     u     v
        vertices[vIdx + LINE_TOP_LEFT] = { -10.0f, -10.0f, -0.005f,  1.0f, 0.0f, 0.0f };
        vertices[vIdx + LINE_TOP_RIGHT] = { -10.0f, -10.0f, -0.005f, 1.0f, 0.0f, 0.0f };
        vertices[vIdx + LINE_BOTTOM_LEFT] = { -10.0f, -10.0f, -0.005f, 1.0f, 0.0f, 0.0f };
        vertices[vIdx + LINE_BOTTOM_RIGHT] = { -10.0f, -10.0f, -0.005f, 1.0f, 0.0f, 0.0f };
    }

    uint32_t indices[6 * MAX_LINE_REPETITIONS];
    for (int i = 0; i < MAX_LINE_REPETITIONS; i++)
    {
        int vIdx = i * 4;
        int iIdx = i * 6;
        indices[iIdx + 0] = vIdx + LINE_TOP_RIGHT;
        indices[iIdx + 1] = vIdx + LINE_BOTTOM_LEFT;
        indices[iIdx + 2] = vIdx + LINE_TOP_LEFT;
        indices[iIdx + 3] = vIdx + LINE_TOP_RIGHT;
        indices[iIdx + 4] = vIdx + LINE_BOTTOM_RIGHT;
        indices[iIdx + 5] = vIdx + LINE_BOTTOM_LEFT;
    }

    std::memcpy(getVertices(), vertices, sizeof(vertices));
    std::memcpy(getIndices(), indices, sizeof(indices));

    Materials::Material lineMaterial = Materials::Material(Materials::Color::fromRGBA(r, g, b, a));
    setMaterial(lineMaterial);
}

MapLine::~MapLine()
{
}

void MapLine::updateLineGeometry(const std::vector<Vec2> &startPositions, const std::vector<Vec2> &endPositions, float screenWidth, float screenHeight)
{
    Vertex* vertices = getVertices();

    // thickness relative to screensize
    float halfThicknessX = thickness_ / screenWidth;
    float halfThicknessY = thickness_ / screenHeight;

    for (int i = 0; i < MAX_LINE_REPETITIONS; i++)
    {
        int lineRepetitionId = i * 4;

        if (i < startPositions.size() && i < endPositions.size())
        {
            // vector from start to end
            Vec2 lineVector = endPositions[i] - startPositions[i];

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
                vertices[lineRepetitionId + LINE_TOP_LEFT].x = startPositions[i].x + normalVector.x;
                vertices[lineRepetitionId + LINE_TOP_LEFT].y = startPositions[i].y + normalVector.y;

                // starting point - normalVector
                vertices[lineRepetitionId + LINE_BOTTOM_LEFT].x = startPositions[i].x - normalVector.x;
                vertices[lineRepetitionId + LINE_BOTTOM_LEFT].y = startPositions[i].y - normalVector.y;

                // ending point + normalVector
                vertices[lineRepetitionId + LINE_TOP_RIGHT].x = endPositions[i].x + normalVector.x;
                vertices[lineRepetitionId + LINE_TOP_RIGHT].y = endPositions[i].y + normalVector.y;

                // ending point - normalVector
                vertices[lineRepetitionId + LINE_BOTTOM_RIGHT].x = endPositions[i].x - normalVector.x;
                vertices[lineRepetitionId + LINE_BOTTOM_RIGHT].y = endPositions[i].y - normalVector.y;
            }
        }
        else
        {
            // hide unused offscreen
            for (int j = 0; j < 4; j++)
            {
                vertices[lineRepetitionId + j].x = -10.0f;
                vertices[lineRepetitionId + j].y = -10.0f;
            }
        }
    }

    // update GPU
    setUpOpenGL();
}

void MapLine::setColor(uint8_t r, uint8_t g, uint8_t b, uint8_t a)
{
    Materials::Material mat = getMaterial();
    mat.setColor(Materials::Color::fromRGBA(r, g, b, a));
    setMaterial(mat);
}
