#include <cstring>

#include "core/projection/projectionMatrix.h"
#include "core/projection/perspectiveProjectionMatrix.h"

#include "core/math/mathUtils.h"

PerspectiveProjectionMatrix::PerspectiveProjectionMatrix(float near, float far) : ProjectionMatrix(near, far)
{
    updateMatrix();
}

void PerspectiveProjectionMatrix::updateMatrix()
{
    if (dirty_)
    {
        memset(matrix_, 0, 16 * sizeof(float));
        matrix_[0] = 2.0f * near_ / (right_ - left_);
        matrix_[5] = 2.0f * near_ / (top_ - bottom_);
        matrix_[8] = (right_ + left_) / (right_ - left_);
        matrix_[9] = (top_ + bottom_) / (top_ - bottom_);
        matrix_[10] = -(far_ + near_) / (far_ - near_);
        matrix_[11] = -1.0f;
        matrix_[14] = -2.0f * near_ * far_ / (far_ - near_);
        dirty_ = false;
    }
}
