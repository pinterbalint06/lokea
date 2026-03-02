#include "core/projection/projectionMatrix.h"

#include "core/math/mathUtils.h"

ProjectionMatrix::ProjectionMatrix(float near, float far)
{
    left_ = -1.0f;
    right_ = 1.0f;

    bottom_ = -1.0f;
    top_ = 1.0f;

    near_ = near;
    far_ = far;
    dirty_ = true;
    MathUtils::setIdentity(matrix_);
}
