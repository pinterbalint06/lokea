#include <cmath>
#include <GLES3/gl3.h>
#include <memory>

#include "core/math/vector.h"
#include "core/math/mathUtils.h"
#include "core/resources/mesh.h"
#include "core/resources/vertex.h"
#include "core/resources/material.h"
#include "core/resources/texture.h"

#include "equirectangular/arrow.h"

constexpr Vertex INNER_ARROW_VERTICES[6] = {
    // x       y      z        u     v
    {-0.625f,  0.0f,  0.375f, 0.0f, 0.0f}, // 0: lower left
    {-0.625f,  0.0f,  0.125f, 0.0f, 0.0f}, // 1: upper front left
    { 0.0f,    0.0f, -0.375f, 0.0f, 0.0f}, // 2: top
    { 0.625f,  0.0f,  0.125f, 0.0f, 0.0f}, // 3: upper front right
    { 0.625f,  0.0f,  0.375f, 0.0f, 0.0f}, // 4: lower right
    { 0.0f,    0.0f, -0.125f, 0.0f, 0.0f}  // 5: inner top
};

constexpr uint32_t ARROW_INDICES[] = {
    // inner arrow
    0, 2, 1,
    0, 5, 2,
    4, 2, 5,
    4, 3, 2,

    // outer arrow (shadow)
    6, 8, 7,
    6, 11, 8,
    10, 8, 11,
    10, 9, 8
};

void Arrow::generateVertices()
{
    Vertex generatedVertices[12];

    constexpr Vec2 SHADOW_DIRECTIONS[6] = {
        {-1.0f,  1.0f}, // 0: back left
        {-1.0f,  0.0f}, // 1: left
        { 0.0f, -1.0f}, // 2: forward
        { 1.0f,  0.0f}, // 3: right
        { 1.0f,  1.0f}, // 4: back right
        { 0.0f,  1.0f}  // 5: backward
    };

    for (int i = 0; i < 6; ++i)
    {
        Vertex innerVertex = INNER_ARROW_VERTICES[i];
        innerVertex.v = 0.0f;
        generatedVertices[i] = innerVertex;

        Vertex outerVertex = INNER_ARROW_VERTICES[i];

        outerVertex.x += SHADOW_DIRECTIONS[i].x * EQUIRECTANGULAR_SETTINGS.shadowOutlineWidth;
        outerVertex.z += SHADOW_DIRECTIONS[i].y * EQUIRECTANGULAR_SETTINGS.shadowOutlineWidth;

        outerVertex.y = EQUIRECTANGULAR_SETTINGS.shadowYOffset;
        outerVertex.v = 1.0f;

        generatedVertices[i + 6] = outerVertex;
    }

    getVertices().assign(generatedVertices, generatedVertices + (sizeof(generatedVertices) / sizeof(Vertex)));
    getIndices().assign(ARROW_INDICES, ARROW_INDICES + (sizeof(ARROW_INDICES) / sizeof(uint32_t)));
}

void Arrow::createModelMatrix()
{
    const float scale = EQUIRECTANGULAR_SETTINGS.arrowSize;

    const float radius = EQUIRECTANGULAR_SETTINGS.arrowCameraRadiusDistance;
    const float height = EQUIRECTANGULAR_SETTINGS.arrowHeightY;

    const float posX = std::sin(yaw_) * radius;
    const float posY = height;
    const float posZ = -std::cos(yaw_) * radius;

    Mat4 scaleMat = Mat4::scale(scale, scale, scale);
    Mat4 yRotMat = Mat4::rotationY(-yaw_);
    Mat4 tempMat = scaleMat * yRotMat;
    Mat4 transMat = Mat4::translation(posX, posY, posZ);

    Mat4 &modelMatrix = getModelMatrix();
    modelMatrix = tempMat * transMat;
}

std::shared_ptr<Texture> Arrow::createArrowTexture()
{
    const int textureWidth = 1;
    const int textureHeight = 2;
    std::shared_ptr<Texture> arrowTexture = std::make_shared<Texture>(textureWidth, textureHeight, false, true);
    std::vector<uint8_t> &pixels = arrowTexture->getImgData();

    int pixelIndex = 0;

    constexpr uint8_t innerColorR = 255;
    constexpr uint8_t innerColorG = 255;
    constexpr uint8_t innerColorB = 255;
    constexpr uint8_t innerColorA = 200;
    pixels[pixelIndex++] = innerColorR;
    pixels[pixelIndex++] = innerColorG;
    pixels[pixelIndex++] = innerColorB;
    pixels[pixelIndex++] = innerColorA;

    constexpr uint8_t outerColorR = 0;
    constexpr uint8_t outerColorG = 0;
    constexpr uint8_t outerColorB = 0;
    constexpr uint8_t outerColorA = 120;
    pixels[pixelIndex++] = outerColorR;
    pixels[pixelIndex++] = outerColorG;
    pixels[pixelIndex++] = outerColorB;
    pixels[pixelIndex++] = outerColorA;

    TextureOptions opts;
    opts.minFilter = GL_NEAREST;
    opts.magFilter = GL_NEAREST;
    opts.wrapS = GL_CLAMP_TO_EDGE;
    opts.wrapT = GL_CLAMP_TO_EDGE;

    arrowTexture->setOptions(opts);
    arrowTexture->uploadToGPU();

    return arrowTexture;
}

Arrow::Arrow(int id, float yaw) : Mesh(12, 24)
{
    id_ = id;
    yaw_ = yaw;
    generateMesh();
    createMaterial();
}

Arrow::~Arrow()
{
}

void Arrow::setYaw(float newYaw)
{
    yaw_ = newYaw;
    createModelMatrix();
}

Vec2 Arrow::getDirection() const
{
    return Vec2(std::sin(yaw_), -std::cos(yaw_));
}

void Arrow::generateMesh()
{
    generateVertices();
    createModelMatrix();
}

void Arrow::createMaterial()
{
    Materials::Material defaultMat = Materials::Material::Error();

    defaultMat.setTexture(createArrowTexture());

    setMaterial(defaultMat);
}
