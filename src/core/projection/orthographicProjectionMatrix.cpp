#include <cstring>

#include "core/projection/projectionMatrix.h"
#include "core/projection/orthographicProjectionMatrix.h"

#include "core/math/mathUtils.h"

OrthographicProjectionMatrix::OrthographicProjectionMatrix(float near, float far) : ProjectionMatrix(near, far)
{
    updateMatrix();
}

void OrthographicProjectionMatrix::updateMatrix()
{
    if (dirty_)
    {
        memset(matrix_, 0, 16 * sizeof(float));
        matrix_[0] = 2.0f / (right_ - left_);
        matrix_[5] = 2.0f / (top_ - bottom_);
        matrix_[10] = -2.0f / (far_ - near_);
        matrix_[12] = -(right_ + left_) / (right_ - left_);
        matrix_[13] = -(top_ + bottom_) / (top_ - bottom_);
        matrix_[14] = -(far_ + near_) / (far_ - near_);
        matrix_[15] = 1.0f;
        dirty_ = false;
    }
}
