#include <emscripten/emscripten.h>
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
#include "utils/perlin.h"
#include "core/vertex.h"
#include "core/texture.h"
#include <cstring>
#include <map>

Renderer::Renderer(const std::string &canvasID)
{
    rBuffer_ = 0.0f;
    gBuffer_ = 0.0f;
    bBuffer_ = 0.0f;
    currShadingMode_ = Shaders::SHADINGMODE::PHONG;
    EmscriptenWebGLContextAttributes attrs;
    emscripten_webgl_init_context_attributes(&attrs);
    attrs.majorVersion = 2;
    ctx_ = emscripten_webgl_create_context(("#" + canvasID).c_str(), &attrs);
    if (!ctx_)
    {
        EM_ASM(
            throw('A böngésződ nem támogatja a WebGL-t!'););
    }
    emscripten_webgl_make_context_current(ctx_);
    glClearColor(rBuffer_, gBuffer_, bBuffer_, 1);

    noTexture_ = new Texture();

    // scene ubo
    setupUniformBuffer<SceneData>(uboScene_, 0);

    // distant light ubo
    setupUniformBuffer<DistantLightData>(uboDistantLight_, 5);

    // camera ubo
    setupUniformBuffer<CameraData>(uboCamera_, 6);

    // material ubo
    setupUniformBuffer<Materials::MaterialData>(uboMat_, 1);

    // perlin ubo
    setupUniformBuffer<PerlinNoise::PerlinParameters>(uboPerlin_, 2);

    // warp ubo
    setupUniformBuffer<PerlinNoise::PerlinParameters>(uboWarp_, 3);

    // mesh ubo
    setupUniformBuffer<MeshData>(uboMesh_, 4);

    createShadingPrograms();
    shaderPrograms_[currShadingMode_]->use();

    glEnable(GL_DEPTH_TEST);

    fps_ = new fpsCounter("fps_");
}

Renderer::~Renderer()
{
    if (uboScene_ != 0)
    {
        glDeleteBuffers(1, &uboScene_);
    }
    if (uboDistantLight_ != 0)
    {
        glDeleteBuffers(1, &uboDistantLight_);
    }
    if (uboMat_ != 0)
    {
        glDeleteBuffers(1, &uboMat_);
    }
    if (uboPerlin_ != 0)
    {
        glDeleteBuffers(1, &uboPerlin_);
    }
    if (uboWarp_ != 0)
    {
        glDeleteBuffers(1, &uboWarp_);
    }
    if (uboMesh_ != 0)
    {
        glDeleteBuffers(1, &uboMesh_);
    }
    if (fps_)
    {
        delete fps_;
    }
    if (noTexture_)
    {
        delete noTexture_;
    }

    if (ctx_)
    {
        emscripten_webgl_destroy_context(ctx_);
    }
}

template <typename UBODataStruct>
void Renderer::setupUniformBuffer(GLuint &ubo, int bindingSlot)
{
    if (ubo == 0)
    {
        // generate buffer ID
        glGenBuffers(1, &ubo);
        // bind to buffer
        glBindBuffer(GL_UNIFORM_BUFFER, ubo);
        // set buffer size and fill with NULL
        glBufferData(GL_UNIFORM_BUFFER, sizeof(UBODataStruct), NULL, GL_STATIC_DRAW);
        // link the buffer to the UBO binding slot
        glBindBufferRange(GL_UNIFORM_BUFFER, bindingSlot, ubo, 0, sizeof(UBODataStruct));
        // unbind buffer
        glBindBuffer(GL_UNIFORM_BUFFER, 0);
    }
}

void Renderer::createShadingPrograms()
{
    shaderPrograms_[Shaders::SHADINGMODE::GOURAUD] =
        std::make_unique<Shaders::Shader>("shaders/gouraud.vert", "shaders/gouraud.frag");
    shaderPrograms_[Shaders::SHADINGMODE::PHONG] =
        std::make_unique<Shaders::Shader>("shaders/phong.vert", "shaders/phong.frag");
    shaderPrograms_[Shaders::SHADINGMODE::NO_SHADING] =
        std::make_unique<Shaders::Shader>("shaders/noShader.vert", "shaders/noShader.frag");
}

void Renderer::setShadingMode(Shaders::SHADINGMODE shadingMode)
{
    currShadingMode_ = shadingMode;
    shaderPrograms_[currShadingMode_]->use();
}

void Renderer::setDefaultColor(float r, float g, float b)
{
    rBuffer_ = r / 255.0f;
    gBuffer_ = g / 255.0f;
    bBuffer_ = b / 255.0f;
    glClearColor(rBuffer_, gBuffer_, bBuffer_, 1);
};

void Renderer::setImageDimensions(int imageW, int imageH)
{
    glViewport(0, 0, imageW, imageH);
}

void Renderer::updateDistantLightUBO(const DistantLight *dLight)
{
    glBindBuffer(GL_UNIFORM_BUFFER, uboDistantLight_);
    glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(DistantLightData), &dLight->getUBOData());
    glBindBuffer(GL_UNIFORM_BUFFER, 0);
}

void Renderer::updateCameraUBO(Camera *camera)
{
    camera->updateViewMatrix();
    camera->updateViewProjectionMatrix();
    glBindBuffer(GL_UNIFORM_BUFFER, uboCamera_);
    glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(CameraData), &camera->getUBOData());
    glBindBuffer(GL_UNIFORM_BUFFER, 0);
}

void Renderer::updateSceneUBO(const Scene *scene)
{
    // camera
    Camera *mainCamera = scene->getCamera();
    updateCameraUBO(mainCamera);

    // light
    DistantLight *sun = scene->getLight();
    updateDistantLightUBO(sun);

    // scene
    glBindBuffer(GL_UNIFORM_BUFFER, uboScene_);
    glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(SceneData), &scene->getUBOData());
    glBindBuffer(GL_UNIFORM_BUFFER, 0);
}

void Renderer::updateMaterialUBO(const Materials::Material meshMat)
{
    int useTexture = 0;

    if (meshMat.getTexture() != nullptr)
    {
        meshMat.getTexture()->bind(0);
        useTexture = 1;
    }
    else
    {
        noTexture_->bind(0);
    }

    shaderPrograms_[currShadingMode_]->setUniformInt("uUseTexture", useTexture);

    glBindBuffer(GL_UNIFORM_BUFFER, uboMat_);
    glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(Materials::MaterialData), &meshMat.getUBOData());
    glBindBuffer(GL_UNIFORM_BUFFER, 0);
}

void Renderer::updateMeshUBO(Mesh *mesh)
{
    // update mesh data
    glBindBuffer(GL_UNIFORM_BUFFER, uboMesh_);
    glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(MeshData), &mesh->getUBOData());
    glBindBuffer(GL_UNIFORM_BUFFER, 0);

    // update material
    updateMaterialUBO(mesh->getMaterial());

    mesh->prepareRender(shaderPrograms_[currShadingMode_].get());
}

void Renderer::render(const Scene *scene)
{
    fps_->update();
    // clear buffers
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    // update uniform buffer objects
    updateSceneUBO(scene);

    for (int i = 0; i < scene->getMeshCount(); i++)
    {
        Mesh *currMesh = scene->getMesh(i);
        updateMeshUBO(currMesh);

        // bind current mesh
        glBindVertexArray(currMesh->getVAO());

        // draw mesh
        glDrawElements(GL_TRIANGLES, currMesh->getIndexCount(), GL_UNSIGNED_INT, 0);
        // unbind mesh
        glBindVertexArray(0);
    }
}
