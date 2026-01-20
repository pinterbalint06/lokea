#ifndef BINDING_SLOTS_H
#define BINDING_SLOTS_H

namespace BindingSlots
{
    enum class UBO
    {
        SCENE_DATA = 0,
        MATERIAL_DATA = 1,
        PERLIN_DATA = 2,
        PERLIN_WARP_DATA = 3,
        MESH_DATA = 4,
        DISTANT_LIGHT_DATA = 5,
        CAMERA_DATA = 6
    };

    enum class Texture
    {
        ALBEDO = 0,
        NOISE_PERMUTATION_TABLE = 5,
        NOISE_GRADIENTS = 6,
        WARP_PERMUTATION_TABLE = 7,
        WARP_GRADIENTS = 8
    };
}

#endif