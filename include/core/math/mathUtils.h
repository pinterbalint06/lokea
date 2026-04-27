#ifndef MATH_UTILS_H
#define MATH_UTILS_H

#include <cmath>
#include <algorithm>

#include "core/math/vector.h"

namespace MathUtils
{
    constexpr double TWO_PI = M_PI * 2.0;

    inline float interpolation(float start, float end, float progress)
    {
        return start + (end - start) * progress;
    }

    inline float normalizeAngleRadians(float angleInRadians)
    {
        return angleInRadians - TWO_PI * std::floor(angleInRadians / TWO_PI);
    }

    inline Vec3 sphericalToCartesian(float polarAngle, float azimuthalAngle, float radius)
    {
        float sinPolar = std::sin(polarAngle);
        float cosPolar = std::cos(polarAngle);
        float sinAzimuthal = std::sin(azimuthalAngle);
        float cosAzimuthal = std::cos(azimuthalAngle);

        float x = cosAzimuthal * sinPolar * radius;
        float y = cosPolar * radius;
        float z = sinAzimuthal * sinPolar * radius;

        return Vec3(x, y, z);
    }
}

#endif