#ifndef PERLIN_NOISE_H
#define PERLIN_NOISE_H

#include <cstdint>
class pcgRand;
struct Vec2;

namespace PerlinNoise
{
    class Perlin
    {
    private:
        uint8_t *p_;
        Vec2 *gradients_;

        static float dotProduct(const Vec2 &grad, const float x, const float y);
        uint8_t hash(const int x, const int y);

    public:
        Perlin(uint32_t seed);

        ~Perlin();

        // one octave noise
        float noise(float x, float y);

        // Fractal Brownian Motion
        float fbm(const float x, const float y, int octaveCount, float frequency, float amplitude, float persistence, float lacunarity);
    };
}

#endif
