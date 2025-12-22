#ifndef SCENE_H
#define SCENE_H

class Camera;
class DistantLight;
class Mesh;

class Scene
{
private:
    Camera *cam_;
    DistantLight *light_;
    float ambientLight_;
    Mesh *mesh_;

public:
    Scene();
    ~Scene();

    // getters
    Camera *getCamera() const { return cam_; }
    DistantLight *getLight() const { return light_; }
    float getAmbientLight() const { return ambientLight_; }
    Mesh *getMesh() const { return mesh_; }

    // setter
    void setAmbientLight(float ambientLightIntensity);
    void setMesh(Mesh *mesh);
};

#endif