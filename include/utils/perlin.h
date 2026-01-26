#ifndef PERLIN_NOISE_H
#define PERLIN_NOISE_H

#include <GLES3/gl3.h>
#include <cstdint>
#include <vector>

// Forward declarations
class pcgRand; // defined in "utils/pcgRand.h"
struct Vec2;   // defined in "core/math/vector.h"

namespace PerlinNoise
{
    struct PerlinParameters
    {
        int seed;          // 0
        int octaveCount;   // 4
        float frequency;   // 8
        float amplitude;   // 12
        float persistence; // 16
        float lacunarity;  // 20
        float noiseSize;   // 24
        float scaling;     // 28
        float steepness;   // 32
        int contrast;      // 36
        float padding[2];  // 40-48
    };

    class Perlin
    {
    private:
        struct GridPoint;

        std::vector<uint8_t> permutationTable_;
        std::vector<Vec2> gradients_;
        GLuint permuTableTex_;
        GLuint gradientsTex_;
        GLuint parametersUBO_;
        PerlinParameters params_;
        bool isGPUSet_;

        GridPoint calculateGridPoint(const float x, const float y) const;
        void createPermutationTable(pcgRand &rand);
        void createGradientTable(pcgRand &rand);
        uint8_t hash(const int x, const int y) const;
        const Vec2 &getGradientVector(const int x, const int y) const;

    public:
        Perlin(PerlinParameters params);

        ~Perlin();

        // getter
        PerlinParameters getParameters() const { return params_; }
        GLuint getPermutationGPULoc() const { return permuTableTex_; }
        GLuint getGradientsGPULoc() const { return gradientsTex_; }
        GLuint getUBOloc() { return parametersUBO_; };

        // setters
        void setLacunarity(float lacunarity);
        void setPersistence(float persistence);
        void setFrequency(float frequency);
        void setNoiseSize(float noiseSize);
        void setOctaves(int octaves);
        void setSteepness(float steepness);
        void setContrast(int contrast);
        void setParams(PerlinParameters &params);

        // one octave noise
        float noise(float x, float y) const;

        // Fractal Brownian Motion
        float fbm(const float x, const float y) const;

        void uploadParametersToGPU();
        void uploadToGPU();
        void setUpGPU(GLuint uboLoc);
    };
}

#endif
