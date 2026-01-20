#ifndef RENDERER_H
#define RENDERER_H

#include "core/shader.h"
#include "core/vertex.h"
#include <string>
#include <map>

class Clipper;
class Scene;
class Camera;
class fpsCounter;
class Mesh;
class DistantLight;
class Texture;

typedef unsigned int GLuint;

class Renderer
{
private:
    int ctx_;
    Shaders::SHADINGMODE currShadingMode_;
    std::map<Shaders::SHADINGMODE, std::unique_ptr<Shaders::Shader>> shaderPrograms_;
    fpsCounter *fps_;
    Texture *noTexture_;
    GLuint uboScene_, uboDistantLight_, uboCamera_, uboMat_, uboPerlin_, uboWarp_, uboMesh_;
    float rBuffer_, gBuffer_, bBuffer_;

    template <typename UBODataStruct>
    void setupUniformBuffer(GLuint &ubo, int bindingSlot);

    void createShadingPrograms();

    void updateDistantLightUBO(const DistantLight *dLight);
    void updateCameraUBO(Camera *camera);
    void updateSceneUBO(const Scene *scene);
    void updateMaterialUBO(const Materials::Material meshMat);
    void updateMeshUBO(Mesh *mesh);

public:
    Renderer(const std::string &canvasID);
    ~Renderer();

    GLuint *getPerlinUBOloc() { return &uboPerlin_; };
    GLuint *getWarpUBOloc() { return &uboWarp_; };
    void setShadingMode(Shaders::SHADINGMODE shadingMode);
    void setDefaultColor(float r, float g, float b);

    void setImageDimensions(int imageW, int imageH);
    void render(const Scene *scene);
};

#endif