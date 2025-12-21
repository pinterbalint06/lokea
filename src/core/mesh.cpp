#include "core/mesh.h"
#include "core/vertex.h"
#include <cstdint>

Mesh::Mesh(int vertexCount, int indexCount)
{
    vertexCount_ = vertexCount;
    indexCount_ = indexCount;
    normalCount_ = vertexCount_;
    vertices_ = (Vertex *)malloc(vertexCount_ * sizeof(Vertex));
    indices_ = (int32_t *)malloc(indexCount_ * sizeof(int32_t));
}

Mesh::~Mesh()
{
    cleanup();
}

void Mesh::cleanup()
{
    if (vertices_)
    {
        free(vertices_);
        vertices_ = nullptr;
    }
    if (indices_)
    {
        free(indices_);
        indices_ = nullptr;
    }
    vertexCount_ = 0;
    indexCount_ = 0;
}