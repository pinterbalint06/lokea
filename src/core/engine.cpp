#include <string>
#include <vector>
#include <memory>
#include <emscripten/val.h>
#include <emscripten/html5.h>

#include "core/rendering/renderer.h"

#include "core/scene/scene.h"

#include "core/resources/mesh.h"
#include "core/resources/texture.h"
#include "core/resources/material.h"

#include "core/engine.h"

#include "utils/shaderBuilder.h"

Engine::Engine(std::string canvID)
{
    canvas_ = canvID;
    scene_ = std::make_unique<Scene>();
    renderer_ = std::make_unique<Renderer>(canvas_);

    std::vector<std::string> helpers = {
        "shaders/helpers/UBOs.glsl",
        "shaders/helpers/phongReflectionModel.glsl",
        "shaders/helpers/perlinNoise.glsl" };
    renderer_->addNewShader(Shaders::SHADINGMODE::PHONG, ShaderBuilder::createShader("shaders/phong/phong.vert", "shaders/phong/phong.frag", helpers));

    renderer_->setImageDimensions(1000.0f, 1000.0f);

    // "shaders/perlinNoise.glsl" is not needed in gouraud or noshader
    helpers.pop_back();

    renderer_->addNewShader(Shaders::SHADINGMODE::GOURAUD, ShaderBuilder::createShader("shaders/gouraud/gouraud.vert", "shaders/gouraud/gouraud.frag", helpers));
    renderer_->addNewShader(Shaders::SHADINGMODE::NO_SHADING, ShaderBuilder::createShader("shaders/noShader/noShader.vert", "shaders/noShader/noShader.frag", helpers));
}

Engine::~Engine()
{
}

void Engine::setLightIntensity(float intensity)
{
    scene_->getLight()->setIntensity(intensity);
}

void Engine::setLightDirection(float x, float y, float z)
{
    scene_->getLight()->setDirection(x, y, z);
}

void Engine::setShadingMode(Shaders::SHADINGMODE shadingmode)
{
    renderer_->setShadingMode(shadingmode);
}

void Engine::setFrustum(float filmW, float filmH, int imageW, int imageH, float n, float f)
{
    renderer_->setImageDimensions(imageW, imageH);
    scene_->getCamera()->setPerspective(filmW, filmH, imageW, imageH, n, f);
}

void Engine::setLightColor(float r, float g, float b)
{
    scene_->getLight()->setColor(r, g, b);
}

void Engine::setAmbientLight(float ambientLightIntensity)
{
    scene_->setAmbientLight(ambientLightIntensity);
}

void Engine::setZoom(float amount)
{
    scene_->getCamera()->setZoom(amount);
}

void Engine::zoom(float amount)
{
    scene_->getCamera()->zoom(amount);
}

void Engine::setProjectionType(PROJECTIONTYPE type)
{
    scene_->getCamera()->setProjectionMode(type);
}

void Engine::setProjectionType(int type)
{
    scene_->getCamera()->setProjectionMode(static_cast<PROJECTIONTYPE>(type));
}

void Engine::setCanvasSize(int width, int height)
{
    scene_->getCamera()->setImageDimensions(width, height);
    std::string canvID = "#" + canvas_;
    emscripten_set_canvas_element_size(canvID.c_str(), width, height);
    renderer_->setImageDimensions(width, height);
}

void Engine::rotateCamera(float dPitch, float dYaw)
{
    scene_->getCamera()->rotate(dPitch, dYaw);
}

void Engine::setCameraRotation(float pitch, float yaw)
{
    scene_->getCamera()->setRotation(pitch, yaw);
}

uint8_t *Engine::initTexture(int width, int height, int meshIndex)
{
    uint8_t *retPtr = nullptr;
    std::shared_ptr<Mesh> mesh = scene_->getMesh(meshIndex);
    if (mesh != nullptr)
    {
        deleteTexture(meshIndex);
        Texture *texture = new Texture(width, height);
        Materials::Material newTexMat = mesh->getMaterial();
        newTexMat.setTexture(texture);
        mesh->setMaterial(newTexMat);
        retPtr = texture->getImgData();
    }
    return retPtr;
}

void Engine::uploadTextureToGPU(int meshIndex)
{
    std::shared_ptr<Mesh> mesh = scene_->getMesh(meshIndex);
    if (mesh != nullptr)
    {
        if (mesh->getMaterial().getTexture() != nullptr)
        {
            mesh->getMaterial().getTexture()->uploadToGPU();
        }
    }
}

void Engine::deleteTexture(int meshIndex)
{
    std::shared_ptr<Mesh> mesh = scene_->getMesh(meshIndex);
    if (mesh != nullptr)
    {
        if (mesh->getMaterial().getTexture() != nullptr)
        {
            delete mesh->getMaterial().getTexture();
            Materials::Material newTexMat = mesh->getMaterial();
            newTexMat.setTexture(nullptr);
            mesh->setMaterial(newTexMat);
        }
    }
}

void Engine::loadTextureFromUrl(const std::string &url, int meshIndex, emscripten::val onSuccess, emscripten::val onError)
{
    std::shared_ptr<Mesh> mesh = scene_->getMesh(meshIndex);
    if (mesh != nullptr)
    {
        Texture *texture = mesh->getMaterial().getTexture();
        if (texture == nullptr)
        {
            Texture *texture = new Texture();

            texture->loadFromUrl(url, onSuccess, onError);

            Materials::Material newTexMat = mesh->getMaterial();
            newTexMat.setTexture(texture);
            mesh->setMaterial(newTexMat);
        }
        else
        {
            texture->loadFromUrl(url, onSuccess, onError);
        }
    }
}

void Engine::loadTextureFromUrl(const std::string &url, int meshIndex)
{
    loadTextureFromUrl(url, meshIndex, emscripten::val::undefined(), emscripten::val::undefined());
}
