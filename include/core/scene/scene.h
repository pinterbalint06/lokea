#ifndef SCENE_H
#define SCENE_H

#include <vector>

#include "core/scene/distantLight.h"

// Forward declarations
class Camera; // defined in "core/scene/camera.h"
class Mesh;   // defined in "core/resources/mesh.h"

struct SceneData
{
    float ambientLight; // 0 -> 4
    float pad[3];       // 12 -> 16
};

class Scene
{
private:
    Camera *cam_;
    DistantLight *light_;
    SceneData data_;
    float ambientLight_;
    std::vector<Mesh *> meshes_;

public:
    Scene();
    ~Scene();

    // getters
    Camera *getCamera() const { return cam_; }
    DistantLight *getLight() const { return light_; }
    float getAmbientLight() const { return data_.ambientLight; }
    int getMeshCount() const { return meshes_.size(); }
    Mesh *getMesh(int index) const { return meshes_.size() > index && index >= 0 ? meshes_[index] : nullptr; }
    const SceneData &getUBOData() const { return data_; }

    // setter
    void setAmbientLight(float ambientLightIntensity);

    void addMesh(Mesh *mesh);
    void removeMesh(int index);
    void clearMeshes();
};

#endif