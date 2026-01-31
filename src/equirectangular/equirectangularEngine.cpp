#include <emscripten/html5.h>
#include <emscripten/emscripten.h>
#ifdef DEBUG
#include <emscripten/console.h>
#endif
#include <emscripten/val.h>
#include <string>
#include <cmath>
#include <cstdint>
#include <memory>

#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"
#include "core/resources/texture.h"

#include "core/engine.h"

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
        int *currentRequestID);
}

Mesh *EquirectangularEngine::generateSphereSegment(int rings, int segments, float radius,
                                                   float uMin, float uMax, float vMin, float vMax)
{
    Mesh *mesh = new Mesh((rings + 1) * (segments + 1), rings * segments * 6);
    Vertex *vertices = mesh->getVertices();

    int count = 0;
    // latitutes, vertical
    for (int lat = 0; lat <= rings; lat++)
    {
        // the latitude progress on the sphere in this loop ranges [0;1]
        float vProgress = (float)lat / rings;

        // remap [0;1] to [vMin; vMax] by linearly interpolating
        // also
        // 0 <= vMin <= 1
        // 0 <= vMax <= 1
        float vGlobal = MathUtils::interpolation(vMin, vMax, vProgress);

        // multiplied by pi spherical coordinates theta ranges [0;PI]
        // where 0 is north pole
        // PI/2 is equator
        // PI is south pole
        float theta = vGlobal * M_PI;
        float sinTheta = sin(theta);
        float cosTheta = cos(theta);

        // longitudes, horizontal
        for (int lon = 0; lon <= segments; lon++)
        {
            // the longitude progress on the sphere in this loop ranges [0;1]
            float uProgress = (float)lon / segments;

            // remap [0;1] to [uMin; uMax] by linearly interpolating
            float uGlobal = MathUtils::interpolation(uMin, uMax, uProgress);

            // multiplied by 2*pi spherical coordinates phi ranges [0;2*PI]
            // full circle
            float phi = uGlobal * 2.0f * M_PI;
            float sinPhi = sin(phi);
            float cosPhi = cos(phi);

            // spherical coordinates to cartesian coordinates
            float x = cosPhi * sinTheta;
            float y = cosTheta;
            float z = sinPhi * sinTheta;

            Vertex vert;
            vert.x = x * radius;
            vert.y = y * radius;
            vert.z = z * radius;
            vert.w = 1.0f;

            // normals pointing inwards for view from inside
            vert.nx = -x;
            vert.ny = -y;
            vert.nz = -z;

            // store the local uvs so whole texture spans just this segment
            vert.u = uProgress;
            vert.v = vProgress;

            vertices[count++] = vert;
        }
    }

    uint32_t *indices = mesh->getIndices();
    count = 0;
    for (int lat = 0; lat < rings; lat++)
    {
        for (int lon = 0; lon < segments; lon++)
        {
            // 1d array indexing latitudes are stored in blocks
            // so lat * (segments + 1) + long
            //          the rings size + place in the ring
            int first = (lat * (segments + 1)) + lon;
            // second is one ring below first
            int second = first + segments + 1;

            indices[count++] = first;
            indices[count++] = second;
            indices[count++] = first + 1;

            indices[count++] = second;
            indices[count++] = second + 1;
            indices[count++] = first + 1;
        }
    }

    return mesh;
}

void EquirectangularEngine::generateSphere()
{
    int rings = 32;
    int segs = 32;
    float rad = 10.0f;

    const int tiles = currMode_;
    const float rec = 1.0f / (float)tiles;
    int i = 0;

    clearScene();
    for (int x = 0; x < tiles; x++)
    {
        for (int y = 0; y < tiles; y++)
        {
            Mesh *sphereSegment = generateSphereSegment(rings / tiles, segs / tiles, rad, rec * x, rec * (x + 1), rec * y, rec * (y + 1));
            Materials::Material defaultMat = Materials::Material::Error();
            defaultMat.setTexture(imageTiles_[i].get());
            sphereSegment->setMaterial(defaultMat);
            addMesh(sphereSegment);
            i++;
        }
    }
}

EquirectangularEngine::EquirectangularEngine(const std::string &canvasID) : Engine(canvasID)
{
    setShadingMode(Shaders::SHADINGMODE::NO_SHADING);

    currentRequestID = 0;
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
    currentRequestID++;
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
    equirectangularFromURL(url.c_str(), ctx, tiles, textureIds.as_handle(), onSuccess.as_handle(), onError.as_handle(), currentRequestID, &currentRequestID);
}

void EquirectangularEngine::loadEquirectangularImage(const std::string &url, int width, int height, emscripten::val onSuccess, emscripten::val onError)
{
    int ctx = emscripten_webgl_get_current_context();

    if (ctx > 0)
    {
        currentRequestID++;
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
            if (maxTextureSize >= width && maxTextureSize >= height)
            {
            #ifdef DEBUG
                emscripten_console_log("full");
            #endif
                changeImageMode(EQUIRECTANGULARMODE::FULL);
            }
            else
            {
                if (maxTextureSize >= width / 2 && maxTextureSize >= height / 2)
                {
                #ifdef DEBUG
                    emscripten_console_log("2x2");
                #endif
                    changeImageMode(EQUIRECTANGULARMODE::SPLIT_2X2);
                }
                else
                {
                #ifdef DEBUG
                    emscripten_console_log("4x4");
                #endif
                    changeImageMode(EQUIRECTANGULARMODE::SPLIT_4X4);
                }
            }
            uploadTiles(url, ctx, onSuccess, onError);
        }
    }
}
