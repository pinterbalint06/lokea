#ifndef ARROW_H
#define ARROW_H

#include "core/math/vector.h"
#include "core/resources/mesh.h"
#include "equirectangular/equirectangularEngineConfig.h"

class Arrow : public Mesh
{
private:
    int id_;
    float yaw_;

    void generateVertices();
    void createModelMatrix();
    Texture *createArrowTexture();

    void createMaterial();
    void generateMesh();
public:
    Arrow(int id, float directionYaw);
    ~Arrow();

    int getId() const { return id_; }
    float getYaw() const { return yaw_; }
    Vec2 getDirection() const;
};

#endif