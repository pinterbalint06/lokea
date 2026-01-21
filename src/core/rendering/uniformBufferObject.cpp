#include <GLES3/gl3.h>

#include "core/rendering/bindingSlots.h"
#include "core/rendering/uniformBufferObject.h"

#include "core/scene/scene.h"
#include "core/scene/camera.h"
#include "core/scene/distantLight.h"

#include "core/resources/material.h"
#include "core/resources/mesh.h"

#include "utils/perlin.h"

template <typename UBODataStruct>
UniformBufferObject<UBODataStruct>::UniformBufferObject(BindingSlots::UBO bindingSlot)
{
    bindingSlot_ = (int)bindingSlot;
    id_ = 0;
    glGenBuffers(1, &id_);
    // bind to buffer
    glBindBuffer(GL_UNIFORM_BUFFER, id_);
    // set buffer size and fill with 0 (NULL)
    glBufferData(GL_UNIFORM_BUFFER, sizeof(UBODataStruct), 0, GL_STATIC_DRAW);
    // link the buffer to the UBO binding slot
    glBindBufferRange(GL_UNIFORM_BUFFER, bindingSlot_, id_, 0, sizeof(UBODataStruct));
    // unbind buffer
    glBindBuffer(GL_UNIFORM_BUFFER, 0);
}

template <typename UBODataStruct>
UniformBufferObject<UBODataStruct>::~UniformBufferObject()
{
    if (id_ != 0)
    {
        glDeleteBuffers(1, &id_);
    }
}

template <typename UBODataStruct>
void UniformBufferObject<UBODataStruct>::update(const UBODataStruct &data)
{
    glBindBuffer(GL_UNIFORM_BUFFER, id_);
    glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(UBODataStruct), &data);
    glBindBuffer(GL_UNIFORM_BUFFER, 0);
}

template class UniformBufferObject<SceneData>;
template class UniformBufferObject<DistantLightData>;
template class UniformBufferObject<CameraData>;
template class UniformBufferObject<Materials::MaterialData>;
template class UniformBufferObject<PerlinNoise::PerlinParameters>;
template class UniformBufferObject<MeshData>;
