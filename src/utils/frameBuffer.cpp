#include "utils/frameBuffer.h"
#include <cstring>
#include <algorithm>
#include <cmath>
#include <wasm_simd128.h>
#include <stdio.h>

#define WASM_SIMD_COMPAT_SLOW

FrameBuffer::FrameBuffer(int width, int height, int antialias)
{
    width_ = width;
    height_ = height;
    allocate();
    antialias_ = antialias;
}

FrameBuffer::~FrameBuffer()
{
    cleanup();
}

void FrameBuffer::allocate()
{
    int size = width_ * height_;
    imageBuffer_ = (uint8_t *)malloc(size * 4 * sizeof(uint8_t));
    zBuffer_ = (float *)malloc(size * antialias_ * sizeof(float));
    antialiasImgBuff_ = (float *)malloc(size * antialias_ * 3 * sizeof(float));
}

void FrameBuffer::cleanup()
{
    if (imageBuffer_)
    {
        free(imageBuffer_);
    }
    if (zBuffer_)
    {
        free(zBuffer_);
    }
    if (antialiasImgBuff_)
    {
        free(antialiasImgBuff_);
    }
}

void FrameBuffer::clear(float r, float g, float b)
{
    int size = width_ * height_;
    std::memset(imageBuffer_, 0, size * 4 * sizeof(uint8_t));
    std::memset(zBuffer_, 0, size * antialias_ * sizeof(float));
    for (int i = 0; i < size * antialias_ * 3; i += 3)
    {
        antialiasImgBuff_[i] = r;
        antialiasImgBuff_[i + 1] = g;
        antialiasImgBuff_[i + 2] = b;
    }
}

void FrameBuffer::calculateAntialias()
{
    float r, g, b;
    uint8_t rFinal, gFinal, bFinal;
    int altalanosIndex, imageAntiIndex, subImageIndex, imageBufferIndex;
    /// @brief accumulate z-buffer
    float zBufferSum;
    float antiRec = 1.0f / antialias_;
    for (int i = 0; i < width_ * height_; i++)
    {
        imageAntiIndex = i * antialias_ * 3;
        imageBufferIndex = i * 4;
        r = 0.0f;
        g = 0.0f;
        b = 0.0f;
        for (int k = 0; k < antialias_; k++)
        {
            r += antialiasImgBuff_[imageAntiIndex + k];
            g += antialiasImgBuff_[imageAntiIndex + antialias_ + k];
            b += antialiasImgBuff_[imageAntiIndex + 2 * antialias_ + k];
        }

        imageBuffer_[imageBufferIndex] = static_cast<uint8_t>(
            std::round(
                std::clamp(r * antiRec, 0.0f, 255.0f)));
        imageBuffer_[imageBufferIndex + 1] = static_cast<uint8_t>(
            std::round(
                std::clamp(g * antiRec, 0.0f, 255.0f)));
        imageBuffer_[imageBufferIndex + 2] = static_cast<uint8_t>(
            std::round(
                std::clamp(b * antiRec, 0.0f, 255.0f)));
        imageBuffer_[imageBufferIndex + 3] = 255;
    }
}

void FrameBuffer::setHeight(int height)
{
    height_ = height;
    cleanup();
    allocate();
}
void FrameBuffer::setWidth(int width)
{
    width_ = width;
    cleanup();
    allocate();
}

void FrameBuffer::setAntialias(int antialias)
{
    antialias_ = antialias;
    if (zBuffer_)
    {
        free(zBuffer_);
    }
    if (antialiasImgBuff_)
    {
        free(antialiasImgBuff_);
    }
    int size = width_ * height_;
    zBuffer_ = (float *)malloc(size * antialias_ * sizeof(float));
    antialiasImgBuff_ = (float *)malloc(size * antialias_ * 3 * sizeof(float));
}

void FrameBuffer::setNewOptions(int width, int height, int antialias)
{
    antialias_ = antialias;
    width_ = width;
    height_ = height;
    cleanup();
    allocate();
}
