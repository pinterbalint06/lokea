#include "randomNumber.h"
#include <emscripten/emscripten.h>
#include <cmath>
#include <algorithm>

float dotProduct(float x0, float y0, float x1, float y1)
{
    return x0 * x1 + y0 * y1;
}

void randVector(pcgRand *random, float *vecX, float *vecY)
{
    float angle = random->randomFloat() * 2 * M_PI;
    *vecX = cosf(angle);
    *vecY = sinf(angle);
}

float smoothingFunction(float d)
{
    //  6 * t^5 - 15 * t^4 + 10 * t^3 = t * t * t * (t * (t * 6 - 15) + 10);
    // Horner's method
    return d * d * d * (d * (d * 6 - 15) + 10);
}

float linearInterpolation(float a1, float a2, float d)
{
    return a1 + (a2 - a1) * smoothingFunction(d);
}

void generatePerlinNoise(float *values, float *normals, float frequency, int size, uint32_t seed, float amplitude, int octaveCount, float lacunarity = 2, float persistence = 0.5, float noiseOffset = 0, float noiseSize = 1)
{
    std::fill(normals, normals + size * size * 3, 0.0f);
    float currAmplitude = amplitude;
    float currFrequency = frequency;
    float gridSize = size / currFrequency;
    float sumAmplitude = 0;
    float vecX, vecY;
    float *derivatives = (float *)malloc(size * size * 2 * sizeof(float));
    for (int i = 0; i < octaveCount; i++)
    {
        pcgRand rnd(seed + i);
        int gridCount = size / gridSize + 1;
        float *vectors = (float *)malloc(gridCount * gridCount * 2 * sizeof(float));
        int baseIndex;
        for (int y = 0; y < gridCount; y++)
        {
            for (int x = 0; x < gridCount; x++)
            {
                baseIndex = (y * gridCount + x) * 2;
                randVector(&rnd, &vectors[baseIndex], &vectors[baseIndex + 1]);
            }
        }
        for (int y = 0; y < size; y++)
        {
            for (int x = 0; x < size; x++)
            {
                // x1, y1 current point on the grid
                float x1 = (float)x / gridSize;
                float y1 = (float)y / gridSize;

                // coordinates of the grid around the current point
                int leftGrid = (int)std::floor(x1);
                int rightGrid = leftGrid + 1;
                int topGrid = (int)std::floor(y1);
                int bottomGrid = topGrid + 1;

                // (dir)grid->currPoint
                // left grid to point
                float leftToPointComp = x1 - leftGrid;
                // right grid to point
                float rightToPointComp = x1 - rightGrid;
                // bottom grid to point
                float bottomToPointComp = y1 - bottomGrid;
                // top grid to point
                float topToPointComp = y1 - topGrid;

                // baseTopIndex is the index for the row in vectors array
                int baseTopIndex = topGrid * gridCount;
                // +the column location
                // times two because there are two datas stored x and y
                int TopLeftVectorInd = (baseTopIndex + leftGrid) * 2;
                int TopRightVectorInd = (baseTopIndex + rightGrid) * 2;

                // same as above just with bottom
                int baseBottomIndex = bottomGrid * gridCount;
                int BottomLeftVectorInd = (baseBottomIndex + leftGrid) * 2;
                int BottomRightVectorInd = (baseBottomIndex + rightGrid) * 2;

                // calculate dot products
                float a = dotProduct(leftToPointComp, topToPointComp, vectors[TopLeftVectorInd], vectors[TopLeftVectorInd + 1]);
                float b = dotProduct(rightToPointComp, topToPointComp, vectors[TopRightVectorInd], vectors[TopRightVectorInd + 1]);
                float c = dotProduct(leftToPointComp, bottomToPointComp, vectors[BottomLeftVectorInd], vectors[BottomLeftVectorInd + 1]);
                float d = dotProduct(rightToPointComp, bottomToPointComp, vectors[BottomRightVectorInd], vectors[BottomRightVectorInd + 1]);

                // interpolation factors
                //  6 * t^5 - 15 * t^4 + 10 * t^3 = t * t * t * (t * (t * 6 - 15) + 10);
                float u = leftToPointComp * leftToPointComp * leftToPointComp * (leftToPointComp * (leftToPointComp * 6 - 15) + 10);
                float v = topToPointComp * topToPointComp * topToPointComp * (topToPointComp * (topToPointComp * 6 - 15) + 10);
                // derivative
                // 30 * t^4 - 60 * t^3 + 30 * t^2 = 30 * t^2 (t^2-2t+1)
                float du = 30 * leftToPointComp * leftToPointComp * (leftToPointComp * leftToPointComp - 2 * leftToPointComp + 1);
                float dv = 30 * topToPointComp * topToPointComp * (topToPointComp * topToPointComp - 2 * topToPointComp + 1);

                // horizontal interpolations
                // a1 + (a2 - a1) * smoothingFunction(d)
                float inter1 = a + (b - a) * u;
                float inter2 = c + (d - c) * u;

                // vertical interpolations
                // a1 + (a2 - a1) * smoothingFunction(d)
                float inter3 = inter1 + (inter2 - inter1) * v;
                // a + (b - a) * u + (c + (d - c) * u - (a + (b - a) * u )) * v
                // a + (b - a) * u + (c + (d - c) * u - a - (b - a) * u ) * v
                // a + bu - au + (c + du - cu - a - bu + au) * v
                // a + bu - au + cv + duv - cuv - av - buv + auv
                // a + bu - au + cv - av + duv - cuv - buv + auv
                // a + u (b - a) + v(c - a) + uv(d - c - b + a)

                // partial derivative with respect to u
                // u' (b - a) + u'v(d - c - b + a)
                // u' ((b - a) + v(d - c - b + a))
                // partial derivative with respect to v
                // v'(c - a) + uv'(d - c - b + a)
                // v' ((c - a) + u(d - c - b + a))
                // precalculate coefficients
                float k0 = b - a;
                float k1 = c - a;
                float k2 = d - c - b + a;

                // u' ((b - a) + v(d - c - b + a))
                // u' (k0 + v * k3)
                float derivX = du * (k0 + v * k2);
                // v' ((c - a) + u(d - c - b + a))
                // v' (k1 + u * k3)
                float derivY = dv * (k1 + u * k2);

                // multiplied by current amplitude to account for fractal brownian motion
                derivatives[(y * size + x) * 2] += derivX * currAmplitude;
                derivatives[(y * size + x) * 2 + 1] += derivY * currAmplitude;

                // linear interpolate the dot product of the upper left to point and vector array uperr left and the dot product of the upper right to point and vector array upper right values according to the left to point
                // linear interpolate the bottom like the top values
                // interpolate the horizontal interpolations according to the top to point
                values[y * size + x] += inter3 *
                                        currAmplitude;
            }
        }
        sumAmplitude += currAmplitude;
        currAmplitude *= persistence;
        currFrequency *= lacunarity;
        gridSize = std::max(size / currFrequency, 1.0f);

        free(vectors);
    }
    // normalize noise
    float sumAmpRev = 1.0f / sumAmplitude;
    float normalizeNoiseCoeff = noiseSize * sumAmpRev;
    for (int y = 0; y < size; y++)
    {
        for (int x = 0; x < size; x++)
        {
            int index = y * size + x;
            values[index] = (values[index] * normalizeNoiseCoeff) + noiseOffset;

            
            derivatives[index * 2] *= sumAmpRev * noiseSize * (1.0f/size);
            derivatives[index * 2 + 1] *= sumAmpRev * noiseSize * (1.0f/size);

            // normal vector
            // in world space right handed y up
            // tangent (1, derivX, 0)
            // bitangent (0, derivY, -1)
            // normal = tangent x bitangent (cross product)
            // normal.x = tangent.y*bitangent.z - tangent.z*bitangent.y = derivX*-1 - 0 * derivY = -derivX
            // normal.y = tangent.z*bitangent.x - tangent.x*bitangent.z = 0 * 0 - 1 * -1 = 1
            // normal.z = tangent.x*bitangent.y - tangent.y*bitangent.x = 1 * derivY - derivX * 0 = derivY
            // normals[index * 3 + 1] would be sumAmplitude
            // sumAmplitude / sumAmplitude = 1
            normals[index * 3] = -derivatives[index * 2];
            normals[index * 3 + 1] = 1.0f;
            normals[index * 3 + 2] = derivatives[index * 2 + 1];

            float normLen = std::sqrt(normals[index * 3] * normals[index * 3] + normals[index * 3 + 1] * normals[index * 3 + 1] + normals[index * 3 + 2] * normals[index * 3 + 2]);
            normals[index * 3] /= normLen;
            normals[index * 3 + 1] /= normLen;
            normals[index * 3 + 2] /= normLen;
        }
    }
    free(derivatives);
}
