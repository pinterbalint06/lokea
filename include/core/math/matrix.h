#ifndef MATRIX_H
#define MATRIX_H

#include <cmath>
#include <cstring>
#include "core/math/vector.h"

struct Mat4
{
    float data[16];

    Mat4()
    {
        setIdentity();
    }

    static Mat4 identity()
    {
        return Mat4();
    }

    static Mat4 zero()
    {
        Mat4 matrix;
        matrix.setZero();
        return matrix;
    }

    static Mat4 translation(float translateX, float translateY, float translateZ)
    {
        Mat4 matrix = identity();
        /*
            translation matrix:
            [1,          0,          0,          0]
            [0,          1,          0,          0]
            [0,          0,          1,          0]
            [translateX, translateY, translateZ, 1]
        */
        matrix.data[12] = translateX;
        matrix.data[13] = translateY;
        matrix.data[14] = translateZ;
        return matrix;
    }

    static Mat4 scale(float scaleX, float scaleY, float scaleZ)
    {
        Mat4 matrix = identity();
        /*
            scale matrix:
            [scaleX, 0,      0,      0]
            [0,      scaleY, 0,      0]
            [0,      0,      scaleZ, 0]
            [0,      0,      0,      1]
        */
        matrix.data[0] = scaleX;
        matrix.data[5] = scaleY;
        matrix.data[10] = scaleZ;
        return matrix;
    }

    static Mat4 rotationX(float angleRadians)
    {
        Mat4 matrix = identity();
        float cosine = std::cos(angleRadians);
        float sine = std::sin(angleRadians);
        /*
            X rotation matrix:
            [1, 0,     0,    0]
            [0, cos,   sine, 0]
            [0, -sine, cos,  0]
            [0, 0,     0,    1]
        */
        matrix.data[5] = cosine;
        matrix.data[6] = sine;
        matrix.data[9] = -sine;
        matrix.data[10] = cosine;
        return matrix;
    }

    static Mat4 rotationY(float angleRadians)
    {
        Mat4 matrix = identity();
        float cosine = std::cos(angleRadians);
        float sine = std::sin(angleRadians);
        /*
            Y rotation matrix:
            [cos,  0, -sine, 0]
            [0,    1, 0,     0]
            [sine, 0, cos,   0]
            [0,    0, 0,     1]
        */
        matrix.data[0] = cosine;
        matrix.data[2] = -sine;
        matrix.data[8] = sine;
        matrix.data[10] = cosine;
        return matrix;
    }

    static Mat4 rotationZ(float angleRadians)
    {
        Mat4 matrix = identity();
        float cosine = std::cos(angleRadians);
        float sine = std::sin(angleRadians);
        /*
            Z rotation matrix:
            [cos,   sine, 0, 0]
            [-sine, cos,  0, 0]
            [0,     0,    1, 0]
            [0,     0,    0, 1]
        */
        matrix.data[0] = cosine;
        matrix.data[1] = sine;
        matrix.data[4] = -sine;
        matrix.data[5] = cosine;
        return matrix;
    }

    Mat4 operator*(const Mat4 &other) const
    {
        Mat4 result = Mat4::zero();
        for (int row = 0; row < 4; row++)
        {
            for (int col = 0; col < 4; col++)
            {
                result.data[row * 4 + col] =
                    data[row * 4] * other.data[col] +
                    data[row * 4 + 1] * other.data[4 + col] +
                    data[row * 4 + 2] * other.data[8 + col] +
                    data[row * 4 + 3] * other.data[12 + col];
            }
        }
        return result;
    }

    Vec4 operator*(const Vec4 &vec) const
    {
        Vec4 result;
        result.x = data[0] * vec.x + data[1] * vec.y + data[2] * vec.z + data[3] * vec.w;
        result.y = data[4] * vec.x + data[5] * vec.y + data[6] * vec.z + data[7] * vec.w;
        result.z = data[8] * vec.x + data[9] * vec.y + data[10] * vec.z + data[11] * vec.w;
        result.w = data[12] * vec.x + data[13] * vec.y + data[14] * vec.z + data[15] * vec.w;
        return result;
    }

    float &operator[](int index)
    {
        return data[index];
    }

    const float &operator[](int index) const
    {
        return data[index];
    }

private:
    void setZero()
    {
        std::memset(data, 0, sizeof(data));
    }

    void setIdentity()
    {
        setZero();
        /*
            Identity matrix:
            [1, 0, 0, 0]
            [0, 1, 0, 0]
            [0, 0, 1, 0]
            [0, 0, 0, 1]
        */
        data[0] = 1.0f;
        data[5] = 1.0f;
        data[10] = 1.0f;
        data[15] = 1.0f;
    }
};

#endif