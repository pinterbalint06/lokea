#include <string>
#include <vector>
#include <memory>
#include <emscripten/html5.h>

#include "core/rendering/renderer.h"

#include "core/scene/scene.h"

#include "core/engine.h"

#include "utils/shaderBuilder.h"

Engine::Engine(std::string canvID)
{
    canvas_ = canvID;
    scene_ = std::make_unique<Scene>();
    renderer_ = std::make_unique<Renderer>(canvas_);

    std::vector<std::string> helpers = {
        "shaders/helpers/UBOs.glsl",
    };
    renderer_->setImageDimensions(1000.0f, 1000.0f);
    renderer_->addNewShader(Shaders::SHADINGMODE::NO_SHADING, ShaderBuilder::createShader("shaders/noShader/noShader.vert", "shaders/noShader/noShader.frag", helpers));
}

Engine::~Engine()
{
}

void Engine::enableAlphaBlending()
{
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
}

void Engine::setShadingMode(Shaders::SHADINGMODE shadingmode)
{
    renderer_->setShadingMode(shadingmode);
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

void Engine::setPitch(float pitch)
{
    scene_->getCamera()->setPitch(pitch);
}

void Engine::setYaw(float yaw)
{
    scene_->getCamera()->setYaw(yaw);
}

void Engine::setCameraRotation(float pitch, float yaw)
{
    scene_->getCamera()->setRotation(pitch, yaw);
}

void Engine::setCameraPosition(float x, float y, float z)
{
    scene_->getCamera()->setPosition(x, y, z);
}

void Engine::resetCameraPosition()
{
    scene_->getCamera()->setPosition(0.0f, 0.0f, 0.0f);
}
