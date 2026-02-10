#include <string>
#include <cstring>

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

MapMarker::MapMarker(int id, const std::string &type, const std::string &textureUrl, float u, float v, float width, float height) : Mesh(4, 6)
{
    id_ = id;
    u_ = u;
    v_ = v;
    type_ = type;
    width_ = width;
    height_ = height;
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

    texture->loadFromUrl(textureUrl);

    Materials::Material newTexMat = getMaterial();
    newTexMat.setTexture(texture);
    setMaterial(newTexMat);
}

MapMarker::~MapMarker()
{
}

void MapMarker::changeType(const std::string &type, const std::string &textureUrl)
{
    type_ = type;
    Texture *texture = getMaterial().getTexture();
    texture->clear();
    texture->loadFromUrl(textureUrl);
}
