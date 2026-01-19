#include <emscripten.h>
#include <emscripten/bind.h>
#include "core/engine.h"
#include "core/shader.h"
#include "utils/perlin.h"
#include "terrain/terrainEngine.h"
#include "core/material.h"

EMSCRIPTEN_BINDINGS(enums)
{
    emscripten::enum_<Shaders::SHADINGMODE>("SHADINGMODE")
        .value("PHONG", Shaders::SHADINGMODE::PHONG)
        .value("GOURAUD", Shaders::SHADINGMODE::GOURAUD)
        .value("NO_SHADING", Shaders::SHADINGMODE::NO_SHADING);
}

EMSCRIPTEN_BINDINGS(structs)
{
    emscripten::value_object<PerlinNoise::PerlinParameters>("PerlinParameters")
        .field("seed", &PerlinNoise::PerlinParameters::seed)
        .field("octaveCount", &PerlinNoise::PerlinParameters::octaveCount)
        .field("frequency", &PerlinNoise::PerlinParameters::frequency)
        .field("amplitude", &PerlinNoise::PerlinParameters::amplitude)
        .field("persistence", &PerlinNoise::PerlinParameters::persistence)
        .field("lacunarity", &PerlinNoise::PerlinParameters::lacunarity)
        .field("noiseSize", &PerlinNoise::PerlinParameters::noiseSize)
        .field("scaling", &PerlinNoise::PerlinParameters::scaling)
        .field("steepness", &PerlinNoise::PerlinParameters::steepness)
        .field("contrast", &PerlinNoise::PerlinParameters::contrast);

    emscripten::class_<Materials::Color>("Color")
        .constructor<>()
        .property("r", &Materials::Color::r)
        .property("g", &Materials::Color::g)
        .property("b", &Materials::Color::b)
        .class_function("fromRGB", &Materials::Color::fromRGB);

    emscripten::class_<Materials::Material>("Material")
        .constructor<Materials::Color, float, float, float>()
        .property("albedo", &Materials::Material::getAlbedo, &Materials::Material::setAlbedo)
        .property("diffuseness", &Materials::Material::getDiffuseness, &Materials::Material::setDiffuseness)
        .property("specularity", &Materials::Material::getSpecularity, &Materials::Material::setSpecularity)
        .property("shininess", &Materials::Material::getShininess, &Materials::Material::setShininess)
        .class_function("Grass", &Materials::Material::Grass)
        .class_function("Dirt", &Materials::Material::Dirt)
        .class_function("Error", &Materials::Material::Error);
}

EMSCRIPTEN_BINDINGS(terrainEngineBinding)
{
    emscripten::class_<TerrainEngine, emscripten::base<Engine>>("TerrainEngine")
        .constructor<std::string, int>()
        .function("getNoiseParameters", &TerrainEngine::getNoiseParameters)
        .function("setTerrainParams", &TerrainEngine::setTerrainParams)
        .function("getWarpParameters", &TerrainEngine::getWarpParameters)
        .function("setWarpParams", &TerrainEngine::setWarpParams)
        .function("setCameraHeight", &TerrainEngine::setCameraHeight)
        .function("setTextureSpacing", &TerrainEngine::setTextureSpacing)
        .function("setDomainWarp", &TerrainEngine::setDomainWarp)
        .function("setGroundMaterial", &TerrainEngine::setGroundMaterial)
        .function("randomizeLocation", &TerrainEngine::randomizeLocation)
        .function("moveCamera", &TerrainEngine::moveCamera);
}
