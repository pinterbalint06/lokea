#include "core/scene/scene.h"
#include "core/scene/distantLight.h"
#include "core/scene/camera/camera.h"

#include "core/resources/mesh.h"

Scene::Scene()
{
    // sun color
    // red: 255.0 normalize -> 255.0f/255.0 = 1.0
    // green: 223.0 normalize -> 223.0f/255.0 = 0.8745
    // blue: 34.0 normalize -> 34.0f/255.0 = 0.13333
    light_ = new DistantLight(1.0f, 1.0f, 1.0f, 1500.0f, 0, -1, 0);
    cam_ = new Camera();
    data_.ambientLight = 4.0f;
}

Scene::~Scene()
{
    delete light_;
    delete cam_;
}

void Scene::setAmbientLight(float ambientLightIntensity)
{
    data_.ambientLight = ambientLightIntensity;
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
