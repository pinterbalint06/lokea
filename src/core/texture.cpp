#include "core/texture.h"
#include <vector>
#include <algorithm>
#include <cmath>
#include <cstdint>

Texture::Texture(int width, int height)
{
    width_ = width;
    height_ = height;
    imgData_ = (uint8_t *)malloc(width_ * height_ * 3 * sizeof(uint8_t));
}

Texture::~Texture()
{
    if (imgData_)
    {
        free(imgData_);
    }
}
