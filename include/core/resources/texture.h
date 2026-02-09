#ifndef TEXTURE_H
#define TEXTURE_H

#include <cstdint>
#include <string>
#include <GLES3/gl3.h>
#include <emscripten/val.h>

class Texture
{
private:
    int width_;
    int height_;
    uint8_t *imgData_;
    GLuint textureGL_;
    bool invisiblePlaceholder_;

    void initGL();
    void generatePlaceholder();

public:
    Texture(bool invisiblePlaceholder = false);
    Texture(int width, int height, bool invisiblePlaceholder = false);
    ~Texture();

    int getWidth() { return width_; }
    int getHeight() { return height_; }

    uint8_t *getImgData() { return imgData_; }
    GLuint getTextureIndex() const { return textureGL_; }

    void loadFromUrl(const std::string &url);
    void loadFromUrl(const std::string &url, emscripten::val onSuccess, emscripten::val onError);
    void uploadToGPU();
    void bind(int location);
    void clear();
};
#endif