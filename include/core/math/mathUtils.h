#ifndef MATH_UTILS_H
#define MATH_UTILS_H

#include <cmath>
#include <algorithm>

namespace MathUtils
{
    constexpr double TWO_PI = M_PI * 2.0;

    inline float interpolation(const float &a1, const float &a2, const float &d)
    {
        return a1 + (a2 - a1) * d;
    }

    inline float normalizeAngleRadians(float angleInRadians)
    {
        return angleInRadians - TWO_PI * std::floor(angleInRadians / TWO_PI);
    }
}

#endif