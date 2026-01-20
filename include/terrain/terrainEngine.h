#ifndef TERRAIN_ENGINE_H
#define TERRAIN_ENGINE_H

#include <string>
#include <memory>

#include "core/rendering/uniformBufferObject.h"

#include "core/scene/scene.h"

#include "core/engine.h"

#include "terrain/terrain.h"

// Forward declarations
namespace Materials
{
    class Material; // defined in "core/resources/material.h"
}
namespace PerlinNoise
{
    struct PerlinParameters; // defined in "utils/perlin.h"
}

class Mesh;

class TerrainEngine : public Engine
{
private:
    Terrain *terrain_;
    float cameraHeight_;
    int cameraLocation_;

    std::unique_ptr<UniformBufferObject<PerlinNoise::PerlinParameters>> uboPerlin_;
    std::unique_ptr<UniformBufferObject<PerlinNoise::PerlinParameters>> uboWarp_;

    void calcNewCamLoc();

public:
    TerrainEngine(const std::string &canvID, int size);
    ~TerrainEngine();

    PerlinNoise::PerlinParameters getNoiseParameters() const { return terrain_->getNoiseParameters(); };
    PerlinNoise::PerlinParameters getWarpParameters() const { return terrain_->getWarpParameters(); };

    void setCameraHeight(float cameraHeight);
    void setTerrainParams(int size, PerlinNoise::PerlinParameters &params);
    void setWarpParams(int size, PerlinNoise::PerlinParameters &params);
    void setTextureSpacing(float textureSpacing);
    void setDomainWarp(bool domainWarp);
    void setGroundMaterial(Materials::Material material);

    void randomizeLocation();
    void moveCamera(int x, int z);
};

#endif