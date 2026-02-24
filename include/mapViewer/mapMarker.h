#ifndef MAP_MARKER_ENGINE_H
#define MAP_MARKER_ENGINE_H

#include <string>
#include <memory>

#include "core/resources/mesh.h"

class MapMarker : public Mesh
{
private:
    int id_;
    float u_, v_;
    float width_, height_;
    float rotation_;
    bool selectable_;

    bool doesPointOverlapRepetition(float pointX, float pointY, int repetitionIndex);

public:
    MapMarker(int id, const std::string &textureUrl, float u, float v, float width, float height);
    ~MapMarker();

    // getters
    float getU() const { return u_; }
    float getV() const { return v_; }
    float getWidth() const { return width_; }
    float getHeight() const { return height_; }
    float getId() const { return id_; }
    float getRotation() const { return rotation_; }
    bool isSelectable() const { return selectable_; }

    void setU(float u) { u_ = u; }
    void setV(float v) { v_ = v; }
    void setId(int id) { id_ = id; }
    void setRotation(float rotation) { rotation_ = rotation; }
    void setSelectable(bool selectable) { selectable_ = selectable; }

    void updateRenderPosition(const std::vector<Vec2> &positions, float screenWidth, float screenHeight);
    bool doesPointOverlap(float pointX, float pointY);

    void changeTexture(const std::string &textureUrl);
};

#endif