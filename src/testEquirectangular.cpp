#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include <vector>
#include <cmath>
#include "core/mesh.h"
#include "core/scene.h"
#include "core/vertex.h"
#include "core/renderer.h"
#include "core/material.h"
#include "core/shader.h"
#include "core/camera.h"

// Game engine
Renderer *renderer = nullptr;
Scene *scene = nullptr;

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
            vert.nx = -x;
            vert.ny = -y;
            vert.nz = -z;

            vertices[count++] = vert;
        }
    }
    int32_t *indices = mesh->getIndices();

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

void init(int size, float focal, float filmW, float filmH, int imageW, int imageH, float n, float f)
{
    renderer = new Renderer();
    scene = new Scene();
    renderer->setImageDimensions(imageW, imageH);
    scene->getCamera()->setPerspective(focal, filmW, filmH, imageW, imageH, n, f);
    renderer->setShadingMode(Shaders::SHADINGMODE::PHONG);
    scene->setMesh(generateSphere(32, 32, 40.0f));
    renderer->render(scene);
}

int getImageBufferLocation()
{
    int returnValue = 0;
    if (renderer)
    {
        returnValue = (int)renderer->getImageBuffer();
    }
    return returnValue;
}

void rotateCamera(float dM_PItch, float dYaw)
{
    if (scene && renderer)
    {
        scene->getCamera()->rotate(dM_PItch, dYaw);
        renderer->render(scene);
    }
}

EMSCRIPTEN_BINDINGS(my_module)
{
    emscripten::function("init", &init);
    emscripten::function("getImageLocation", &getImageBufferLocation);
    emscripten::function("xyForog", &rotateCamera);
}
