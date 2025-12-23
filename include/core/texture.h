#ifndef TEXTURE_H
#define TEXTURE_H

#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include <cstdint>

class Texture
{
private:
    int width_;
    int height_;
    uint8_t *imgData_;

public:
    Texture(int width, int height);
    ~Texture();

    uint8_t *getImgData() { return imgData_; }

    inline void getTexturePixel(float u, float v, float *outColor) const
    {
        u -= (int)u;
        v -= (int)v;

        int x = (int)(u * width_);
        int y = (int)(v * height_);

        int idx = (y * width_ + x) * 3;
        outColor[0] = imgData_[idx];
        outColor[1] = imgData_[idx + 1];
        outColor[2] = imgData_[idx + 2];
    }
};
#endif