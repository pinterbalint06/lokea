#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include <GLES3/gl3.h>
#include <vector>
#include <cmath>
#include <string>
#include "core/mesh.h"
#include "core/scene.h"
#include "core/vertex.h"
#include "core/renderer.h"
#include "core/material.h"
#include "core/shader.h"
#include "core/camera.h"
#include "core/texture.h"
#include "core/engine.h"

Engine *engine = nullptr;
int start = 0;

Mesh *generateSphere(int rings, int segments, float radius)
{
    Mesh *mesh = new Mesh((rings + 1) * (segments + 1), rings * segments * 6);
    Vertex *vertices = mesh->getVertices();

    int count = 0;
    for (int lat = 0; lat <= rings; lat++)
    {
        float theta = lat * M_PI / rings;
        float sinTheta = sin(theta);
        float cosTheta = cos(theta);

        for (int lon = 0; lon <= segments; lon++)
        {
            float phi = lon * 2.0f * M_PI / segments;
            float sinPhi = sin(phi);
            float cosPhi = cos(phi);

            float x = cosPhi * sinTheta;
            float y = cosTheta;
            float z = sinPhi * sinTheta;

            Vertex vert;
            vert.x = x * radius;
            vert.y = y * radius;
            vert.z = z * radius;
            vert.w = 1.0f;
            vert.nx = -x;
            vert.ny = -y;
            vert.nz = -z;
            float u = (float)lon / segments;
            float v = (float)lat / rings;
            vert.u = u;
            vert.v = v;

            vertices[count++] = vert;
        }
    }
    uint32_t *indices = mesh->getIndices();

    count = 0;
    for (int lat = 0; lat < rings; lat++)
    {
        for (int lon = 0; lon < segments; lon++)
        {
            int first = (lat * (segments + 1)) + lon;
            int second = first + segments + 1;

            // first triangle
            indices[count++] = first;
            indices[count++] = second;
            indices[count++] = first + 1;

            // second triangle
            indices[count++] = second;
            indices[count++] = second + 1;
            indices[count++] = first + 1;
        }
    }

    mesh->setMaterial(Materials::Material::Grass());

    return mesh;
}

void init()
{
    std::string canvasID = "canvas";
    engine = new Engine(canvasID);
    engine->setShadingMode(Shaders::SHADINGMODE::NO_SHADING);
    engine->addMesh(generateSphere(32, 32, 10.0f));
}

void rotateCamera(float dPitch, float dYaw)
{
    if (engine)
    {
        engine->rotateCamera(dPitch, dYaw);
    }
}

int initTexture(int width, int height)
{
    uint8_t *textureRet = nullptr;
    if (engine)
    {
        textureRet = engine->initTexture(width, height);
    }
    return (int)textureRet;
}

void uploadTextureToGPU()
{
    if (engine)
    {
        engine->uploadTextureToGPU();
    }
}

void render()
{
    if (engine)
    {
        engine->render();
    }
}

void changeFocalLength(float focal)
{
    if (engine)
    {
        engine->setFocalLength(focal);
    }
}

void startRenderingLoop()
{
    if (start == 0)
    {
        emscripten_set_main_loop(render, 0, 0);
        start++;
    }
}

EMSCRIPTEN_BINDINGS(my_module)
{
    emscripten::function("init", &init);
    emscripten::function("xyForog", &rotateCamera);
    emscripten::function("initTexture", &initTexture);
    emscripten::function("render", &render);
    emscripten::function("changeFocalLength", &changeFocalLength);
    emscripten::function("startRenderingLoop", &startRenderingLoop);
    emscripten::function("uploadTextureToGPU", &uploadTextureToGPU);
}
