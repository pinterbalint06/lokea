#include "core/engine.h"
#include "core/mesh.h"
#include "core/scene.h"
#include "core/renderer.h"
#include "core/vertex.h"
#include "core/texture.h"
#include "utils/shaderBuilder.h"
#include <string>
#include <vector>
#include <memory>
#include <emscripten/html5.h>

Engine::Engine(std::string canvID)
{
    canvas_ = canvID;
    scene_ = new Scene();
    renderer_ = new Renderer(canvas_);

    std::vector<std::string> helpers = {
        "shaders/helpers/UBOs.glsl",
        "shaders/helpers/phongReflectionModel.glsl",
        "shaders/helpers/perlinNoise.glsl"};
    renderer_->addNewShader(Shaders::SHADINGMODE::PHONG, ShaderBuilder::createShader("shaders/phong/phong.vert", "shaders/phong/phong.frag", helpers));

    // "shaders/perlinNoise.glsl" is not needed in gouraud or noshader
    helpers.pop_back();

    renderer_->addNewShader(Shaders::SHADINGMODE::GOURAUD, ShaderBuilder::createShader("shaders/gouraud/gouraud.vert", "shaders/gouraud/gouraud.frag", helpers));
    renderer_->addNewShader(Shaders::SHADINGMODE::NO_SHADING, ShaderBuilder::createShader("shaders/noShader/noShader.vert", "shaders/noShader/noShader.frag", helpers));

    setFrustum(18.0f, 25.4f, 25.4f, 1000, 1000, 0.1f, 1000.0f);
}

Engine::~Engine()
{
    if (scene_)
    {
        delete scene_;
    }
    if (renderer_)
    {
        delete renderer_;
    }
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

void Engine::setFrustum(float focal, float filmW, float filmH, int imageW, int imageH, float n, float f)
{
    renderer_->setImageDimensions(imageW, imageH);
    scene_->getCamera()->setPerspective(focal, filmW, filmH, imageW, imageH, n, f);
}

void Engine::setLightColor(float r, float g, float b)
{
    scene_->getLight()->setColor(r, g, b);
}

void Engine::setAmbientLight(float ambientLightIntensity)
{
    scene_->setAmbientLight(ambientLightIntensity);
}

void Engine::setFocalLength(float focal)
{
    scene_->getCamera()->setFocalLength(focal);
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
    Mesh *mesh = scene_->getMesh(meshIndex);
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
    Mesh *mesh = scene_->getMesh(meshIndex);
    if (mesh != nullptr)
    {
        mesh->getMaterial().getTexture()->uploadToGPU();
    }
}

void Engine::deleteTexture(int meshIndex)
{
    Mesh *mesh = scene_->getMesh(meshIndex);
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

void Engine::loadTextureFromUrl(const std::string &url, int meshIndex)
{
    Mesh *mesh = scene_->getMesh(meshIndex);
    if (mesh != nullptr)
    {
        deleteTexture(meshIndex);

        Texture *texture = new Texture();

        texture->loadFromUrl(url);

        Materials::Material newTexMat = mesh->getMaterial();
        newTexMat.setTexture(texture);
        mesh->setMaterial(newTexMat);
    }
}
