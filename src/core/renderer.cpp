#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/html5.h>
#include <emscripten/html5_webgl.h>
#include <GLES3/gl3.h>
#include <core/renderer.h>
#include "core/shader.h"
#include "core/scene.h"
#include "core/material.h"
#include "core/camera.h"
#include "core/distantLight.h"
#include "core/mesh.h"
#include "utils/mathUtils.h"
#include "utils/fpsCounter.h"
#include "core/vertex.h"
#include <cstring>
#include <map>

Renderer::Renderer(std::string &canvasID)
{
    imageWidth_ = 100;
    imageHeight_ = 100;
    rBuffer_ = 0.0f;
    gBuffer_ = 0.0f;
    bBuffer_ = 0.0f;
    currShadingMode_ = Shaders::SHADINGMODE::GOURAUD;
    EmscriptenWebGLContextAttributes attrs;
    emscripten_webgl_init_context_attributes(&attrs);
    attrs.majorVersion = 2;
    int ctx = emscripten_webgl_create_context(("#" + canvasID).c_str(), &attrs);
    if (!ctx)
    {
        EM_ASM(
            throw('A böngésződ nem támogatja a WebGL-t!'););
    }
    emscripten_webgl_make_context_current(ctx);
    glClearColor(rBuffer_, gBuffer_, bBuffer_, 1);

    glGenBuffers(1, &ubo_);
    glBindBuffer(GL_UNIFORM_BUFFER, ubo_);
    glBufferData(GL_UNIFORM_BUFFER, 128, NULL, GL_STATIC_DRAW);
    glBindBuffer(GL_UNIFORM_BUFFER, 0);
    glBindBufferRange(GL_UNIFORM_BUFFER, 0, ubo_, 0, sizeof(SceneData));

    createShadingPrograms(ubo_);
    shaderPrograms_[currShadingMode_]->use(); 

    glEnable(GL_DEPTH_TEST);

    fps = new fpsCounter();
}

void Renderer::createShadingPrograms(GLuint ubo)
{
    shaderPrograms_[Shaders::SHADINGMODE::GOURAUD] =
        std::make_unique<Shaders::Shader>("shaders/gouraud.vert", "shaders/gouraud.frag", ubo);
    shaderPrograms_[Shaders::SHADINGMODE::TEXTURE] =
        std::make_unique<Shaders::Shader>("shaders/texture.vert", "shaders/texture.frag", ubo);
}

void Renderer::setShadingMode(Shaders::SHADINGMODE shadingMode)
{
    currShadingMode_ = shadingMode;
    shaderPrograms_[currShadingMode_]->use();
}

void Renderer::setImageDimensions(int imageW, int imageH)
{
    imageWidth_ = imageW;
    imageHeight_ = imageH;
}

void Renderer::render(const Scene *scene)
{
    fps->update();
    SceneData currSceneData;
    // camera
    Camera *mainCamera = scene->getCamera();
    currSceneData.camPos[0] = mainCamera->getXPosition();
    currSceneData.camPos[1] = mainCamera->getYPosition();
    currSceneData.camPos[2] = mainCamera->getZPosition();
    mainCamera->updateViewMatrix();
    MathUtils::multiplyMatrix(mainCamera->getViewMatrix(), mainCamera->getProjMatrix(), currSceneData.MVP);

    // light
    DistantLight *sun = scene->getLight();
    float ambientLight = scene->getAmbientLight();
    float lightVec[3];
    const float *lightDir = sun->getDirection();
    currSceneData.lightVec[0] = -lightDir[0];
    currSceneData.lightVec[1] = -lightDir[1];
    currSceneData.lightVec[2] = -lightDir[2];

    currSceneData.lightColor[0] = 255.0f;
    currSceneData.lightColor[1] = 255.0f;
    currSceneData.lightColor[2] = 255.0f;
    currSceneData.ambientLight = 0.0f;

    glBindBuffer(GL_UNIFORM_BUFFER, ubo_);
    glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(SceneData), &currSceneData);
    glBindBuffer(GL_UNIFORM_BUFFER, 0);

    Mesh *mesh = scene->getMesh();
    Materials::Material meshMat = mesh->getMaterial();
    Materials::Color meshCol = meshMat.albedo;
    float rGround = meshCol.r;
    float gGround = meshCol.g;
    float bGround = meshCol.b;

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glBindVertexArray(mesh->getVAO());

    glDrawElements(GL_TRIANGLES, mesh->getIndexCount(), GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}
