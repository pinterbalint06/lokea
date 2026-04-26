#include <cstring>

#include "core/projection/projectionMatrix.h"
#include "core/projection/perspectiveProjectionMatrix.h"

PerspectiveProjectionMatrix::PerspectiveProjectionMatrix(float near, float far) : ProjectionMatrix(near, far)
{
    updateMatrix();
}

void PerspectiveProjectionMatrix::updateMatrix()
{
    if (dirty_)
    {
        matrix_ = Mat4::zero();
        matrix_.data[0] = 2.0f * near_ / (right_ - left_);
        matrix_.data[5] = 2.0f * near_ / (top_ - bottom_);
        matrix_.data[8] = (right_ + left_) / (right_ - left_);
        matrix_.data[9] = (top_ + bottom_) / (top_ - bottom_);
        matrix_.data[10] = -(far_ + near_) / (far_ - near_);
        matrix_.data[11] = -1.0f;
        matrix_.data[14] = -2.0f * near_ * far_ / (far_ - near_);
        dirty_ = false;
    }
}
