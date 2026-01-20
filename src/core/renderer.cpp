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
#include "core/bindingSlots.h"
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

    noTexture_ = std::make_unique<Texture>();

    // setup UBOs
    setupUniformBuffer<SceneData>(uboScene_, BindingSlots::UBO::SCENE_DATA);
    setupUniformBuffer<DistantLightData>(uboDistantLight_, BindingSlots::UBO::DISTANT_LIGHT_DATA);
    setupUniformBuffer<CameraData>(uboCamera_, BindingSlots::UBO::CAMERA_DATA);
    setupUniformBuffer<Materials::MaterialData>(uboMat_, BindingSlots::UBO::MATERIAL_DATA);
    setupUniformBuffer<PerlinNoise::PerlinParameters>(uboPerlin_, BindingSlots::UBO::PERLIN_DATA);
    setupUniformBuffer<PerlinNoise::PerlinParameters>(uboWarp_, BindingSlots::UBO::PERLIN_WARP_DATA);
    setupUniformBuffer<MeshData>(uboMesh_, BindingSlots::UBO::MESH_DATA);

    createShadingPrograms();
    shaderPrograms_[currShadingMode_]->use();

    glEnable(GL_DEPTH_TEST);

    fps_ = std::make_unique<FPSCounter>("fps");
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

    if (ctx_)
    {
        emscripten_webgl_destroy_context(ctx_);
    }
}

template <typename UBODataStruct>
void Renderer::setupUniformBuffer(GLuint &ubo, BindingSlots::UBO bindingSlot)
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
        glBindBufferRange(GL_UNIFORM_BUFFER, (int)bindingSlot, ubo, 0, sizeof(UBODataStruct));
        // unbind buffer
        glBindBuffer(GL_UNIFORM_BUFFER, 0);
    }
}

void Renderer::setupShader(std::unique_ptr<Shaders::Shader> &shader)
{
    shader->bindUniformBlock("SceneData", (int)BindingSlots::UBO::SCENE_DATA);
    shader->bindUniformBlock("MaterialData", (int)BindingSlots::UBO::MATERIAL_DATA);
    shader->bindUniformBlock("PerlinData", (int)BindingSlots::UBO::PERLIN_DATA);
    shader->bindUniformBlock("PerlinWarpData", (int)BindingSlots::UBO::PERLIN_WARP_DATA);
    shader->bindUniformBlock("MeshData", (int)BindingSlots::UBO::MESH_DATA);
    shader->bindUniformBlock("DistantLightData", (int)BindingSlots::UBO::DISTANT_LIGHT_DATA);
    shader->bindUniformBlock("CameraData", (int)BindingSlots::UBO::CAMERA_DATA);

    shader->use();
    shader->setUniformInt("uAlbedo", (int)BindingSlots::Texture::ALBEDO);
    shader->setUniformInt("uNoisePermutationTable", (int)BindingSlots::Texture::NOISE_PERMUTATION_TABLE);
    shader->setUniformInt("uNoiseGradients", (int)BindingSlots::Texture::NOISE_GRADIENTS);
    shader->setUniformInt("uWarpPermutationTable", (int)BindingSlots::Texture::WARP_PERMUTATION_TABLE);
    shader->setUniformInt("uWarpGradients", (int)BindingSlots::Texture::WARP_GRADIENTS);
}

void Renderer::createShadingPrograms()
{
    std::vector<std::string> helpers = {
        "shaders/UBOs.glsl",
        "shaders/phongReflectionModel.glsl",
        "shaders/perlinNoise.glsl"};
    shaderPrograms_[Shaders::SHADINGMODE::PHONG] =
        std::make_unique<Shaders::Shader>("shaders/phong.vert", "shaders/phong.frag", helpers);
    setupShader(shaderPrograms_[Shaders::SHADINGMODE::PHONG]);

    // "shaders/perlinNoise.glsl" is not needed in gouraud or noshader
    helpers.pop_back();

    shaderPrograms_[Shaders::SHADINGMODE::GOURAUD] =
        std::make_unique<Shaders::Shader>("shaders/gouraud.vert", "shaders/gouraud.frag", helpers);
    setupShader(shaderPrograms_[Shaders::SHADINGMODE::GOURAUD]);

    shaderPrograms_[Shaders::SHADINGMODE::NO_SHADING] =
        std::make_unique<Shaders::Shader>("shaders/noShader.vert", "shaders/noShader.frag", helpers);
    setupShader(shaderPrograms_[Shaders::SHADINGMODE::NO_SHADING]);
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
        meshMat.getTexture()->bind((int)BindingSlots::Texture::ALBEDO);
        useTexture = 1;
    }
    else
    {
        noTexture_->bind((int)BindingSlots::Texture::ALBEDO);
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
