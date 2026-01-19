#include <core/material.h>
#include <core/texture.h>
#include <algorithm>

namespace Materials
{
    Material::Material(Color albedo, float diffuseness, float specularity, float shininess)
    {
        setAlbedo(albedo);
        setDiffuseness(diffuseness);
        setSpecularity(specularity);
        setShininess(shininess);
        setTexture(nullptr);
    }

    void Material::setAlbedo(Color albedo)
    {
        data_.albedo[0] = albedo.r;
        data_.albedo[1] = albedo.g;
        data_.albedo[2] = albedo.b;
    }
    void Material::setDiffuseness(float diffuseness)
    {
        data_.diffuseness = std::clamp(diffuseness, 0.0f, 1.0f);
    }
    void Material::setSpecularity(float specularity)
    {
        data_.specularity = std::clamp(specularity, 0.0f, 1.0f);
    }
    void Material::setShininess(float shininess)
    {
        data_.shininess = shininess;
    }
    void Material::setTexture(Texture *tex)
    {
        texture_ = tex;
    }
}
