#include <GLES3/gl3.h>
#include <cmath>
#include <cstdint>
#include <emscripten/emscripten.h>

#include "core/math//mathUtils.h"
#include "core/math/vector.h"

#include "utils/perlin.h"

namespace PerlinNoise
{
    constexpr int GRADIENTS_SIZE = 256;
    constexpr int GRADIENTS_MASK = GRADIENTS_SIZE - 1;
    constexpr int PERMUTATION_TABLE_SIZE = GRADIENTS_SIZE * 2;

    struct Perlin::GridPoint
    {
        int bottomLeftX, bottomLeftY; ///< bottom-left grid coordinates
        int topRightX, topRightY;     ///< top-right grid coordinates
        float relativeX, relativeY;   ///< coordinates within that grid
    };

    inline Perlin::GridPoint Perlin::calculateGridPoint(const float x, const float y) const
    {
        GridPoint currentGridPoint;
        // wrap to 0-GRADIENTS_MASK
        currentGridPoint.bottomLeftX = (static_cast<int>(std::floor(x))) & GRADIENTS_MASK;
        currentGridPoint.bottomLeftY = (static_cast<int>(std::floor(y))) & GRADIENTS_MASK;

        currentGridPoint.topRightX = (currentGridPoint.bottomLeftX + 1) & GRADIENTS_MASK;
        currentGridPoint.topRightY = (currentGridPoint.bottomLeftY + 1) & GRADIENTS_MASK;

        // drop the integer part. this is the location in the grid
        currentGridPoint.relativeX = x - std::floor(x);
        currentGridPoint.relativeY = y - std::floor(y);
        return currentGridPoint;
    }

    inline uint8_t Perlin::hash(const int x, const int y) const
    {
        // permutationTable_[index] is a value between 0-GRADIENTS_MASK
        return permutationTable_[permutationTable_[x] + y];
    }

    inline const Vec2 &Perlin::getGradientVector(const int x, const int y) const
    {
        return gradients_[hash(x, y)];
    }

    void Perlin::createPermutationTable(pcgRand &rand)
    {
        // setup permutation table
        for (int i = 0; i < GRADIENTS_SIZE; i++)
        {
            permutationTable_[i] = i;
        }

        // shuffle the permutation table
        for (int i = GRADIENTS_MASK; i > 0; i--)
        {
            uint8_t j = rand.random() % (i + 1);
            uint8_t temp = permutationTable_[i];
            permutationTable_[i] = permutationTable_[j];
            permutationTable_[j] = temp;
        }

        for (int i = 0; i < GRADIENTS_SIZE; i++)
        {
            permutationTable_[i + GRADIENTS_SIZE] = permutationTable_[i];
        }
    }

    Perlin::Perlin(PerlinParameters params)
    {
        isGPUSet_ = false;
        params_ = params;
        permutationTable_.resize(PERMUTATION_TABLE_SIZE);
        gradients_.resize(GRADIENTS_SIZE);
        pcgRand pcgRandGen(params_.seed);

        createPermutationTable(pcgRandGen);

        // generate gradients
        for (int i = 0; i < GRADIENTS_SIZE; i++)
        {
            gradients_[i] = Vec2::randVector(pcgRandGen);
        }

        permuTableTex_ = 0;
        gradientsTex_ = 0;
        parametersUBO_ = 0;
    }

    Perlin::~Perlin()
    {
        if (permuTableTex_ != 0)
        {
            glDeleteTextures(1, &permuTableTex_);
            permuTableTex_ = 0;
        }
        if (gradientsTex_ != 0)
        {
            glDeleteTextures(1, &gradientsTex_);
            gradientsTex_ = 0;
        }
    }

    void Perlin::setUpGPU(GLuint uboLoc)
    {
        if (uboLoc != 0)
        {
            parametersUBO_ = uboLoc;
            isGPUSet_ = true;
            uploadToGPU();
        }
    }

    void Perlin::setLacunarity(float lacunarity)
    {
        params_.lacunarity = lacunarity;
        uploadParametersToGPU();
    }

    void Perlin::setPersistence(float persistence)
    {
        params_.persistence = persistence;
        uploadParametersToGPU();
    }

    void Perlin::setFrequency(float frequency)
    {
        params_.frequency = frequency;
        uploadParametersToGPU();
    }

    void Perlin::setNoiseSize(float noiseSize)
    {
        params_.noiseSize = noiseSize;
        uploadParametersToGPU();
    }

    void Perlin::setOctaves(int octaves)
    {
        params_.octaveCount = octaves;
        uploadParametersToGPU();
    }

    void Perlin::setSteepness(float steepness)
    {
        params_.steepness = steepness;
        uploadParametersToGPU();
    }

    void Perlin::setContrast(int contrast)
    {
        params_.contrast = contrast;
        uploadParametersToGPU();
    }

    void Perlin::setParams(PerlinParameters &params)
    {
        params_ = params;
        uploadParametersToGPU();
    }

    float Perlin::noise(float x, float y) const
    {
        GridPoint currGridPoint = calculateGridPoint(x, y);

        // get gradient vectors based on hashed value
        Vec2 g00 = getGradientVector(currGridPoint.bottomLeftX, currGridPoint.bottomLeftY);
        Vec2 g10 = getGradientVector(currGridPoint.topRightX, currGridPoint.bottomLeftY);
        Vec2 g01 = getGradientVector(currGridPoint.bottomLeftX, currGridPoint.topRightY);
        Vec2 g11 = getGradientVector(currGridPoint.topRightX, currGridPoint.topRightY);

        // calculate components from grid corners to point
        float leftToPoint = currGridPoint.relativeX;
        float rightToPoint = currGridPoint.relativeX - 1.0f;
        float bottomToPoint = currGridPoint.relativeY;
        float topToPoint = currGridPoint.relativeY - 1.0f;
        Vec2 p00 = Vec2(leftToPoint, bottomToPoint);
        Vec2 p10 = Vec2(rightToPoint, bottomToPoint);
        Vec2 p01 = Vec2(leftToPoint, topToPoint);
        Vec2 p11 = Vec2(rightToPoint, topToPoint);

        // fade
        float u = MathUtils::quintic(currGridPoint.relativeX);
        float v = MathUtils::quintic(currGridPoint.relativeY);

        float a = MathUtils::interpolation(Vec2::dotProduct(g00, p00), Vec2::dotProduct(g10, p10), u);
        float b = MathUtils::interpolation(Vec2::dotProduct(g01, p01), Vec2::dotProduct(g11, p11), u);

        return MathUtils::interpolation(a, b, v);
    }

    float Perlin::fbm(const float x, const float y) const
    {
        float total = 0;
        float maxValue = 0;
        float amp = params_.amplitude;
        float freq = params_.frequency;

        for (int i = 0; i < params_.octaveCount; i++)
        {
            total += noise(x * freq, y * freq) * amp;
            maxValue += amp;
            amp *= params_.persistence;
            freq *= params_.lacunarity;
        }

        return std::pow((total / maxValue), params_.contrast) * params_.noiseSize;
    }

    void Perlin::uploadParametersToGPU()
    {
        if (isGPUSet_ && parametersUBO_ != 0)
        {
            glBindBuffer(GL_UNIFORM_BUFFER, parametersUBO_);
            glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(PerlinParameters), &params_);
            glBindBuffer(GL_UNIFORM_BUFFER, 0);
        }
    }

    void Perlin::uploadToGPU()
    {
        if (permuTableTex_ == 0)
        {
            glGenTextures(1, &permuTableTex_);
        }
        glBindTexture(GL_TEXTURE_2D, permuTableTex_);

        glTexImage2D(GL_TEXTURE_2D, 0, GL_R8UI, PERMUTATION_TABLE_SIZE, 1, 0, GL_RED_INTEGER, GL_UNSIGNED_BYTE, permutationTable_.data());
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
        glBindTexture(GL_TEXTURE_2D, 0);

        if (gradientsTex_ == 0)
        {
            glGenTextures(1, &gradientsTex_);
        }
        glBindTexture(GL_TEXTURE_2D, gradientsTex_);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RG32F, GRADIENTS_SIZE, 1, 0, GL_RG, GL_FLOAT, gradients_.data());
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        glBindTexture(GL_TEXTURE_2D, 0);

        uploadParametersToGPU();
    }
}