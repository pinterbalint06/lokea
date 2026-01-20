#ifndef RENDERER_H
#define RENDERER_H

#include <string>
#include <map>
#include <memory>
#include <GLES3/gl3.h>

#include "core/rendering/shader.h"
#include "core/rendering/bindingSlots.h"
#include "core/rendering/uniformBufferObject.h"

// Forward declarations
class Scene;             // defined in "core/scene/scene.h"
struct SceneData;        // defined in "core/scene/scene.h"
class Camera;            // defined in "core/scene/camera.h"
struct CameraData;       // defined in "core/scene/camera.h"
class FPSCounter;        // defined in "utils/fpsCounter.h"
class Mesh;              // defined in "core/resources/mesh.h"
struct MeshData;         // defined in "core/resources/mesh.h"
struct DistantLightData; // defined in "core/scene/distantLight.h"
class Texture;           // defined in "core/resources/texture.h"
namespace Materials
{
    class Material;      // defined in "core/resources/material.h"
    struct MaterialData; // defined in "core/resources/material.h"
}

class Renderer
{
private:
    int ctx_;
    Shaders::SHADINGMODE currShadingMode_;
    Shaders::Shader *currShader_;
    std::map<Shaders::SHADINGMODE, std::unique_ptr<Shaders::Shader>> shaderPrograms_;
    std::unique_ptr<FPSCounter> fps_;
    std::unique_ptr<Texture> noTexture_;
    std::unique_ptr<UniformBufferObject<SceneData>> uboScene_;
    std::unique_ptr<UniformBufferObject<DistantLightData>> uboDistantLight_;
    std::unique_ptr<UniformBufferObject<CameraData>> uboCamera_;
    std::unique_ptr<UniformBufferObject<Materials::MaterialData>> uboMat_;
    std::unique_ptr<UniformBufferObject<MeshData>> uboMesh_;
    float rBuffer_, gBuffer_, bBuffer_;
    int lastUseTexture_;

    void setupShader(std::unique_ptr<Shaders::Shader> &shader);

    void updateCameraUBO(Camera *camera);
    void updateSceneUBO(const Scene *scene);
    void updateMaterialUBO(const Materials::Material meshMat);
    void updateMeshUBO(Mesh *mesh);

public:
    Renderer(const std::string &canvasID);
    ~Renderer();

    void setShadingMode(Shaders::SHADINGMODE shadingMode);
    void setDefaultColor(float r, float g, float b);

    void setImageDimensions(int imageW, int imageH);
    void addNewShader(Shaders::SHADINGMODE mode, std::unique_ptr<Shaders::Shader> shader);
    void render(const Scene *scene);
};

#endif