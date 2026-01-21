#ifndef ENGINE_H
#define ENGINE_H

#include <cstdint>
#include <string>

#include "core/rendering/shader.h"
#include "core/rendering/renderer.h"

#include "core/scene/scene.h"
#include "core/scene/camera.h"

// Forward declaration
class Mesh; // defined in "core/resources/mesh.h"

class Engine
{
protected:
    Scene *scene_;
    Renderer *renderer_;
    std::string canvas_;

public:
    Engine(std::string canvID);
    virtual ~Engine();

    void setLightDirection(float x, float y, float z);

    void setLightIntensity(float intensity);
    void setShadingMode(Shaders::SHADINGMODE shadingmode);
    void setFrustum(float focal, float filmW, float filmH, int imageW, int imageH, float n, float f);
    void setLightColor(float r, float g, float b);
    void setAmbientLight(float ambientLightIntensity);
    void setFocalLength(float focal);
    void setCanvasSize(int width, int height);

    void rotateCamera(float dPitch, float dYaw);
    void setCameraRotation(float pitch, float yaw);
    void render() { renderer_->render(scene_); };
    uint8_t *initTexture(int width, int height, int meshIndex);
    void uploadTextureToGPU(int meshIndex);
    void deleteTexture(int meshIndex);
    void loadTextureFromUrl(const std::string &url, int meshIndex);

    float getPitch() { return scene_->getCamera()->getPitch(); }
    float getYaw() { return scene_->getCamera()->getYaw(); }

    void addMesh(Mesh *mesh) { scene_->addMesh(mesh); }
    void removeMesh(int index) { scene_->removeMesh(index); }
    void clearScene() { scene_->clearMeshes(); };
};

#endif