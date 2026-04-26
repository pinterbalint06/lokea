#include <cstring>

#include "core/projection/projectionMatrix.h"
#include "core/projection/orthographicProjectionMatrix.h"

OrthographicProjectionMatrix::OrthographicProjectionMatrix(float near, float far) : ProjectionMatrix(near, far)
{
    updateMatrix();
}

void OrthographicProjectionMatrix::updateMatrix()
{
    if (dirty_)
    {
        matrix_ = Mat4::zero();
        matrix_.data[0] = 2.0f / (right_ - left_);
        matrix_.data[5] = 2.0f / (top_ - bottom_);
        matrix_.data[10] = -2.0f / (far_ - near_);
        matrix_.data[12] = -(right_ + left_) / (right_ - left_);
        matrix_.data[13] = -(top_ + bottom_) / (top_ - bottom_);
        matrix_.data[14] = -(far_ + near_) / (far_ - near_);
        matrix_.data[15] = 1.0f;
        dirty_ = false;
    }
}
