#ifndef BINDING_SLOTS_H
#define BINDING_SLOTS_H

namespace BindingSlots
{
    enum class UBO
    {
        SCENE_DATA = 0,
        MATERIAL_DATA = 1,
        MESH_DATA = 2,
        DISTANT_LIGHT_DATA = 3,
        CAMERA_DATA = 4
    };

    enum class Texture
    {
        ALBEDO = 0,
    };
}

#endif