#ifndef TEXTURE_H
#define TEXTURE_H

#include <cstdint>
#include <string>
#include <vector>
#include <GLES3/gl3.h>
#include <emscripten/val.h>

struct TextureOptions
{
    GLenum minFilter;
    GLenum magFilter;
    GLenum wrapS;
    GLenum wrapT;
};

namespace TextureStyle
{
    static const TextureOptions Default = {
        GL_LINEAR_MIPMAP_LINEAR, GL_LINEAR, GL_REPEAT, GL_REPEAT
    };
}

class Texture
{
private:
    int width_;
    int height_;
    std::vector<uint8_t> imgData_;
    GLuint textureGL_;
    bool invisiblePlaceholder_;
    TextureOptions options_;
    bool hasAlpha_;

    void initGL();
    void generatePlaceholder();
    void updateOptions();
    bool needsMipmaps();

public:
    Texture(bool invisiblePlaceholder = false, bool hasAlpha = false);
    Texture(int width, int height, bool invisiblePlaceholder = false, bool hasAlpha = false);
    ~Texture();

    int getWidth() { return width_; }
    int getHeight() { return height_; }

    std::vector<uint8_t> &getImgData() { return imgData_; }
    const std::vector<uint8_t> &getImgData() const { return imgData_; }
    GLuint getTextureIndex() const { return textureGL_; }

    void setOptions(TextureOptions options);

    void loadFromUrl(const std::string &url);
    void loadFromUrl(const std::string &url, emscripten::val onSuccess, emscripten::val onError);
    void uploadToGPU();
    void bind(int location);
    void clear();
};
#endif
