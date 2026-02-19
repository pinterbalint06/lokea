#include <string>
#include <cstring>
#include <cmath>
#include <GLES3/gl3.h>

#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"
#include "core/resources/texture.h"

#include "mapViewer/mapMarker.h"

enum VertexIndex
{
    TOP_LEFT = 0,
    TOP_RIGHT = 1,
    BOTTOM_LEFT = 2,
    BOTTOM_RIGHT = 3
};

MapMarker::MapMarker(int id, const std::string &textureUrl, float u, float v, float width, float height) : Mesh(4, 6)
{
    id_ = id;
    u_ = u;
    v_ = v;
    width_ = width;
    height_ = height;
    rotation_ = 0.0f;
    Vertex vertices[4];
    //                        x      y     z     w     nx    ny    nz    u     v
    vertices[TOP_LEFT] = { 0.0f,  0.0f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f };
    vertices[TOP_RIGHT] = { 0.0f,  0.0f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, 1.0f, 0.0f };
    vertices[BOTTOM_LEFT] = { 0.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, 0.0f, 1.0f };
    vertices[BOTTOM_RIGHT] = { 0.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, 1.0f, 1.0f };

    constexpr uint32_t indices[] = {
            TOP_RIGHT, BOTTOM_LEFT, TOP_LEFT,
            TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT
    };

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

void MapMarker::updateRenderPosition(float planeX, float planeY, float screenWidth, float screenHeight)
{
    Vertex* vertices = getVertices();

    // calculate half width to be able to center it along the x axis
    float halfinPlaneWidth = width_ / screenWidth;
    float inPlaneHeight = (height_ / screenHeight) * 2.0f;


    // left side is -half and right side is +half so it is centered alng the x axis
    // and add the height to both bottom and top so it starts at the given coordinate
    if (rotation_ != 0.0f)
    {
        float cosine = cos(rotation_);
        float sine = sin(rotation_);

        // Pre-calculate vector components for width and height
        float widthCosine = halfinPlaneWidth * cosine;
        float widthSine = halfinPlaneWidth * sine;
        float heightCosine = inPlaneHeight * cosine;
        float heightSine = inPlaneHeight * sine;

        // rotation formula: 
        // x' = x*cos - y*sin
        // y' = x*sin + y*cos
        // left is -halfinPlaneWidth so it is -widthCosine (-w, +h)
        // x' = -x*cos - y*sin 
        vertices[TOP_LEFT].x = planeX - widthCosine - heightSine;
        vertices[TOP_LEFT].y = planeY - widthSine + heightCosine;

        // both half width and height is added to this so it is standard rotation formula (+w, +h)
        vertices[TOP_RIGHT].x = planeX + widthCosine - heightSine;
        vertices[TOP_RIGHT].y = planeY + widthSine + heightCosine;

        // we only add the height to top so here y is 0
        // bottom left (-w, 0) is -halfinPlaneWidth and +
        vertices[BOTTOM_LEFT].x = planeX - widthCosine;
        vertices[BOTTOM_LEFT].y = planeY - widthSine;

        // bottom right (+w, 0)
        vertices[BOTTOM_RIGHT].x = planeX + widthCosine;
        vertices[BOTTOM_RIGHT].y = planeY + widthSine;
    }
    else
    {
        // center x around calculated coordinate
        vertices[TOP_LEFT].x = planeX - halfinPlaneWidth;
        vertices[TOP_RIGHT].x = planeX + halfinPlaneWidth;
        vertices[BOTTOM_LEFT].x = planeX - halfinPlaneWidth;
        vertices[BOTTOM_RIGHT].x = planeX + halfinPlaneWidth;

        // put the bottom to the click not centered around
        // so the markers bottom middle point marks the point
        vertices[TOP_LEFT].y = planeY + inPlaneHeight;
        vertices[TOP_RIGHT].y = planeY + inPlaneHeight;
        vertices[BOTTOM_LEFT].y = planeY;
        vertices[BOTTOM_RIGHT].y = planeY;
    }

    // update gpu
    setUpOpenGL();
}
