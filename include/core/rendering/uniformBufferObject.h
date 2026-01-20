#ifndef UNIFORM_BUFFER_OBJECT_H
#define UNIFORM_BUFFER_OBJECT_H

#include <GLES3/gl3.h>

#include "core/rendering/bindingSlots.h"

template <typename UBODataStruct>
class UniformBufferObject
{
private:
    GLuint id_;
    int bindingSlot_;

public:
    UniformBufferObject(BindingSlots::UBO bindingSlot);
    ~UniformBufferObject();

    const GLuint getID() const { return id_; }

    void update(const UBODataStruct &data);
};

#endif