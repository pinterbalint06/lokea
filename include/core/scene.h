#ifndef SCENE_H
#define SCENE_H

#include <vector>

class Camera;
class DistantLight;
class Mesh;

struct SceneData
{
    float ambientLight; // 0 -> 4
};

class Scene
{
private:
    Camera *cam_;
    DistantLight *light_;
    float ambientLight_;
    std::vector<Mesh *> meshes_;

public:
    Scene();
    ~Scene();

    // getters
    Camera *getCamera() const { return cam_; }
    DistantLight *getLight() const { return light_; }
    float getAmbientLight() const { return ambientLight_; }
    int getMeshCount() const { return meshes_.size(); }
    Mesh *getMesh(int index) const { return meshes_.size() > index && index >= 0 ? meshes_[index] : nullptr; }

    // setter
    void setAmbientLight(float ambientLightIntensity);

    void addMesh(Mesh *mesh);
    void removeMesh(int index);
    void clearMeshes();
};

#endif