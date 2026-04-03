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
    bool fixedToMap_;

    bool doesPointOverlapRepetition(float pointX, float pointY, int repetitionIndex);

public:
    MapMarker(int id, const std::string &textureUrl, float u, float v, float width, float height);
    ~MapMarker();

    // getters
    float getU() const { return u_; }
    float getV() const { return v_; }
    float getWidth() const { return width_; }
    float getHeight() const { return height_; }
    int getId() const { return id_; }
    float getRotation() const { return rotation_; }
    bool isSelectable() const { return selectable_; }
    bool isFixedToMap() const { return fixedToMap_; }

    // setters
    void setWidth(float width) { width_ = width; }
    void setHeight(float height) { height_ = height; }
    void setU(float u) { u_ = u; }
    void setV(float v) { v_ = v; }
    void setId(int id) { id_ = id; }
    void setRotation(float rotation) { rotation_ = rotation; }
    void setSelectable(bool selectable) { selectable_ = selectable; }
    void setFixedToMap(bool fixedToMap) { fixedToMap_ = fixedToMap; }

    void updateRenderPosition(const std::vector<Vec2> &positions, float screenWidth, float screenHeight, float totalMapWidth = 0.0f, float totalMapHeight = 0.0f, float mapRatioPerPixelX = 0.0f, float mapRatioPerPixelY = 0.0f);
    bool doesPointOverlap(float pointX, float pointY);

    void changeTexture(const std::string &textureUrl);
};

#endif