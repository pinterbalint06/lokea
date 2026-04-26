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
}

GLuint Mesh::setUpOpenGL()
{
    if (vao_ == 0)
    {
        glGenVertexArrays(1, &vao_);
        glGenBuffers(1, &vbo_);
        glGenBuffers(1, &ebo_);

        glBindVertexArray(vao_);

        glBindBuffer(GL_ARRAY_BUFFER, vbo_);
        glBufferData(GL_ARRAY_BUFFER, vertices_.size() * sizeof(Vertex), vertices_.data(), GL_STATIC_DRAW);

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo_);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices_.size() * sizeof(uint32_t), indices_.data(), GL_STATIC_DRAW);

        glVertexAttribPointer(0, 4, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void *)0);
        glEnableVertexAttribArray(0);
        glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void *)(4 * sizeof(float)));
        glEnableVertexAttribArray(1);
    }
    else
    {
        glBindVertexArray(vao_);

        glBindBuffer(GL_ARRAY_BUFFER, vbo_);
        glBufferData(GL_ARRAY_BUFFER, vertices_.size() * sizeof(Vertex), vertices_.data(), GL_STATIC_DRAW);

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo_);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices_.size() * sizeof(uint32_t), indices_.data(), GL_STATIC_DRAW);
    }

    glBindVertexArray(0);
    return vao_;
}

void Mesh::prepareRender(Shaders::Shader *shader) {}
