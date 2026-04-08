#ifndef EQUIRECTANGULAR_ENGINE_CONFIG_H
#define EQUIRECTANGULAR_ENGINE_CONFIG_H

struct EquirectangularEngineConfig
{
    // arrow mesh generation
    float arrowSize = 0.25f;
    float arrowCameraRadiusDistance = 0.75f;
    float arrowHeightY = -1.0f;
    float shadowYOffset = -0.025f;
    float shadowOutlineWidth = 0.01f;

    // sphere generation
    int sphereRingCount = 32;
    int sphereSegmentCount = 32;
    float sphereRadius = 10.0f;
};

constexpr EquirectangularEngineConfig EQUIRECTANGULAR_SETTINGS;

#endif
