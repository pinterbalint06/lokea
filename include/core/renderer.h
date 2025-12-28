#ifndef RENDERER_H
#define RENDERER_H

#include "core/shader.h"
#include "core/vertex.h"
#include <string>

class Clipper;
class Scene;
class Camera;
class fpsCounter;
class Mesh;

class Renderer
{
private:
    int imageWidth_, imageHeight_;
    Shaders::SHADINGMODE currShadingMode_;
    Shaders::Shader *shaderProgram_;
    fpsCounter *fps;
    float rBuffer_, gBuffer_, bBuffer_;

    template <typename StructShader>
    void renderTemplate(const Scene *scene);

public:
    Renderer(std::string &canvasID);
    ~Renderer();
    void setShadingMode(Shaders::SHADINGMODE shadingMode);
    void setDefaultColor(float r, float g, float b)
    {
        rBuffer_ = r / 255.0f;
        gBuffer_ = g / 255.0f;
        bBuffer_ = b / 255.0f;
    };

    void setImageDimensions(int imageW, int imageH);
    void render(const Scene *scene);
};

#endif