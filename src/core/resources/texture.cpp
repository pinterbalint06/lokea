#include <emscripten/html5.h>
#include <emscripten/emscripten.h>
#include <emscripten/val.h>
#include <GLES3/gl3.h>
#include <cstdint>
#include <string>

#include "core/resources/texture.h"

extern "C"
{
    extern void textureFromURL(int textureID, const char *url, int ctxId, bool needsMipmaps, emscripten::EM_VAL onSuccessHandle, emscripten::EM_VAL onErrorHandle);
}

Texture::Texture(bool invisiblePlaceholder, bool hasAlpha)
{
    width_ = 0;
    height_ = 0;
    textureGL_ = 0;
    invisiblePlaceholder_ = invisiblePlaceholder;
    hasAlpha_ = hasAlpha;
    imgData_ = nullptr;
    options_ = TextureStyle::Default;
    initGL();
}

Texture::Texture(int width, int height, bool invisiblePlaceholder, bool hasAlpha)
{
    textureGL_ = 0;
    width_ = width;
    height_ = height;
    invisiblePlaceholder_ = invisiblePlaceholder;
    hasAlpha_ = hasAlpha;

    int channels = hasAlpha_ ? 4 : 3;
    imgData_ = (uint8_t *)malloc(width_ * height_ * channels * sizeof(uint8_t));

    options_ = TextureStyle::Default;
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
        setOptions(options_);
        generatePlaceholder();
    }
}

bool Texture::needsMipmaps()
{
    return options_.minFilter == GL_NEAREST_MIPMAP_NEAREST ||
        options_.minFilter == GL_LINEAR_MIPMAP_NEAREST ||
        options_.minFilter == GL_NEAREST_MIPMAP_LINEAR ||
        options_.minFilter == GL_LINEAR_MIPMAP_LINEAR;
}

void Texture::setOptions(TextureOptions options)
{
    options_ = options;
    updateOptions();
}

void Texture::updateOptions()
{
    if (textureGL_ != 0)
    {
        glBindTexture(GL_TEXTURE_2D, textureGL_);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, options_.minFilter);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, options_.magFilter);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, options_.wrapS);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, options_.wrapT);
        glBindTexture(GL_TEXTURE_2D, 0);
    }
}

void Texture::generatePlaceholder()
{
    if (textureGL_ != 0)
    {
        glBindTexture(GL_TEXTURE_2D, textureGL_);

        if (hasAlpha_)
        {
            uint8_t placeholder[4];
            placeholder[0] = 0;
            placeholder[1] = 0;
            placeholder[2] = 0;
            placeholder[3] = invisiblePlaceholder_ ? 0 : 255;
            glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 1, 1, 0, GL_RGBA, GL_UNSIGNED_BYTE, placeholder);
        }
        else
        {
            uint8_t placeholder[3];
            placeholder[0] = 0;
            placeholder[1] = 0;
            placeholder[2] = 0;
            glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 1, 1, 0, GL_RGB, GL_UNSIGNED_BYTE, placeholder);
        }

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
        textureFromURL(textureGL_, url.c_str(), ctx, needsMipmaps(), onSuccess.as_handle(), onError.as_handle());
    }
}

void Texture::uploadToGPU()
{
    glBindTexture(GL_TEXTURE_2D, textureGL_);

    GLuint format = hasAlpha_ ? GL_RGBA : GL_RGB;
    glTexImage2D(GL_TEXTURE_2D, 0, format, width_, height_, 0, format, GL_UNSIGNED_BYTE, imgData_);

    if (needsMipmaps())
    {
        glGenerateMipmap(GL_TEXTURE_2D);
    }
    updateOptions();
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
