#include <emscripten/html5.h>
#include <emscripten/emscripten.h>
#include <emscripten/console.h>
#include <emscripten/val.h>
#include <string>
#include <cmath>
#include <cstdint>
#include <memory>

#include "core/math/vector.h"
#include "core/rendering/shader.h"
#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"
#include "core/resources/texture.h"

#include "core/engine.h"

#include "equirectangular/arrow.h"
#include "equirectangular/equirectangularEngine.h"

#include "core/math/mathUtils.h"

extern "C"
{
    extern void equirectangularFromURL(
        const char *url,
        int ctxId,
        int tiles,
        emscripten::EM_VAL textureIdsHandle,
        emscripten::EM_VAL onSuccessHandle,
        emscripten::EM_VAL onErrorHandle,
        int requestID,
        int *currentRequestId);
}

std::shared_ptr<Mesh> EquirectangularEngine::generateSphereSegment(int rings, int segments, float radius,
                                                   float uMin, float uMax, float vMin, float vMax)
{
    std::shared_ptr<Mesh> mesh = std::make_shared<Mesh>((rings + 1) * (segments + 1), rings * segments * 6);
    std::vector<Vertex> &vertices = mesh->getVertices();

    int vertexIndex = 0;
    // latitudes, horizontal
    for (int lat = 0; lat <= rings; lat++)
    {
        // 0.0 to 1.0
        float latitudeProgress = static_cast<float>(lat) / rings;

        // [0.0; 1.0] to the [vMin; vMax]
        float mappedLatitude = MathUtils::interpolation(vMin, vMax, latitudeProgress);

        // [0; PI].
        // 0 north pole, pi/2 equator, and pi south pole.
        float polarAngle = mappedLatitude * M_PI;

        // longitudes, vertical
        for (int lon = 0; lon <= segments; lon++)
        {
            // 0.0 to 1.0
            float longitudeProgress = static_cast<float>(lon) / segments;

            // [0.0; 1.0] to the [uMin; uMax]
            float mappedLongitude = MathUtils::interpolation(uMin, uMax, longitudeProgress);

            // [0; 2*PI].
            // a full circle around the y axis
            float azimuthalAngle = mappedLongitude * MathUtils::TWO_PI;

            // convert spherical coordinates to cartesian (x, y, z) coordinates
            Vec3 position = MathUtils::sphericalToCartesian(polarAngle, azimuthalAngle, radius);

            Vertex vert;
            vert.x = position.x;
            vert.y = position.y;
            vert.z = position.z;

            // store UVs
            vert.u = longitudeProgress;
            vert.v = latitudeProgress;

            vertices[vertexIndex++] = vert;
        }
    }

    std::vector<uint32_t> &indices = mesh->getIndices();
    int indexCount = 0;

    for (int lat = 0; lat < rings; lat++)
    {
        for (int lon = 0; lon < segments; lon++)
        {
            // 1d array indexing latitudes are stored in blocks
            // so lat * (segments + 1) + long
            //          the rings size + place in the ring
            int currentVertexIndex = (lat * (segments + 1)) + lon;

            // second is one ring below first
            int nextRowVertexIndex = currentVertexIndex + segments + 1;

            // first triangle of the quad
            indices[indexCount++] = currentVertexIndex;
            indices[indexCount++] = nextRowVertexIndex;
            indices[indexCount++] = currentVertexIndex + 1;

            // second triangle of the quad
            indices[indexCount++] = nextRowVertexIndex;
            indices[indexCount++] = nextRowVertexIndex + 1;
            indices[indexCount++] = currentVertexIndex + 1;
        }
    }

    return mesh;
}

void EquirectangularEngine::generateSphere()
{
    int rings = EQUIRECTANGULAR_SETTINGS.sphereRingCount;
    int segs = EQUIRECTANGULAR_SETTINGS.sphereSegmentCount;
    float rad = EQUIRECTANGULAR_SETTINGS.sphereRadius;

    const int tileCountPerAxis = currMode_;
    const float tileUvSpan = 1.0f / static_cast<float>(tileCountPerAxis);
    int i = 0;

    clearScene();
    for (int x = 0; x < tileCountPerAxis; x++)
    {
        for (int y = 0; y < tileCountPerAxis; y++)
        {
            std::shared_ptr<Mesh> sphereSegment = generateSphereSegment(
                rings / tileCountPerAxis,
                segs / tileCountPerAxis,
                rad,
                tileUvSpan * x,
                tileUvSpan * (x + 1),
                tileUvSpan * y,
                tileUvSpan * (y + 1));
            Materials::Material defaultMat = Materials::Material::Error();
            defaultMat.setTexture(imageTiles_[i]);
            sphereSegment->setMaterial(defaultMat);
            addMesh(sphereSegment);
            i++;
        }
    }
}

EquirectangularEngine::EquirectangularEngine(const std::string &canvasID) : Engine(canvasID)
{
    setShadingMode(Shaders::SHADINGMODE::NO_SHADING);
    enableAlphaBlending();

    currentRequestId_ = 0;
    const int maxTextures = 16;
    imageTiles_.reserve(maxTextures);
    for (int i = 0; i < maxTextures; i++)
    {
        imageTiles_.push_back(std::make_shared<Texture>());
    }

    currMode_ = EQUIRECTANGULARMODE::FULL;
    generateSphere();
}

EquirectangularEngine::~EquirectangularEngine()
{
    currentRequestId_++;
}

void EquirectangularEngine::changeImageMode(EQUIRECTANGULARMODE mode)
{
    if (mode != currMode_)
    {
        currMode_ = mode;
        generateSphere();
    }
}

void EquirectangularEngine::uploadTiles(const std::string &url, int ctx, emscripten::val onSuccess, emscripten::val onError)
{
    int tiles = currMode_;
    emscripten::val textureIds = emscripten::val::global("Uint32Array").new_(tiles * tiles);

    for (size_t i = 0; i < tiles * tiles; i++)
    {
        textureIds.set(i, imageTiles_[i]->getTextureIndex());
    }
    equirectangularFromURL(url.c_str(), ctx, tiles, textureIds.as_handle(), onSuccess.as_handle(), onError.as_handle(), currentRequestId_, &currentRequestId_);
}

void EquirectangularEngine::loadEquirectangularImage(const std::string &url, int width, int height, emscripten::val onSuccess, emscripten::val onError)
{
    int ctx = emscripten_webgl_get_current_context();

    if (ctx > 0)
    {
        currentRequestId_++;
        GLint maxTextureSize = 0;
        glGetIntegerv(GL_MAX_TEXTURE_SIZE, &maxTextureSize);
        if (maxTextureSize < width / 4 || maxTextureSize < height / 4)
        {
            // if can't fit textures generate one whole sphere
            changeImageMode(EQUIRECTANGULARMODE::FULL);
            // set its material to the error material
            scene_->getMesh(0)->setMaterial(Materials::Material::Error());
        }
        else
        {
            EQUIRECTANGULARMODE nextMode = EQUIRECTANGULARMODE::FULL;
            if (maxTextureSize >= width && maxTextureSize >= height)
            {
            #ifdef DEBUG
                emscripten_console_log("full");
            #endif
            }
            else
            {
                if (maxTextureSize >= width / 2 && maxTextureSize >= height / 2)
                {
                #ifdef DEBUG
                    emscripten_console_log("2x2");
                #endif
                    nextMode = EQUIRECTANGULARMODE::SPLIT_2X2;
                }
                else
                {
                #ifdef DEBUG
                    emscripten_console_log("4x4");
                #endif
                    nextMode = EQUIRECTANGULARMODE::SPLIT_4X4;
                }
            }

            changeImageMode(nextMode);
            uploadTiles(url, ctx, onSuccess, onError);
        }
    }
}

void EquirectangularEngine::clearImage()
{
    currentRequestId_++;
    changeImageMode(EQUIRECTANGULARMODE::FULL);

    for (int i = 0; i < imageTiles_.size(); i++)
    {
        imageTiles_[i]->clear();
    }
}

void EquirectangularEngine::clearArrows()
{
    for (int i = 0; i < arrows_.size(); i++)
    {
        removeMesh(arrows_[i]);
    }
    arrows_.clear();
}

int EquirectangularEngine::getArrowIndexById(int id)
{
    int i = 0;
    while (i < arrows_.size() && arrows_[i]->getId() != id)
    {
        i++;
    }
    int foundIndex = -1;
    if (i < arrows_.size())
    {
        foundIndex = i;
    }

    return foundIndex;
}

void EquirectangularEngine::addArrow(int id, float yaw)
{
    if (getArrowIndexById(id) == -1)
    {
        std::shared_ptr<Arrow> newArrow = std::make_shared<Arrow>(id, yaw);

        arrows_.push_back(newArrow);

        addMesh(newArrow);
    }
    else
    {
        emscripten_console_error("Arrow with given id already exists!");
    }
}

bool EquirectangularEngine::doesArrowExist(int id)
{
    return getArrowIndexById(id) != -1;
}

void EquirectangularEngine::removeArrow(int id)
{
    int index = getArrowIndexById(id);
    if (index != -1)
    {
        removeMesh(arrows_[index]);
        arrows_.erase(arrows_.begin() + index);
    }
    else
    {
        emscripten_console_error("Arrow with given id doesn't exist!");
    }
}

void EquirectangularEngine::changeArrowDirection(int id, float yaw)
{
    int index = getArrowIndexById(id);
    if (index != -1)
    {
        arrows_[index]->setYaw(yaw);
    }
    else
    {
        emscripten_console_error("Arrow with given id doesn't exist!");
    }
}

bool EquirectangularEngine::isValidClick(const Vec3 &clickDirection, bool isSingleClick, bool &outIsDirectArrowClick)
{
    outIsDirectArrowClick = (clickDirection.y <= EQUIRECTANGULAR_SETTINGS.directArrowClickMaxY &&
                             clickDirection.y >= EQUIRECTANGULAR_SETTINGS.directArrowClickMinY);

    bool isHorizonClick = (std::abs(clickDirection.y) <= EQUIRECTANGULAR_SETTINGS.horizonClickMaxAbsoluteY);

    return isSingleClick ? outIsDirectArrowClick : (outIsDirectArrowClick || isHorizonClick);
}

int EquirectangularEngine::findClosestArrowInDirection(const Vec3 &clickDirection, bool isDirectArrowClick)
{
    Vec2 horizontalDirection(clickDirection.x, clickDirection.z);
    horizontalDirection.normalize();

    float highestDotProduct =
        isDirectArrowClick
        ? EQUIRECTANGULAR_SETTINGS.directClickDotProductThreshold
        : EQUIRECTANGULAR_SETTINGS.horizonClickDotProductThreshold;
    int bestArrowId = -1;

    for (int i = 0; i < arrows_.size(); i++)
    {
        Vec2 arrowDirection = arrows_[i]->getDirection();
        float currentDotProduct = Vec2::dotProduct(horizontalDirection, arrowDirection);

        if (currentDotProduct > highestDotProduct)
        {
            highestDotProduct = currentDotProduct;
            bestArrowId = arrows_[i]->getId();
        }
    }

    return bestArrowId;
}

int EquirectangularEngine::getClickedArrow(float screenX, float screenY, bool isSingleClick)
{
    Vec3 clickDirection = scene_->getCamera()->getClickRayVector(screenX, screenY);

#ifdef DEBUG
    emscripten_console_logf("Click direction: (%f, %f, %f)", clickDirection.x, clickDirection.y, clickDirection.z);
#endif

    bool isDirectArrowClick = false;
    bool isValid = isValidClick(clickDirection, isSingleClick, isDirectArrowClick);
    int clickedArrowId = -1;

    if (isValid)
    {
        clickedArrowId = findClosestArrowInDirection(clickDirection, isDirectArrowClick);
    }

    return clickedArrowId;
}
