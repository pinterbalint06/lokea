#include <emscripten/emscripten.h>
#include <emscripten/html5.h>
#include <emscripten/html5_webgl.h>
#include <emscripten/console.h>
#include <GLES3/gl3.h>
#include <string>
#include <map>
#include <memory>

#include "core/rendering/renderer.h"
#include "core/rendering/shader.h"
#include "core/rendering/bindingSlots.h"
#include "core/rendering/uniformBufferObject.h"

#include "core/scene/scene.h"
#include "core/scene/camera/camera.h"
#include "core/scene/distantLight.h"

#include "core/resources/material.h"
#include "core/resources/mesh.h"
#include "core/resources/texture.h"

#include "utils/fpsCounter.h"

Renderer::Renderer(const std::string &canvasID)
{
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

    rBuffer_ = 0.0f;
    gBuffer_ = 0.0f;
    bBuffer_ = 0.0f;
    glClearColor(rBuffer_, gBuffer_, bBuffer_, 1);

    lastUseTexture_ = -1;

    noTexture_ = std::make_unique<Texture>();

    // setup UBOs
    uboScene_ = std::make_unique<UniformBufferObject<SceneData>>(BindingSlots::UBO::SCENE_DATA);
    uboDistantLight_ = std::make_unique<UniformBufferObject<DistantLightData>>(BindingSlots::UBO::DISTANT_LIGHT_DATA);
    uboCamera_ = std::make_unique<UniformBufferObject<CameraData>>(BindingSlots::UBO::CAMERA_DATA);
    uboMat_ = std::make_unique<UniformBufferObject<Materials::MaterialData>>(BindingSlots::UBO::MATERIAL_DATA);
    uboMesh_ = std::make_unique<UniformBufferObject<MeshData>>(BindingSlots::UBO::MESH_DATA);

    currShader_ = nullptr;

    glEnable(GL_DEPTH_TEST);

    fps_ = std::make_unique<FPSCounter>("fps");
}

Renderer::~Renderer()
{
    if (ctx_)
    {
        emscripten_webgl_destroy_context(ctx_);
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

    // have to use shader to set uniforms
    shader->use();
    shader->setUniformInt("uAlbedo", (int)BindingSlots::Texture::ALBEDO);
    shader->setUniformInt("uNoisePermutationTable", (int)BindingSlots::Texture::NOISE_PERMUTATION_TABLE);
    shader->setUniformInt("uNoiseGradients", (int)BindingSlots::Texture::NOISE_GRADIENTS);
    shader->setUniformInt("uWarpPermutationTable", (int)BindingSlots::Texture::WARP_PERMUTATION_TABLE);
    shader->setUniformInt("uWarpGradients", (int)BindingSlots::Texture::WARP_GRADIENTS);
    if (currShader_ != nullptr)
    {
        // if there was a shader in use revert to that
        currShader_->use();
    }
}

void Renderer::addNewShader(Shaders::SHADINGMODE mode, std::unique_ptr<Shaders::Shader> shader)
{
    shaderPrograms_[mode] = std::move(shader);
    setupShader(shaderPrograms_[mode]);

    // if no shader is in use then use this one
    if (currShader_ == nullptr)
    {
        setShadingMode(mode);
    }
}

void Renderer::setShadingMode(Shaders::SHADINGMODE shadingMode)
{
    if (shaderPrograms_.contains(shadingMode))
    {
        currShadingMode_ = shadingMode;
        currShader_ = shaderPrograms_[shadingMode].get();
        currShader_->use();
        lastUseTexture_ = -1;
    }
    else
    {
        emscripten_console_error("Renderer: Tried to set non-existent shader!");
    }
}

void Renderer::setDefaultColor(uint8_t r, uint8_t g, uint8_t b)
{
    rBuffer_ = (float)r / 255.0f;
    gBuffer_ = (float)g / 255.0f;
    bBuffer_ = (float)b / 255.0f;
    glClearColor(rBuffer_, gBuffer_, bBuffer_, 1);
};

void Renderer::setImageDimensions(int imageW, int imageH)
{
    glViewport(0, 0, imageW, imageH);
}

void Renderer::updateCameraUBO(Camera *camera)
{
    camera->updateViewMatrix();
    camera->updateViewProjectionMatrix();
    uboCamera_->update(camera->getUBOData());
}

void Renderer::updateSceneUBO(const Scene *scene)
{
    // camera
    Camera *mainCamera = scene->getCamera();
    updateCameraUBO(mainCamera);

    // light
    DistantLight *dLight = scene->getLight();
    uboDistantLight_->update(dLight->getUBOData());

    // scene
    uboScene_->update(scene->getUBOData());
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

    if (lastUseTexture_ != useTexture)
    {
        currShader_->setUniformInt("uUseTexture", useTexture);
        lastUseTexture_ = useTexture;
    }

    uboMat_->update(meshMat.getUBOData());
}

void Renderer::updateMeshUBO(Mesh *mesh)
{
    // update mesh data
    uboMesh_->update(mesh->getUBOData());

    // update material
    updateMaterialUBO(mesh->getMaterial());

    mesh->prepareRender(currShader_);
}

void Renderer::render(const Scene *scene)
{
    if (currShader_ != nullptr)
    {
        fps_->update();
        // clear buffers
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // update uniform buffer objects
        updateSceneUBO(scene);

        for (int i = 0; i < scene->getMeshCount(); i++)
        {
            std::shared_ptr<Mesh> currMesh = scene->getMesh(i);
            updateMeshUBO(currMesh.get());

            // bind current mesh
            glBindVertexArray(currMesh->getVAO());

            // draw mesh
            glDrawElements(GL_TRIANGLES, currMesh->getIndexCount(), GL_UNSIGNED_INT, 0);
        }
        // unbind mesh
        glBindVertexArray(0);
    }
    else
    {
        emscripten_console_error("Renderer: No shader is set!");
    }
}
