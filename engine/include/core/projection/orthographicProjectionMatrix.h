#ifndef ORTHOGRAPHIC_PROJECTION_MATRIX_H
#define ORTHOGRAPHIC_PROJECTION_MATRIX_H

#include "core/projection/projectionMatrix.h"

class OrthographicProjectionMatrix : public ProjectionMatrix
{
private:
public:
    OrthographicProjectionMatrix(float near, float far);

    void updateMatrix() override;
};

#endif
