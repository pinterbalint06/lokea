#ifndef VERTEX_H
#define VERTEX_H

#include "core/math/mathUtils.h"

/**
 * @brief It's a vertex in 3D space with attributes.
 */
struct Vertex
{
    // Position
    float x, y, z, w;

    // texture coordinates
    float u, v;
};

#endif