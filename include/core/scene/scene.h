#ifndef SCENE_H
#define SCENE_H

#include <vector>
#include <memory>

// Forward declarations
class Camera; // defined in "core/scene/camera.h"
class Mesh;   // defined in "core/resources/mesh.h"

class Scene
{
private:
    std::unique_ptr<Camera> cam_;
    std::vector<std::shared_ptr<Mesh>> meshes_;

public:
    Scene();
    ~Scene();

    // getters
    Camera *getCamera() const { return cam_.get(); }
    int getMeshCount() const { return meshes_.size(); }
    std::shared_ptr<Mesh> getMesh(int index) const { return meshes_.size() > index && index >= 0 ? meshes_[index] : nullptr; }

    void addMesh(std::shared_ptr<Mesh> mesh);
    void removeMesh(int index);
    void removeMesh(std::shared_ptr<Mesh> mesh);
    void clearMeshes();
};

#endif
