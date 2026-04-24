#include "core/scene/scene.h"
#include "core/scene/camera/camera.h"

#include "core/resources/mesh.h"

Scene::Scene()
{
    cam_ = new Camera();
}

Scene::~Scene()
{
    delete cam_;
}

void Scene::addMesh(std::shared_ptr<Mesh> mesh)
{
    mesh->setUpOpenGL();
    meshes_.push_back(mesh);
}

void Scene::removeMesh(int index)
{
    meshes_.erase(meshes_.begin() + index);
}

void Scene::removeMesh(std::shared_ptr<Mesh> mesh)
{
    std::erase(meshes_, mesh);
}

void Scene::clearMeshes()
{
    meshes_.clear();
}
