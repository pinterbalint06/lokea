#ifndef VECTOR_H
#define VECTOR_H

#include <cmath>

#include "core/math/mathUtils.h"

/**
 * @brief It's a vector in 2D space.
 */
struct Vec2
{
    // Position
    float x, y;

    Vec2()
    {
        x = 0.0f;
        y = 0.0f;
    }

    constexpr Vec2(float x, float y)
    {
        this->x = x;
        this->y = y;
    }

    inline float length()
    {
        return std::sqrt(x * x + y * y);
    }

    void normalize()
    {
        float lengthInv = 1.0f / length();
        x *= lengthInv;
        y *= lengthInv;
    }

    static inline float dotProduct(Vec2 &vec1, Vec2 &vec2)
    {
        return vec1.x * vec2.x + vec1.y * vec2.y;
    }

    inline Vec2 operator-(const Vec2& other) const
    {
        return Vec2(x - other.x, y - other.y);
    }
};

/**
 * @brief It's a vector in 3D space.
 */
struct Vec3
{
    float x, y, z;

    Vec3()
    {
        x = 0.0f;
        y = 0.0f;
        z = 0.0f;
    }

    Vec3(float x, float y, float z)
    {
        this->x = x;
        this->y = y;
        this->z = z;
    }

    inline float length()
    {
        return std::sqrt(x * x + y * y + z * z);
    }

    void normalize()
    {
        float lengthInv = 1.0f / length();
        x *= lengthInv;
        y *= lengthInv;
        z *= lengthInv;
    }

    inline Vec3 operator+(const Vec3& other) const
    {
        return Vec3(x + other.x, y + other.y, z + other.z);
    }

    inline Vec3 operator*(float scalar) const
    {
        return Vec3(x * scalar, y * scalar, z * scalar);
    }
};

/**
 * @brief It's a vector in 4D space, primarily used for matrix multiplication.
 */
struct Vec4
{
    float x, y, z, w;

    Vec4()
    {
        x = 0.0f;
        y = 0.0f;
        z = 0.0f;
        w = 1.0f;
    }

    constexpr Vec4(float x, float y, float z, float w)
    {
        this->x = x;
        this->y = y;
        this->z = z;
        this->w = w;
    }
};

#endif