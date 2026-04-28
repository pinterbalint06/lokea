#ifndef PERSPECTIVE_PROJECTION_MATRIX_H
#define PERSPECTIVE_PROJECTION_MATRIX_H

#include "core/projection/projectionMatrix.h"

class PerspectiveProjectionMatrix : public ProjectionMatrix
{
private:
public:
    PerspectiveProjectionMatrix(float near, float far);

    void updateMatrix() override;
};

#endif
