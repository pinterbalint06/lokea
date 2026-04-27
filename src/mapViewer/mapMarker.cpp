#include <string>
#include <vector>
#include <memory>
#include <GLES3/gl3.h>

#include "core/math/vector.h"

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
    selectable_ = true;
    fixedToMap_ = false;
    rotation_ = 0.0f;

    std::vector<Vertex> &vertices = getVertices();

    float unitLeftX = -0.5f;
    float unitRightX = 0.5f;
    float unitTopY = 1.0f;
    float unitBottomY = 0.0f;

    vertices[TOP_LEFT].x = unitLeftX;
    vertices[TOP_LEFT].y = unitTopY;
    vertices[TOP_LEFT].z = 0.0f;
    vertices[TOP_LEFT].u = 0.0f;
    vertices[TOP_LEFT].v = 0.0f;

    vertices[TOP_RIGHT].x = unitRightX;
    vertices[TOP_RIGHT].y = unitTopY;
    vertices[TOP_RIGHT].z = 0.0f;
    vertices[TOP_RIGHT].u = 1.0f;
    vertices[TOP_RIGHT].v = 0.0f;

    vertices[BOTTOM_LEFT].x = unitLeftX;
    vertices[BOTTOM_LEFT].y = unitBottomY;
    vertices[BOTTOM_LEFT].z = 0.0f;
    vertices[BOTTOM_LEFT].u = 0.0f;
    vertices[BOTTOM_LEFT].v = 1.0f;

    vertices[BOTTOM_RIGHT].x = unitRightX;
    vertices[BOTTOM_RIGHT].y = unitBottomY;
    vertices[BOTTOM_RIGHT].z = 0.0f;
    vertices[BOTTOM_RIGHT].u = 1.0f;
    vertices[BOTTOM_RIGHT].v = 1.0f;


    std::vector<uint32_t> &indices = getIndices();
    indices = { TOP_RIGHT, BOTTOM_LEFT, TOP_LEFT, TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT };

    std::shared_ptr<Texture> texture = std::make_shared<Texture>(true, true);
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
    std::shared_ptr<Texture> texture = getMaterial().getTexture();
    if (texture)
    {
        texture->clear();
        texture->loadFromUrl(textureUrl);
    }
}

void MapMarker::updateRenderPosition(const std::vector<Vec2> &positions, float screenWidth, float screenHeight, float totalMapWidth, float totalMapHeight, float mapRatioPerPixelX, float mapRatioPerPixelY)
{
    float markerWidthPixels;
    float markerHeightPixels;

    bool isMapDimensionsValid = (totalMapWidth > 0.0f && totalMapHeight > 0.0f);
    bool isZoomValid = (mapRatioPerPixelX > 0.0f && mapRatioPerPixelY > 0.0f);

    if (fixedToMap_ && isMapDimensionsValid && isZoomValid)
    {
        float markerWidthInUV = width_ / totalMapWidth;
        float markerHeightInUV = height_ / totalMapHeight;

        markerWidthPixels = markerWidthInUV / mapRatioPerPixelX;
        markerHeightPixels = markerHeightInUV / mapRatioPerPixelY;
    }
    else
    {
        markerWidthPixels = width_;
        markerHeightPixels = height_;
    }

    float clipSpacePerPixelX = 2.0f / screenWidth;
    float clipSpacePerPixelY = 2.0f / screenHeight;

    Mat4 scaleToPixelDimensions = Mat4::scale(markerWidthPixels, markerHeightPixels, 1.0f);

    Mat4 applyRotation = Mat4::rotationZ(rotation_);

    Mat4 scaleToClipSpace = Mat4::scale(clipSpacePerPixelX, clipSpacePerPixelY, 1.0f);

    meshData_.modelMatrix = scaleToPixelDimensions * applyRotation * scaleToClipSpace;

    setInstances(positions);
    setUpOpenGL();
}

bool MapMarker::doesPointOverlapRepetition(float pointX, float pointY, int repetitionIndex)
{
    bool overlaps = false;
    int repetitionCount = instanceOffsets_.size();

    if (repetitionIndex >= 0 && repetitionIndex < repetitionCount)
    {
        int cornerIndices[4];
        cornerIndices[0] = TOP_LEFT;
        cornerIndices[1] = TOP_RIGHT;
        cornerIndices[2] = BOTTOM_LEFT;
        cornerIndices[3] = BOTTOM_RIGHT;

        std::vector<Vertex> &vertices = getVertices();
        const Vec2 &instanceOffset = instanceOffsets_[repetitionIndex];

        Vec2 rightAxis(meshData_.modelMatrix[0], meshData_.modelMatrix[1]);
        Vec2 upAxis(meshData_.modelMatrix[4], meshData_.modelMatrix[5]);
        Vec2 translation(meshData_.modelMatrix[12], meshData_.modelMatrix[13]);

        float boundingBoxMinX = 0.0f;
        float boundingBoxMaxX = 0.0f;
        float boundingBoxMinY = 0.0f;
        float boundingBoxMaxY = 0.0f;

        for (int i = 0; i < 4; i++)
        {
            float unitVertexX = vertices[cornerIndices[i]].x;
            float unitVertexY = vertices[cornerIndices[i]].y;

            float transformedX = (unitVertexX * rightAxis.x) + (unitVertexY * upAxis.x) + translation.x;
            float transformedY = (unitVertexX * rightAxis.y) + (unitVertexY * upAxis.y) + translation.y;

            float finalScreenPositionX = transformedX + instanceOffset.x;
            float finalScreenPositionY = transformedY + instanceOffset.y;

            if (i == 0)
            {
                boundingBoxMinX = finalScreenPositionX;
                boundingBoxMaxX = finalScreenPositionX;
                boundingBoxMinY = finalScreenPositionY;
                boundingBoxMaxY = finalScreenPositionY;
            }
            else
            {
                if (finalScreenPositionX < boundingBoxMinX)
                {
                    boundingBoxMinX = finalScreenPositionX;
                }
                else
                {
                    if (finalScreenPositionX > boundingBoxMaxX)
                    {
                        boundingBoxMaxX = finalScreenPositionX;
                    }
                }

                if (finalScreenPositionY < boundingBoxMinY)
                {
                    boundingBoxMinY = finalScreenPositionY;
                }
                else
                {
                    if (finalScreenPositionY > boundingBoxMaxY)
                    {
                        boundingBoxMaxY = finalScreenPositionY;
                    }
                }
            }
        }

        bool isInsideHorizontalLimits = (pointX >= boundingBoxMinX && pointX <= boundingBoxMaxX);
        bool isInsideVerticalLimits = (pointY >= boundingBoxMinY && pointY <= boundingBoxMaxY);

        overlaps = (isInsideHorizontalLimits && isInsideVerticalLimits);
    }

    return overlaps;
}

bool MapMarker::doesPointOverlap(float pointX, float pointY)
{
    int repetitionCount = static_cast<int>(instanceOffsets_.size());
    int i = 0;
    while (i < repetitionCount && !doesPointOverlapRepetition(pointX, pointY, i))
    {
        i++;
    }
    return i < repetitionCount;
}
