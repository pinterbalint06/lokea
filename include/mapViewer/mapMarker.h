#ifndef MAP_MARKER_ENGINE_H
#define MAP_MARKER_ENGINE_H

#include <string>

// Forward declaration
class Mesh; // defined in "core/resources/mesh.h"


class MapMarker
{
private:
    Mesh *mesh_;
    float u_, v_;
    float width_, height_;
public:
    MapMarker(const std::string &textureUrl, float u, float v, float width, float height);
    ~MapMarker();

    // getters
    Mesh *getMesh() { return mesh_; }
    float getU() const { return u_; }
    float getV() const { return v_; }
    float getWidth() const { return width_; }
    float getHeight() const { return height_; }

    void setU(float u) { u_ = u; }
    void setV(float v) { v_ = v; }
};

#endif