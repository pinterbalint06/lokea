#include <GLES3/gl3.h>

#include "core/rendering/shader.h"

#include "core/resources/mesh.h"

Mesh::Mesh(int vertexCount, int indexCount) : material_(Materials::Material::Error())
{
    vertices_.resize(vertexCount);
    indices_.resize(indexCount);
    vbo_ = 0;
    vao_ = 0;
    ebo_ = 0;
    instanceVbo_ = 0;
    vertexBufferSizeBytes_ = 0;
    instanceBufferSizeBytes_ = 0;
    staticBuffersInitialized_ = false;
}

Mesh::~Mesh()
{
    if (vbo_ != 0)
    {
        glDeleteBuffers(1, &vbo_);
    }
    if (vao_ != 0)
    {
        glDeleteVertexArrays(1, &vao_);
    }
    if (ebo_ != 0)
    {
        glDeleteBuffers(1, &ebo_);
    }
    if (instanceVbo_ != 0)
    {
        glDeleteBuffers(1, &instanceVbo_);
    }
}

GLuint Mesh::setUpOpenGL()
{
    initializeStaticBuffers();
    updateVertexBuffer();
    updateInstanceBuffer();

    glBindVertexArray(0);
    return vao_;
}

void Mesh::initializeStaticBuffers()
{
    if (staticBuffersInitialized_)
    {
        glBindVertexArray(vao_);
    }
    else
    {
        if (vao_ == 0)
        {
            glGenVertexArrays(1, &vao_);
            glGenBuffers(1, &vbo_);
            glGenBuffers(1, &ebo_);
        }

        glBindVertexArray(vao_);

        glBindBuffer(GL_ARRAY_BUFFER, vbo_);
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void *)0);
        glEnableVertexAttribArray(0);
        glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void *)(3 * sizeof(float)));
        glEnableVertexAttribArray(1);

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo_);
        int indexDataSize = static_cast<int>(indices_.size() * sizeof(uint32_t));
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, indexDataSize, indices_.data(), GL_STATIC_DRAW);

        if (instanceVbo_ == 0)
        {
            glGenBuffers(1, &instanceVbo_);
        }

        glBindBuffer(GL_ARRAY_BUFFER, instanceVbo_);
        glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, sizeof(Vec2), (void *)0);
        glVertexAttribDivisor(2, 1);
        glEnableVertexAttribArray(2);

        staticBuffersInitialized_ = true;
    }
}

void Mesh::updateVertexBuffer()
{
    if (staticBuffersInitialized_)
    {
        glBindVertexArray(vao_);

        int vertexDataSize = static_cast<int>(vertices_.size() * sizeof(Vertex));
        glBindBuffer(GL_ARRAY_BUFFER, vbo_);

        if (vertexDataSize != vertexBufferSizeBytes_)
        {
            glBufferData(GL_ARRAY_BUFFER, vertexDataSize, vertices_.data(), GL_DYNAMIC_DRAW);
            vertexBufferSizeBytes_ = vertexDataSize;
        }
        else
        {
            if (vertexDataSize > 0)
            {
                glBufferSubData(GL_ARRAY_BUFFER, 0, vertexDataSize, vertices_.data());
            }
        }
    }
}

void Mesh::updateInstanceBuffer()
{
    if (staticBuffersInitialized_)
    {
        glBindVertexArray(vao_);
        glBindBuffer(GL_ARRAY_BUFFER, instanceVbo_);

        int instanceDataSize = static_cast<int>(instanceOffsets_.size() * sizeof(Vec2));

        if (instanceDataSize != instanceBufferSizeBytes_)
        {
            glBufferData(GL_ARRAY_BUFFER, instanceDataSize, instanceOffsets_.data(), GL_DYNAMIC_DRAW);
            instanceBufferSizeBytes_ = instanceDataSize;
        }
        else
        {
            if (instanceDataSize > 0)
            {
                glBufferSubData(GL_ARRAY_BUFFER, 0, instanceDataSize, instanceOffsets_.data());
            }
        }

        glEnableVertexAttribArray(2);
    }
}
