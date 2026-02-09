#include <emscripten/html5.h>
#include <emscripten/emscripten.h>
#include <emscripten/val.h>
#include <GLES3/gl3.h>
#include <cstdint>
#include <string>

#include "core/resources/texture.h"

extern "C"
{
    extern void textureFromURL(int textureID, const char *url, int ctxId, emscripten::EM_VAL onSuccessHandle, emscripten::EM_VAL onErrorHandle);
}

Texture::Texture(bool invisiblePlaceholder)
{
    width_ = 0;
    height_ = 0;
    textureGL_ = 0;
    invisiblePlaceholder_ = invisiblePlaceholder;
    imgData_ = nullptr;
    initGL();
}

Texture::Texture(int width, int height, bool invisiblePlaceholder)
{
    textureGL_ = 0;
    width_ = width;
    height_ = height;
    invisiblePlaceholder_ = invisiblePlaceholder;
    imgData_ = (uint8_t *)malloc(width_ * height_ * 3 * sizeof(uint8_t));
    initGL();
}

Texture::~Texture()
{
    if (imgData_)
    {
        free(imgData_);
    }
    if (textureGL_ != 0)
    {
        glDeleteTextures(1, &textureGL_);
        textureGL_ = 0;
    }
}

void Texture::initGL()
{
    if (textureGL_ == 0)
    {
        glGenTextures(1, &textureGL_);
        generatePlaceholder();
    }
}

void Texture::generatePlaceholder()
{
    if (textureGL_ != 0)
    {
        glBindTexture(GL_TEXTURE_2D, textureGL_);

        uint8_t placeholder[4];
        placeholder[0] = 0;
        placeholder[1] = 0;
        placeholder[2] = 0;
        placeholder[3] = invisiblePlaceholder_ ? 0 : 255;
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 1, 1, 0, GL_RGBA, GL_UNSIGNED_BYTE, placeholder);
        glGenerateMipmap(GL_TEXTURE_2D);

        glBindTexture(GL_TEXTURE_2D, 0);
    }
}

void Texture::loadFromUrl(const std::string &url)
{
    loadFromUrl(url, emscripten::val::undefined(), emscripten::val::undefined());
}

void Texture::loadFromUrl(const std::string &url, emscripten::val onSuccess, emscripten::val onError)
{
    if (imgData_)
    {
        free(imgData_);
        imgData_ = nullptr;
    }
    width_ = 0;
    height_ = 0;

    int ctx = emscripten_webgl_get_current_context();
    if (ctx > 0)
    {
        textureFromURL(textureGL_, url.c_str(), ctx, onSuccess.as_handle(), onError.as_handle());
    }
}

void Texture::uploadToGPU()
{
    glBindTexture(GL_TEXTURE_2D, textureGL_);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width_, height_, 0, GL_RGB, GL_UNSIGNED_BYTE, imgData_);
    glGenerateMipmap(GL_TEXTURE_2D);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glBindTexture(GL_TEXTURE_2D, 0);
}

void Texture::bind(int location)
{
    glActiveTexture(GL_TEXTURE0 + location);
    glBindTexture(GL_TEXTURE_2D, textureGL_);
}

void Texture::clear()
{
    if (imgData_)
    {
        free(imgData_);
        imgData_ = nullptr;
    }
    width_ = 0;
    height_ = 0;

    generatePlaceholder();
}
