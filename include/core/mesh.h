#ifndef MESH_H
#define MESH_H
#include <emscripten/emscripten.h>
#include "core/material.h"
#include "core/vertex.h"
#include <cstdint>

class Mesh
{
private:
    Vertex *vertices_;
    int32_t *indices_;

    int vertexCount_;
    int indexCount_;
    int normalCount_;

    Materials::Material material_;

    void cleanup();

public:
    Mesh(int vertexCount, int indexCount);

    ~Mesh();

    // getters
    int getVertexCount() const { return vertexCount_; }

    int getIndexCount() const { return indexCount_; }

    Vertex *getVertices() const { return vertices_; }

    int32_t *getIndices() const { return indices_; }

    Materials::Material getMaterial() const { return material_; }

    // setters
    void setMaterial(Materials::Material material) { material_ = material; }

    Mesh(const Mesh &) = delete;
    Mesh &operator=(const Mesh &) = delete;
};

#endif