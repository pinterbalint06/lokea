#ifndef MATH_UTILS_H
#define MATH_UTILS_H

#include <cmath>
#include <algorithm>

#include "utils/pcgRand.h"

namespace MathUtils
{
    constexpr float INV_PI = 0.318309886f;
    constexpr double TWO_PI = M_PI * 2.0;

    inline float dotProduct(const float &x0, const float &y0, const float &x1, const float &y1)
    {
        return x0 * x1 + y0 * y1;
    }

    inline bool isSquareNumber(const int &n)
    {
        return n >= 0 && std::sqrt(n) == (int)std::sqrt(n);
    }

    inline float dotProduct3D(const float *vec0, const float *vec1)
    {
        return vec0[0] * vec1[0] + vec0[1] * vec1[1] + vec0[2] * vec1[2];
    }

    inline float quintic(const float &t)
    {
        //  6 * t^5 - 15 * t^4 + 10 * t^3 = t * t * t * (t * (t * 6 - 15) + 10);
        // Horner's method
        return t * t * t * (10.0f + t * ((-15.0f) + t * 6.0f));
    }

    inline float interpolation(const float &a1, const float &a2, const float &d)
    {
        return a1 + (a2 - a1) * d;
    }

    /*
        4x4 matrix multiplication
    */
    inline void multiplyMatrix(const float *m1, const float *m2, float *result)
    {
        for (int i = 0; i < 4; i++)
        {
            for (int j = 0; j < 4; j++)
            {
                result[i * 4 + j] =
                    m1[i * 4] * m2[j] +
                    m1[i * 4 + 1] * m2[4 + j] +
                    m1[i * 4 + 2] * m2[8 + j] +
                    m1[i * 4 + 3] * m2[12 + j];
            }
        }
    }

    inline void setIdentity(float *m)
    {
        memset(m, 0, 16 * sizeof(float));
        m[0] = 1.0f;
        m[5] = 1.0f;
        m[10] = 1.0f;
        m[15] = 1.0f;
    }

    inline void setTranslation(float *matrix, float translateX, float translateY, float translateZ)
    {
        setIdentity(matrix);
        /*
            translation matrix:
            [1,          0,          0,          0]
            [0,          1,          0,          0]
            [0,          0,          1,          0]
            [translateX, translateY, translateZ, 1]
        */
        matrix[12] = translateX;
        matrix[13] = translateY;
        matrix[14] = translateZ;
    }

    inline void setScale(float *matrix, float scaleX, float scaleY, float scaleZ)
    {
        setIdentity(matrix);
        /*
            scale matrix:
            [scaleX, 0,      0,      0]
            [0,      scaleY, 0,      0]
            [0,      0,      scaleZ, 0]
            [0,      0,      0,      1]
        */
        matrix[0] = scaleX;
        matrix[5] = scaleY;
        matrix[10] = scaleZ;
    }

    inline void setRotationX(float *matrix, float angleRadians)
    {
        setIdentity(matrix);
        float cosine = std::cos(angleRadians);
        float sine = std::sin(angleRadians);
        /*
            X rotation matrix:
            [1, 0,     0,    0]
            [0, cos,   sine, 0]
            [0, -sine, cos,  0]
            [0, 0,     0,    1]
        */
        matrix[5] = cosine;
        matrix[6] = sine;
        matrix[9] = -sine;
        matrix[10] = cosine;
    }

    inline void setRotationY(float *matrix, float angleRadians)
    {
        setIdentity(matrix);
        float cosine = std::cos(angleRadians);
        float sine = std::sin(angleRadians);
        /*
            Y rotation matrix:
            [cos,  0, -sine, 0]
            [0,    1, 0,     0]
            [sine, 0, cos,   0]
            [0,    0, 0,     1]
        */
        matrix[0] = cosine;
        matrix[2] = -sine;
        matrix[8] = sine;
        matrix[10] = cosine;
    }

    inline void setRotationZ(float *matrix, float angleRadians)
    {
        setIdentity(matrix);
        float cosine = std::cos(angleRadians);
        float sine = std::sin(angleRadians);
        /*
            Z rotation matrix:
            [cos,   sine, 0, 0]
            [-sine, cos,  0, 0]
            [0,     0,    1, 0]
            [0,     0,    0, 1]
        */
        matrix[0] = cosine;
        matrix[1] = sine;
        matrix[4] = -sine;
        matrix[5] = cosine;
    }

    inline float sign(float val)
    {
        return static_cast<float>((val > 0.0f) - (val < 0.0f));
    }
}

#endif