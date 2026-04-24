#include <algorithm>

#include "core/resources/material.h"
#include "core/resources/texture.h"

namespace Materials
{
    Material::Material(Color color)
    {
        setColor(color);
        setTexture(nullptr);
    }

    void Material::setColor(Color color)
    {
        data_.color[0] = color.r;
        data_.color[1] = color.g;
        data_.color[2] = color.b;
        data_.color[3] = color.a;
    }

    void Material::setTexture(Texture *tex)
    {
        texture_ = tex;
    }
}
