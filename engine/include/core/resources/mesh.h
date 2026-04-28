#ifndef MESH_H
#define MESH_H

#include <cstdint>
#include <GLES3/gl3.h>
#include <memory>
#include <vector>

#include "core/math/vector.h"
#include "core/resources/material.h"
#include "core/resources/vertex.h"
#include "core/math/matrix.h"

// Forward declarations
namespace Shaders
{
    class Shader; // defined in "core/rendering/shader.h"
}
namespace Materials
{
    class Material; // defined in "core/resources/material.h"
}
class Vertex; // defined in "core/resources/vertex.h"

struct MeshData
{
    Mat4 modelMatrix;
};

class Mesh
{
private:
    // vertex buffer object
    GLuint vbo_;
    // element buffer object
    GLuint ebo_;
    // vertax array object
    GLuint vao_;
    GLuint instanceVbo_;
    int vertexBufferSizeBytes_;
    int instanceBufferSizeBytes_;
    bool staticBuffersInitialized_;

    bool isInstanced_;

    Materials::Material material_;

    void initializeStaticBuffers();
    void updateVertexBuffer();
    void updateInstanceBuffer();

protected:
    std::vector<Vertex> vertices_;
    std::vector<uint32_t> indices_;
    std::vector<Vec2> instanceOffsets_;
    MeshData meshData_;

public:
    Mesh(int vertexCount, int indexCount);
    virtual ~Mesh();

    GLuint setUpOpenGL();

    // getters
    int getVertexCount() const { return static_cast<int>(vertices_.size()); }
    int getIndexCount() const { return static_cast<int>(indices_.size()); }
    int getInstanceCount() const { return static_cast<int>(instanceOffsets_.size()); }
    bool getIsInstanced() const { return isInstanced_; }

    std::vector<Vertex> &getVertices() { return vertices_; }
    const std::vector<Vertex> &getVertices() const { return vertices_; }
    std::vector<uint32_t> &getIndices() { return indices_; }
    const std::vector<uint32_t> &getIndices() const { return indices_; }
    Materials::Material &getMaterial() { return material_; }
    GLuint getVAO() const { return vao_; }
    Mat4 &getModelMatrix() { return meshData_.modelMatrix; }
    const Mat4 &getModelMatrix() const { return meshData_.modelMatrix; }
    const MeshData &getUBOData() const { return meshData_; }

    // setters
    void setMaterial(Materials::Material material) { material_ = material; }
    void setInstances(const std::vector<Vec2> &instances) { instanceOffsets_ = instances; }
    void setIsInstanced(bool isInstanced) { isInstanced_ = isInstanced; }

    Mesh(const Mesh &) = delete;
    Mesh &operator=(const Mesh &) = delete;
};

#endif
