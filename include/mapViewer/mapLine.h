#ifndef MAP_LINE_ENGINE_H
#define MAP_LINE_ENGINE_H

#include <string>

#include "core/resources/mesh.h"

class MapLine : public Mesh
{
private:
    int id_;
    int startMarkerId_;
    int endMarkerId_;
    float thickness_;

public:
    MapLine(int id, int startMarkerId, int endMarkerId, float thickness, uint8_t r, uint8_t g, uint8_t b, uint8_t a);
    ~MapLine();

    void updateLineGeometry(float startX, float startY, float endX, float endY, float screenWidth, float screenHeight);

    int getId() const { return id_; }
    int getStartMarkerId() const { return startMarkerId_; }
    int getEndMarkerId() const { return endMarkerId_; }

};

#endif