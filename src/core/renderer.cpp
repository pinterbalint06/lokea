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
    fps = new fpsCounter();
    createShadingPrograms();
    shaderPrograms_[currShadingMode_]->use();

    glEnable(GL_DEPTH_TEST);
}

void Renderer::createShadingPrograms()
{
    shaderPrograms_[Shaders::SHADINGMODE::GOURAUD] =
        std::make_unique<Shaders::Shader>("shaders/gouraud.vert", "shaders/gouraud.frag");
    shaderPrograms_[Shaders::SHADINGMODE::TEXTURE] =
        std::make_unique<Shaders::Shader>("shaders/texture.vert", "shaders/texture.frag");
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
    // camera
    Camera *mainCamera = scene->getCamera();
    float camX = mainCamera->getXPosition();
    float camY = mainCamera->getYPosition();
    float camZ = mainCamera->getZPosition();
    mainCamera->updateViewMatrix();
    float VP[16];
    MathUtils::multiplyMatrix(mainCamera->getViewMatrix(), mainCamera->getProjMatrix(), VP);

    // light
    DistantLight *sun = scene->getLight();
    float ambientLight = scene->getAmbientLight();
    float lightVec[3];
    const float *lightDir = sun->getDirection();
    lightVec[0] = -lightDir[0];
    lightVec[1] = -lightDir[1];
    lightVec[2] = -lightDir[2];

    Mesh *mesh = scene->getMesh();
    Materials::Material meshMat = mesh->getMaterial();
    Materials::Color meshCol = meshMat.albedo;
    float rGround = meshCol.r;
    float gGround = meshCol.g;
    float bGround = meshCol.b;

    // fpsCounter();

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    GLuint mvpLoc = glGetUniformLocation(shaderPrograms_[currShadingMode_]->getProgramID(), "uMVP");
    glUniformMatrix4fv(mvpLoc, 1, GL_FALSE, VP);

    glBindVertexArray(mesh->getVAO());

    glDrawElements(GL_TRIANGLES, mesh->getIndexCount(), GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}
