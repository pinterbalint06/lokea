#include "core/scene/distantLight.h"

#define INV_PI 0.318309886f

DistantLight::DistantLight(float r, float g, float b, float intensity, float x, float y, float z)
{
    data_.lightColor[0] = r;
    data_.lightColor[1] = g;
    data_.lightColor[2] = b;

    intensity_ = intensity;

    lightDir_[0] = x;
    lightDir_[1] = y;
    lightDir_[2] = z;

    data_.lightVec[0] = -lightDir_[0];
    data_.lightVec[1] = -lightDir_[1];
    data_.lightVec[2] = -lightDir_[2];

    data_.lightColorPreCalc[0] = data_.lightColor[0] * INV_PI * intensity_;
    data_.lightColorPreCalc[1] = data_.lightColor[1] * INV_PI * intensity_;
    data_.lightColorPreCalc[2] = data_.lightColor[2] * INV_PI * intensity_;
}

DistantLight::~DistantLight()
{
}

void DistantLight::setRed(float red)
{
    data_.lightColor[0] = red;
    data_.lightColorPreCalc[0] = data_.lightColor[0] * INV_PI * intensity_;
}

void DistantLight::setGreen(float green)
{
    data_.lightColor[1] = green;
    data_.lightColorPreCalc[1] = data_.lightColor[1] * INV_PI * intensity_;
}

void DistantLight::setBlue(float blue)
{
    data_.lightColor[2] = blue;
    data_.lightColorPreCalc[2] = data_.lightColor[2] * INV_PI * intensity_;
}

void DistantLight::setColor(float red, float green, float blue)
{
    data_.lightColor[0] = red;
    data_.lightColor[1] = green;
    data_.lightColor[2] = blue;
    data_.lightColorPreCalc[0] = data_.lightColor[0] * INV_PI * intensity_;
    data_.lightColorPreCalc[1] = data_.lightColor[1] * INV_PI * intensity_;
    data_.lightColorPreCalc[2] = data_.lightColor[2] * INV_PI * intensity_;
}

void DistantLight::setIntensity(float intensity)
{
    intensity_ = intensity;
    data_.lightColorPreCalc[0] = data_.lightColor[0] * INV_PI * intensity_;
    data_.lightColorPreCalc[1] = data_.lightColor[1] * INV_PI * intensity_;
    data_.lightColorPreCalc[2] = data_.lightColor[2] * INV_PI * intensity_;
}

void DistantLight::setDirection(float x, float y, float z)
{
    lightDir_[0] = x;
    lightDir_[1] = y;
    lightDir_[2] = z;

    data_.lightVec[0] = -lightDir_[0];
    data_.lightVec[1] = -lightDir_[1];
    data_.lightVec[2] = -lightDir_[2];
}
