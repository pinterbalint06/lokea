#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include "utils/perlin.h"
#include "core/camera.h"
#include <cmath>
#include <cstdlib>
#include <cstdint>
#include <algorithm>
#include <stdexcept>
#define INV_PI 0.318309886f
#define FIX_BITS 10
#define FIX_ONE (1 << FIX_BITS)
#define FIX64 (1 << (FIX_BITS * 2))

int meret;
int cameraLocation;
int antialias;
int imageWidth;
int imageHeight;
int zBufferMeret;
int perlinMeret = 0;
int indexekMeret = 0;
int pontokMeret = 0;
int normalsSize = 0;
int bemenetMeret;
int projectedTrianglesMeret;
int clippedMeret;
int imageAntiBufferLength;
int imageBufferLength;
// camera
Camera mainCamera;
// perlin noise height multiplier
float heightMultiplier;
// kamera magassága a talajtól
float kameraMagassag;
// light intensity
float lightIntensity;
// pre calculated light used to multiply the object albedo * light color. INV_PI * lightIntensity
float lightCoefficient;
// color of the ground
float rGround, bGround, gGround;
// perlin parameters
float lacunarity, persistence, frequency;
int octaves, seed;
// sun color
// 255.0 normalize -> 255.0f/255.0 = 1.0
float rSun = 1.0f;
// 223.0 normalize -> 223.0f/255.0 = 0.8745
float gSun = 0.8745f;
// 34.0 normalize -> 34.0f/255.0 = 0.13333
float bSun = 0.13333f;
// grass color
// 65 -> (65/255)^2.2=0.04943 albedo
float rGrass = 0.04943;
// 152 -> (152/255)^2.2=0.32038 albedo
float gGrass = 0.32038f;
// 10 -> (10/255)^2.2=0.000804 albedo
float bGrass = 0.000804f;
// dirt color
// 155 -> (155/255)^2.2=0.33445
float rDirt = 0.33445;
// 118 -> (118/255)^2.2=0.1835489
float gDirt = 0.1835489f;
// 83  -> (83/255)^2.2=0.08464
float bDirt = 0.08464f;
enum SHADINGMODE
{
    PHONG = 0,
    GOURAUD = 1,
    FLAT = 2
};
enum SHADINGMODE currShadingMode = SHADINGMODE::PHONG;
enum NORMALCALCMODE
{
    FINITEDIFFERENCE = 0,
    ANALYTICAL = 1
};
enum NORMALCALCMODE currNormalCalcMode = NORMALCALCMODE::FINITEDIFFERENCE;

float *pontok = NULL;
int32_t *indexek = NULL;
float *perlin = NULL;
float *zBuffer;
float *p0;
float *p1;
float *p2;
float *bemenet;
float *clipped;
float *projectedTriangles;
float *normals;
int *sikok;
float *imageAntiBuffer;
uint8_t *imageBuffer;
float *lightDir;

int32_t Float2Fix(float num)
{
    return (int32_t)((num)*FIX_ONE);
}

int32_t Int2Fix(int num)
{
    return (int32_t)((num)*FIX_ONE);
}

void matrixSzorzas4x4(float *m1, float *m2, float *eredmeny)
{
    for (int i = 0; i < 4; i++)
    {
        for (int j = 0; j < 4; j++)
        {
            eredmeny[i * 4 + j] = m1[i * 4] * m2[j] + m1[i * 4 + 1] * m2[4 + j] + m1[i * 4 + 2] * m2[8 + j] + m1[i * 4 + 3] * m2[12 + j];
        }
    }
}

void calcNewLocationCamera(int index)
{
    mainCamera.setPosition(pontok[index * 3], pontok[index * 3 + 1] + kameraMagassag, pontok[index * 3 + 2]);
}

void ujHely()
{
    cameraLocation = rand() % (pontokMeret / 3);
}

float linearis_interpolacio(float a1, float a2, float d)
{
    return a1 + (a2 - a1) * d;
}

void SutherlandHodgman(float *pont0, float *pont1, float *pont2)
{
    for (int i = 0; i < 4; i++)
    {
        clipped[i] = pont0[i];
        clipped[i + 4] = pont1[i];
        clipped[i + 8] = pont2[i];
    }
    clippedMeret = 12;
    int elozoPontIndex = 8;
    float tavolsag, elozoTavolsag, dTav;
    int k = 0;
    float *temp;
    while (k < 6 && clippedMeret != 0)
    {
        bemenetMeret = clippedMeret;
        temp = bemenet;
        bemenet = clipped;
        clipped = temp;
        clippedMeret = 0;
        for (int i = 0; i < bemenetMeret; i += 4)
        {
            tavolsag = bemenet[i + sikok[k * 3]] + bemenet[i + sikok[k * 3 + 1]] * sikok[k * 3 + 2];
            elozoTavolsag = bemenet[elozoPontIndex + sikok[k * 3]] + bemenet[elozoPontIndex + sikok[k * 3 + 1]] * sikok[k * 3 + 2];
            if (tavolsag >= 0)
            {
                if (elozoTavolsag < 0)
                {
                    dTav = elozoTavolsag / (elozoTavolsag - tavolsag);
                    clipped[clippedMeret++] = linearis_interpolacio(bemenet[elozoPontIndex], bemenet[i], dTav);
                    clipped[clippedMeret++] = linearis_interpolacio(bemenet[elozoPontIndex + 1], bemenet[i + 1], dTav);
                    clipped[clippedMeret++] = linearis_interpolacio(bemenet[elozoPontIndex + 2], bemenet[i + 2], dTav);
                    clipped[clippedMeret++] = linearis_interpolacio(bemenet[elozoPontIndex + 3], bemenet[i + 3], dTav);
                }
                clipped[clippedMeret++] = bemenet[i];
                clipped[clippedMeret++] = bemenet[i + 1];
                clipped[clippedMeret++] = bemenet[i + 2];
                clipped[clippedMeret++] = bemenet[i + 3];
            }
            else
            {
                if (elozoTavolsag >= 0)
                {
                    dTav = elozoTavolsag / (elozoTavolsag - tavolsag);
                    clipped[clippedMeret++] = linearis_interpolacio(bemenet[elozoPontIndex], bemenet[i], dTav);
                    clipped[clippedMeret++] = linearis_interpolacio(bemenet[elozoPontIndex + 1], bemenet[i + 1], dTav);
                    clipped[clippedMeret++] = linearis_interpolacio(bemenet[elozoPontIndex + 2], bemenet[i + 2], dTav);
                    clipped[clippedMeret++] = linearis_interpolacio(bemenet[elozoPontIndex + 3], bemenet[i + 3], dTav);
                }
            }
            elozoPontIndex = i;
        }
        k++;
    }
}

void pontCameraMatrixMultiplication(const int &ind, float *pont)
{
    const float *MView = mainCamera.getViewMatrix();
    for (int i = 0; i < 4; i++)
    {
        pont[i] = pontok[ind * 3] * MView[i] + pontok[ind * 3 + 1] * MView[4 + i] + pontok[ind * 3 + 2] * MView[8 + i] + MView[12 + i];
    }
}

void pontPerspectiveMultiplication(float *pont)
{
    float tempPont[4];
    const float *MProj = mainCamera.getProjMatrix();
    for (int i = 0; i < 4; i++)
    {
        tempPont[i] = pont[0] * MProj[i] + pont[1] * MProj[4 + i] + pont[2] * MProj[8 + i] + MProj[12 + i];
    }
    for (int i = 0; i < 4; i++)
    {
        pont[i] = tempPont[i];
    }
}

void vectorMatrixMultiplication(float *vec, float *matrix)
{
    float tempVec[3];
    for (int i = 0; i < 3; i++)
    {
        tempVec[i] = vec[0] * matrix[i] + vec[1] * matrix[4 + i] + vec[2] * matrix[8 + i];
    }
    for (int i = 0; i < 3; i++)
    {
        vec[i] = tempVec[i];
    }
}

void normalizeVector(float *vector)
{
    float vectorLengthInv = 1 / std::sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
    vector[0] *= vectorLengthInv;
    vector[1] *= vectorLengthInv;
    vector[2] *= vectorLengthInv;
}

void calculateNormal(float *p0, float *p1, float *p2, float *normalVector)
{
    float vec1[3];
    float vec2[3];

    vec1[0] = p1[0] - p0[0];
    vec1[1] = p1[1] - p0[1];
    vec1[2] = p1[2] - p0[2];

    vec2[0] = p2[0] - p0[0];
    vec2[1] = p2[1] - p0[1];
    vec2[2] = p2[2] - p0[2];
    normalVector[0] = vec1[1] * vec2[2] - vec1[2] * vec2[1];
    normalVector[1] = vec1[2] * vec2[0] - vec1[0] * vec2[2];
    normalVector[2] = vec1[0] * vec2[1] - vec1[1] * vec2[0];
}

float dotProduct3D(float *vec0, float *vec1)
{
    return vec0[0] * vec1[0] + vec0[1] * vec1[1] + vec0[2] * vec1[2];
}

void pontokVetitese(const int &i0, const int &i1, const int &i2, float *normal)
{
    pontCameraMatrixMultiplication(i0, p0);
    pontCameraMatrixMultiplication(i1, p1);
    pontCameraMatrixMultiplication(i2, p2);
    calculateNormal(p0, p1, p2, normal);
    // backface culling
    if (dotProduct3D(p0, normal) < 0.0f)
    {
        pontPerspectiveMultiplication(p0);
        pontPerspectiveMultiplication(p1);
        pontPerspectiveMultiplication(p2);
        // clip space
        SutherlandHodgman(p0, p1, p2);
        float wRec;
        projectedTrianglesMeret = 0;
        // triangle fan
        for (int i = 0; i < clippedMeret / 4 - 2; i++)
        {
            wRec = 1.0f / clipped[3];
            projectedTriangles[projectedTrianglesMeret++] = (clipped[0] * wRec + 1) * 0.5f * (float)imageWidth;
            projectedTriangles[projectedTrianglesMeret++] = (1 - clipped[1] * wRec) * 0.5f * (float)imageHeight;
            projectedTriangles[projectedTrianglesMeret++] = clipped[2] * wRec;

            // (i + 1) * 4 = i * 4 + 4
            int index = i * 4 + 4;
            wRec = 1.0f / clipped[index + 3];
            projectedTriangles[projectedTrianglesMeret++] = (clipped[index] * wRec + 1) * 0.5 * imageWidth;
            projectedTriangles[projectedTrianglesMeret++] = (1 - clipped[index + 1] * wRec) * 0.5 * imageHeight;
            projectedTriangles[projectedTrianglesMeret++] = clipped[index + 2] * wRec;

            // (i + 2) * 4 = i * 4 + 8
            index = i * 4 + 8;
            wRec = 1.0f / clipped[index + 3];
            projectedTriangles[projectedTrianglesMeret++] = (clipped[index] * wRec + 1) * 0.5 * imageWidth;
            projectedTriangles[projectedTrianglesMeret++] = (1 - clipped[index + 1] * wRec) * 0.5 * imageHeight;
            projectedTriangles[projectedTrianglesMeret++] = clipped[index + 2] * wRec;
        }
        if (projectedTrianglesMeret > 0)
        {
            normalizeVector(normal);
        }
    }
}

int64_t edgeFunction(int32_t X, int32_t Y, int32_t dX, int32_t dY, int32_t x, int32_t y)
{
    return ((int64_t)(x - X) * dY - (int64_t)(y - Y) * dX);
}

bool isSquareNumber(int n)
{
    return n >= 0 && std::sqrt(n) == (int)std::sqrt(n);
}

int renderPhong()
{
    if (!(isSquareNumber(antialias) && (1 <= antialias && antialias <= 16)))
    {
        throw "Wrong antialias. Must be square number and between 1 and 16!";
    }
    std::fill(zBuffer, zBuffer + zBufferMeret, 1.0f);
    std::fill(imageAntiBuffer, imageAntiBuffer + imageAntiBufferLength, 0.0f);
    std::fill(imageBuffer, imageBuffer + imageBufferLength, 0);
    std::fill(projectedTriangles, projectedTriangles + 100, 0);
    // subpixels width and height
    int sqrAntialias = (int)sqrt(antialias);
    // one subpixel's width and height
    int32_t sqrAntialiasRec = Float2Fix(1.0f / sqrAntialias);
    // half of one subpixel's width and height
    // >> 1 = / 2
    int32_t inc = sqrAntialiasRec >> 1;
    // bounding box
    float htminx, htmaxx, htminy, htmaxy;
    // used for the edge function
    int32_t dX0, dY0, dX1, dY1, dX2, dY2;
    // edge function results
    int64_t w0, w1, w2;
    // reciprocal of the z values
    float z0Rec, z1Rec, z2Rec;
    // triangle's area
    int64_t triArea;
    // triangle's area's reciprocal
    float invTriArea;
    // used for the z-buffer
    float zDepth;
    // indexes
    int bufferIndex, imageIndex;
    // normal of the current triangle
    float *normal = (float *)malloc(3 * sizeof(float));
    float *normalInterpolated = (float *)malloc(3 * sizeof(float));
    // light vector
    float *lightVec = (float *)malloc(3 * sizeof(float));
    float rPix, gPix, bPix;
    lightVec[0] = -lightDir[0];
    lightVec[1] = -lightDir[1];
    lightVec[2] = -lightDir[2];
    // up vector
    float *upVec = (float *)malloc(3 * sizeof(float));
    upVec[0] = 0.0f;
    upVec[1] = 1.0f;
    upVec[2] = 0.0f;
    mainCamera.updateViewMatrix();
    for (int i = 0; i < indexekMeret; i += 3)
    {
        pontokVetitese(indexek[i], indexek[i + 1], indexek[i + 2], normal);
        for (int j = 0; j < projectedTrianglesMeret; j += 9)
        {
            // Calculate bounding box
            htminx = imageWidth;
            htmaxx = -imageWidth;
            htminy = imageHeight;
            htmaxy = -imageHeight;
            for (int k = 0; k < 9; k += 3)
            {
                if (projectedTriangles[j + k] < htminx)
                {
                    htminx = projectedTriangles[j + k];
                }
                if (projectedTriangles[j + k] > htmaxx)
                {
                    htmaxx = projectedTriangles[j + k];
                }
                if (projectedTriangles[j + k + 1] < htminy)
                {
                    htminy = projectedTriangles[j + k + 1];
                }
                if (projectedTriangles[j + k + 1] > htmaxy)
                {
                    htmaxy = projectedTriangles[j + k + 1];
                }
            }
            int bbminx = std::max(0, std::min(imageWidth - 1, (int)std::floor(htminx)));
            int bbminy = std::max(0, std::min(imageHeight - 1, (int)std::floor(htminy)));
            int bbmaxx = std::max(0, std::min(imageWidth - 1, (int)std::ceil(htmaxx)));
            int bbmaxy = std::max(0, std::min(imageHeight - 1, (int)std::ceil(htmaxy)));

            // Convert triangle vertices to fixed point integer
            int32_t v0x = Float2Fix(projectedTriangles[j]);
            int32_t v0y = Float2Fix(projectedTriangles[j + 1]);
            int32_t v0z = Float2Fix(projectedTriangles[j + 2]);
            int32_t v1x = Float2Fix(projectedTriangles[j + 3]);
            int32_t v1y = Float2Fix(projectedTriangles[j + 4]);
            int32_t v1z = Float2Fix(projectedTriangles[j + 5]);
            int32_t v2x = Float2Fix(projectedTriangles[j + 6]);
            int32_t v2y = Float2Fix(projectedTriangles[j + 7]);
            int32_t v2z = Float2Fix(projectedTriangles[j + 8]);

            // precalculate the reciprocal
            z0Rec = 1.0f / projectedTriangles[j + 2];
            z1Rec = 1.0f / projectedTriangles[j + 5];
            z2Rec = 1.0f / projectedTriangles[j + 8];

            // calculate parameters of edge function
            dX0 = v2x - v1x;
            dY0 = v2y - v1y;

            dX1 = v0x - v2x;
            dY1 = v0y - v2y;

            dX2 = v1x - v0x;
            dY2 = v1y - v0y;

            // first pixel's center
            int32_t startX = Int2Fix(bbminx) + inc;
            int32_t startY = Int2Fix(bbminy) + inc;

            // Edge functions
            w0 = edgeFunction(v1x, v1y, dX0, dY0, startX, startY);
            w1 = edgeFunction(v2x, v2y, dX1, dY1, startX, startY);
            w2 = edgeFunction(v0x, v0y, dX2, dY2, startX, startY);

            // gives back area * 2 but w0, w1, w2 is also * 2 so it will cancel out
            triArea = edgeFunction(
                v0x, v0y,
                dX2,
                dY2,
                v2x, v2y);

            // if triangle's are is 0 or smaller it is not a real triangle
            if (triArea > 0)
            {
                // precalculate inverse of triangle's area
                invTriArea = 1.0f / (float)triArea;

                // E(x+ 1,y) = E(x,y) + dY
                // dY Q21.10 so * FIX_ONE dY becomes Q42.20
                int64_t stepRightOnePixel0 = (int64_t)dY0 * FIX_ONE;
                int64_t stepRightOnePixel1 = (int64_t)dY1 * FIX_ONE;
                int64_t stepRightOnePixel2 = (int64_t)dY2 * FIX_ONE;

                // E(x,y+ 1) = E(x,y) −dX
                // dX Q21.10 so * FIX_ONE dX becomes Q42.20
                int64_t stepDownOnePixel0 = (int64_t)(-dX0) * FIX_ONE;
                int64_t stepDownOnePixel1 = (int64_t)(-dX1) * FIX_ONE;
                int64_t stepDownOnePixel2 = (int64_t)(-dX2) * FIX_ONE;

                // step right by the subpixel's width
                // step one pixel * small pixel width
                // Q42.20 * Q21.10 would be Q32.30 so we have to >> FIX_BITS
                int64_t stepRightOneSubPixel0 = (stepRightOnePixel0 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepRightOneSubPixel1 = (stepRightOnePixel1 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepRightOneSubPixel2 = (stepRightOnePixel2 * sqrAntialiasRec) >> FIX_BITS;

                // step down by the subpixel's height
                // step one pixel * small pixel height
                // Q42.20 * Q21.10 would be Q32.30 so we have to >> FIX_BITS
                int64_t stepDownOneSubPixel0 = (stepDownOnePixel0 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepDownOneSubPixel1 = (stepDownOnePixel1 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepDownOneSubPixel2 = (stepDownOnePixel2 * sqrAntialiasRec) >> FIX_BITS;

                int64_t w0Row = w0;
                int64_t w1Row = w1;
                int64_t w2Row = w2;
                for (int y = bbminy; y <= bbmaxy; y++)
                {
                    int64_t w0Col = w0Row;
                    int64_t w1Col = w1Row;
                    int64_t w2Col = w2Row;

                    for (int x = bbminx; x <= bbmaxx; x++)
                    {
                        int64_t w0SubRow = w0Col;
                        int64_t w1SubRow = w1Col;
                        int64_t w2SubRow = w2Col;

                        for (int ya = 0; ya < sqrAntialias; ya++)
                        {
                            int64_t w0Sub = w0SubRow;
                            int64_t w1Sub = w1SubRow;
                            int64_t w2Sub = w2SubRow;
                            for (int xa = 0; xa < sqrAntialias; xa++)
                            {
                                // the sign bit is one if the number is negative
                                // if all three number is positive all of their sign bit is zero so in an OR operator the result's sign bit is also 0 and positive
                                // if any of  the number is negative (their sign bit is 1) then the result's sign bit will also be 1 and will be negative
                                if ((w0Sub | w1Sub | w2Sub) >= 0)
                                {
                                    // barycentric coordinates
                                    float lambda0 = (float)w0Sub * invTriArea;
                                    float lambda1 = (float)w1Sub * invTriArea;
                                    float lambda2 = (float)w2Sub * invTriArea;
                                    // hyperbolic interpolation for z-coordinate
                                    zDepth = 1.0f / (lambda0 * z0Rec + lambda1 * z1Rec + lambda2 * z2Rec);
                                    bufferIndex = (y * imageWidth + x) * antialias + ya * sqrAntialias + xa;
                                    if (zDepth < zBuffer[bufferIndex])
                                    {
                                        zBuffer[bufferIndex] = zDepth;
                                        imageIndex = bufferIndex * 3;
                                        // perspective correct interpolation
                                        normalInterpolated[0] = (lambda0 * normals[indexek[i] * 3] * z0Rec + lambda1 * normals[indexek[i + 1] * 3] * z1Rec + lambda2 * normals[indexek[i + 2] * 3] * z2Rec) * zDepth;
                                        normalInterpolated[1] = (lambda0 * normals[indexek[i] * 3 + 1] * z0Rec + lambda1 * normals[indexek[i + 1] * 3 + 1] * z1Rec + lambda2 * normals[indexek[i + 2] * 3 + 1] * z2Rec) * zDepth;
                                        normalInterpolated[2] = (lambda0 * normals[indexek[i] * 3 + 2] * z0Rec + lambda1 * normals[indexek[i + 1] * 3 + 2] * z1Rec + lambda2 * normals[indexek[i + 2] * 3 + 2] * z2Rec) * zDepth;
                                        float normalLengthInv = 1.0f / std::sqrt(normalInterpolated[0] * normalInterpolated[0] + normalInterpolated[1] * normalInterpolated[1] + normalInterpolated[2] * normalInterpolated[2]);
                                        normalInterpolated[0] *= normalLengthInv;
                                        normalInterpolated[1] *= normalLengthInv;
                                        normalInterpolated[2] *= normalLengthInv;

                                        float dotProd = std::max(0.0f, dotProduct3D(normalInterpolated, lightVec));
                                        float lightCoefficentTriangle = lightCoefficient * dotProd;
                                        // float slopeness = normalInterpolated[1];

                                        // rPix = rDirt + (rGrass - rDirt) * slopeness;
                                        // gPix = gDirt + (gGrass - gDirt) * slopeness;
                                        // bPix = bDirt + (bGrass - bDirt) * slopeness;

                                        imageAntiBuffer[imageIndex] = rGround * lightCoefficentTriangle;
                                        imageAntiBuffer[imageIndex + 1] = gGround * lightCoefficentTriangle;
                                        imageAntiBuffer[imageIndex + 2] = bGround * lightCoefficentTriangle;
                                    }
                                }
                                // step one subpixel to the right
                                w0Sub += stepRightOneSubPixel0;
                                w1Sub += stepRightOneSubPixel1;
                                w2Sub += stepRightOneSubPixel2;
                            }
                            // step down one subpixel
                            w0SubRow += stepDownOneSubPixel0;
                            w1SubRow += stepDownOneSubPixel1;
                            w2SubRow += stepDownOneSubPixel2;
                        }
                        // step one pixel to the right
                        w0Col += stepRightOnePixel0;
                        w1Col += stepRightOnePixel1;
                        w2Col += stepRightOnePixel2;
                    }
                    // step down one pixel
                    w0Row += stepDownOnePixel0;
                    w1Row += stepDownOnePixel1;
                    w2Row += stepDownOnePixel2;
                }
            }
        }
    }
    free(lightVec);
    free(normal);
    free(normalInterpolated);
    free(upVec);
    float r, g, b;
    int altalanosIndex, imageAntiIndex, subImageIndex, imageBufferIndex;
    float antiRec = 1.0f / antialias;
    for (int y = 0; y < imageHeight; y++)
    {
        for (int x = 0; x < imageWidth; x++)
        {
            altalanosIndex = (y * imageWidth + x);
            imageAntiIndex = altalanosIndex * antialias;
            imageBufferIndex = altalanosIndex * 4;
            r = 0.0f;
            g = 0.0f;
            b = 0.0f;
            for (int k = 0; k < antialias; k++)
            {
                subImageIndex = (imageAntiIndex + k) * 3;
                r += imageAntiBuffer[subImageIndex];
                g += imageAntiBuffer[subImageIndex + 1];
                b += imageAntiBuffer[subImageIndex + 2];
            }
            imageBuffer[imageBufferIndex] = static_cast<uint8_t>(
                std::round(
                    std::clamp(r * antiRec, 0.0f, 255.0f)));
            imageBuffer[imageBufferIndex + 1] = static_cast<uint8_t>(
                std::round(
                    std::clamp(g * antiRec, 0.0f, 255.0f)));
            imageBuffer[imageBufferIndex + 2] = static_cast<uint8_t>(
                std::round(
                    std::clamp(b * antiRec, 0.0f, 255.0f)));
            imageBuffer[imageBufferIndex + 3] = 255;
        }
    }
    return (int)imageBuffer;
}

int renderGouraud()
{
    if (!(isSquareNumber(antialias) && (1 <= antialias && antialias <= 16)))
    {
        throw "Wrong antialias. Must be square number and between 1 and 16!";
    }
    std::fill(zBuffer, zBuffer + zBufferMeret, 1.0f);
    std::fill(imageAntiBuffer, imageAntiBuffer + imageAntiBufferLength, 0.0f);
    std::fill(imageBuffer, imageBuffer + imageBufferLength, 0);
    std::fill(projectedTriangles, projectedTriangles + 100, 0);
    // subpixels width and height
    int sqrAntialias = (int)sqrt(antialias);
    // one subpixel's width and height
    int32_t sqrAntialiasRec = Float2Fix(1.0f / sqrAntialias);
    // half of one subpixel's width and height
    // >> 1 = / 2
    int32_t inc = sqrAntialiasRec >> 1;
    // bounding box
    float htminx, htmaxx, htminy, htmaxy;
    // used for the edge function
    int32_t dX0, dY0, dX1, dY1, dX2, dY2;
    // edge function results
    int64_t w0, w1, w2;
    // reciprocal of the z values
    float z0Rec, z1Rec, z2Rec;
    // triangle's area
    int64_t triArea;
    // triangle's area's reciprocal
    float invTriArea;
    // used for the z-buffer
    float zDepth;
    // indexes
    int bufferIndex, imageIndex;
    // normal of the current triangle
    float *normal = (float *)malloc(3 * sizeof(float));
    // light vector
    float *lightVec = (float *)malloc(3 * sizeof(float));
    float rPix, gPix, bPix;
    lightVec[0] = -lightDir[0];
    lightVec[1] = -lightDir[1];
    lightVec[2] = -lightDir[2];
    // up vector
    float *upVec = (float *)malloc(3 * sizeof(float));
    upVec[0] = 0.0f;
    upVec[1] = 1.0f;
    upVec[2] = 0.0f;
    mainCamera.updateViewMatrix();
    for (int i = 0; i < indexekMeret; i += 3)
    {
        pontokVetitese(indexek[i], indexek[i + 1], indexek[i + 2], normal);
        for (int j = 0; j < projectedTrianglesMeret; j += 9)
        {
            // Calculate bounding box
            htminx = imageWidth;
            htmaxx = -imageWidth;
            htminy = imageHeight;
            htmaxy = -imageHeight;
            for (int k = 0; k < 9; k += 3)
            {
                if (projectedTriangles[j + k] < htminx)
                {
                    htminx = projectedTriangles[j + k];
                }
                if (projectedTriangles[j + k] > htmaxx)
                {
                    htmaxx = projectedTriangles[j + k];
                }
                if (projectedTriangles[j + k + 1] < htminy)
                {
                    htminy = projectedTriangles[j + k + 1];
                }
                if (projectedTriangles[j + k + 1] > htmaxy)
                {
                    htmaxy = projectedTriangles[j + k + 1];
                }
            }
            int bbminx = std::max(0, std::min(imageWidth - 1, (int)std::floor(htminx)));
            int bbminy = std::max(0, std::min(imageHeight - 1, (int)std::floor(htminy)));
            int bbmaxx = std::max(0, std::min(imageWidth - 1, (int)std::ceil(htmaxx)));
            int bbmaxy = std::max(0, std::min(imageHeight - 1, (int)std::ceil(htmaxy)));

            // Convert triangle vertices to fixed point integer
            int32_t v0x = Float2Fix(projectedTriangles[j]);
            int32_t v0y = Float2Fix(projectedTriangles[j + 1]);
            int32_t v0z = Float2Fix(projectedTriangles[j + 2]);
            int32_t v1x = Float2Fix(projectedTriangles[j + 3]);
            int32_t v1y = Float2Fix(projectedTriangles[j + 4]);
            int32_t v1z = Float2Fix(projectedTriangles[j + 5]);
            int32_t v2x = Float2Fix(projectedTriangles[j + 6]);
            int32_t v2y = Float2Fix(projectedTriangles[j + 7]);
            int32_t v2z = Float2Fix(projectedTriangles[j + 8]);

            // precalculate the reciprocal
            z0Rec = 1.0f / projectedTriangles[j + 2];
            z1Rec = 1.0f / projectedTriangles[j + 5];
            z2Rec = 1.0f / projectedTriangles[j + 8];

            // calculate parameters of edge function
            dX0 = v2x - v1x;
            dY0 = v2y - v1y;

            dX1 = v0x - v2x;
            dY1 = v0y - v2y;

            dX2 = v1x - v0x;
            dY2 = v1y - v0y;

            // first pixel's center
            int32_t startX = Int2Fix(bbminx) + inc;
            int32_t startY = Int2Fix(bbminy) + inc;

            // Edge functions
            w0 = edgeFunction(v1x, v1y, dX0, dY0, startX, startY);
            w1 = edgeFunction(v2x, v2y, dX1, dY1, startX, startY);
            w2 = edgeFunction(v0x, v0y, dX2, dY2, startX, startY);

            // gives back area * 2 but w0, w1, w2 is also * 2 so it will cancel out
            triArea = edgeFunction(
                v0x, v0y,
                dX2,
                dY2,
                v2x, v2y);

            // if triangle's are is 0 or smaller it is not a real triangle
            if (triArea > 0)
            {
                // precalculate inverse of triangle's area
                invTriArea = 1.0f / (float)triArea;

                // E(x+ 1,y) = E(x,y) + dY
                // dY Q21.10 so * FIX_ONE dY becomes Q42.20
                int64_t stepRightOnePixel0 = (int64_t)dY0 * FIX_ONE;
                int64_t stepRightOnePixel1 = (int64_t)dY1 * FIX_ONE;
                int64_t stepRightOnePixel2 = (int64_t)dY2 * FIX_ONE;

                // E(x,y+ 1) = E(x,y) −dX
                // dX Q21.10 so * FIX_ONE dX becomes Q42.20
                int64_t stepDownOnePixel0 = (int64_t)(-dX0) * FIX_ONE;
                int64_t stepDownOnePixel1 = (int64_t)(-dX1) * FIX_ONE;
                int64_t stepDownOnePixel2 = (int64_t)(-dX2) * FIX_ONE;

                // step right by the subpixel's width
                // step one pixel * small pixel width
                // Q42.20 * Q21.10 would be Q32.30 so we have to >> FIX_BITS
                int64_t stepRightOneSubPixel0 = (stepRightOnePixel0 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepRightOneSubPixel1 = (stepRightOnePixel1 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepRightOneSubPixel2 = (stepRightOnePixel2 * sqrAntialiasRec) >> FIX_BITS;

                // step down by the subpixel's height
                // step one pixel * small pixel height
                // Q42.20 * Q21.10 would be Q32.30 so we have to >> FIX_BITS
                int64_t stepDownOneSubPixel0 = (stepDownOnePixel0 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepDownOneSubPixel1 = (stepDownOnePixel1 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepDownOneSubPixel2 = (stepDownOnePixel2 * sqrAntialiasRec) >> FIX_BITS;

                int64_t w0Row = w0;
                int64_t w1Row = w1;
                int64_t w2Row = w2;

                float lambda0 = (float)w0 * invTriArea;
                float lambda1 = (float)w1 * invTriArea;
                float lambda2 = (float)w2 * invTriArea;

                float dotProd = std::max(0.0f, dotProduct3D(&normals[indexek[i] * 3], lightVec));
                float lightCoefficentTriangle0 = lightCoefficient * dotProd;
                dotProd = std::max(0.0f, dotProduct3D(&normals[indexek[i + 1] * 3], lightVec));
                float lightCoefficentTriangle1 = lightCoefficient * dotProd;
                dotProd = std::max(0.0f, dotProduct3D(&normals[indexek[i + 2] * 3], lightVec));
                float lightCoefficentTriangle2 = lightCoefficient * dotProd;
                // float slopeness = normalInterpolated[1];

                // rPix = rDirt + (rGrass - rDirt) * slopeness;
                // gPix = gDirt + (gGrass - gDirt) * slopeness;
                // bPix = bDirt + (bGrass - bDirt) * slopeness;
                float r0 = rGround * lightCoefficentTriangle0;
                float b0 = bGround * lightCoefficentTriangle0;
                float g0 = gGround * lightCoefficentTriangle0;

                float r1 = rGround * lightCoefficentTriangle1;
                float b1 = bGround * lightCoefficentTriangle1;
                float g1 = gGround * lightCoefficentTriangle1;

                float r2 = rGround * lightCoefficentTriangle2;
                float b2 = bGround * lightCoefficentTriangle2;
                float g2 = gGround * lightCoefficentTriangle2;

                for (int y = bbminy; y <= bbmaxy; y++)
                {
                    int64_t w0Col = w0Row;
                    int64_t w1Col = w1Row;
                    int64_t w2Col = w2Row;

                    for (int x = bbminx; x <= bbmaxx; x++)
                    {
                        int64_t w0SubRow = w0Col;
                        int64_t w1SubRow = w1Col;
                        int64_t w2SubRow = w2Col;

                        for (int ya = 0; ya < sqrAntialias; ya++)
                        {
                            int64_t w0Sub = w0SubRow;
                            int64_t w1Sub = w1SubRow;
                            int64_t w2Sub = w2SubRow;
                            for (int xa = 0; xa < sqrAntialias; xa++)
                            {
                                // the sign bit is one if the number is negative
                                // if all three number is positive all of their sign bit is zero so in an OR operator the result's sign bit is also 0 and positive
                                // if any of  the number is negative (their sign bit is 1) then the result's sign bit will also be 1 and will be negative
                                if ((w0Sub | w1Sub | w2Sub) >= 0)
                                {
                                    // barycentric coordinates
                                    lambda0 = (float)w0Sub * invTriArea;
                                    lambda1 = (float)w1Sub * invTriArea;
                                    lambda2 = (float)w2Sub * invTriArea;
                                    // hyperbolic interpolation for z-coordinate
                                    zDepth = 1.0f / (lambda0 * z0Rec + lambda1 * z1Rec + lambda2 * z2Rec);
                                    bufferIndex = (y * imageWidth + x) * antialias + ya * sqrAntialias + xa;
                                    if (zDepth < zBuffer[bufferIndex])
                                    {
                                        zBuffer[bufferIndex] = zDepth;
                                        imageIndex = bufferIndex * 3;
                                        // perspective correct interpolation
                                        imageAntiBuffer[imageIndex] = (lambda0 * r0 * z0Rec + lambda1 * r1 * z1Rec + lambda2 * r2 * z2Rec) * zDepth;
                                        imageAntiBuffer[imageIndex + 1] = (lambda0 * g0 * z0Rec + lambda1 * g1 * z1Rec + lambda2 * g2 * z2Rec) * zDepth;
                                        imageAntiBuffer[imageIndex + 2] = (lambda0 * b0 * z0Rec + lambda1 * b1 * z1Rec + lambda2 * b2 * z2Rec) * zDepth;
                                    }
                                }
                                // step one subpixel to the right
                                w0Sub += stepRightOneSubPixel0;
                                w1Sub += stepRightOneSubPixel1;
                                w2Sub += stepRightOneSubPixel2;
                            }
                            // step down one subpixel
                            w0SubRow += stepDownOneSubPixel0;
                            w1SubRow += stepDownOneSubPixel1;
                            w2SubRow += stepDownOneSubPixel2;
                        }
                        // step one pixel to the right
                        w0Col += stepRightOnePixel0;
                        w1Col += stepRightOnePixel1;
                        w2Col += stepRightOnePixel2;
                    }
                    // step down one pixel
                    w0Row += stepDownOnePixel0;
                    w1Row += stepDownOnePixel1;
                    w2Row += stepDownOnePixel2;
                }
            }
        }
    }
    free(lightVec);
    free(normal);
    free(upVec);
    float r, g, b;
    int altalanosIndex, imageAntiIndex, subImageIndex, imageBufferIndex;
    float antiRec = 1.0f / antialias;
    for (int y = 0; y < imageHeight; y++)
    {
        for (int x = 0; x < imageWidth; x++)
        {
            altalanosIndex = (y * imageWidth + x);
            imageAntiIndex = altalanosIndex * antialias;
            imageBufferIndex = altalanosIndex * 4;
            r = 0.0f;
            g = 0.0f;
            b = 0.0f;
            for (int k = 0; k < antialias; k++)
            {
                subImageIndex = (imageAntiIndex + k) * 3;
                r += imageAntiBuffer[subImageIndex];
                g += imageAntiBuffer[subImageIndex + 1];
                b += imageAntiBuffer[subImageIndex + 2];
            }
            imageBuffer[imageBufferIndex] = static_cast<uint8_t>(
                std::round(
                    std::clamp(r * antiRec, 0.0f, 255.0f)));
            imageBuffer[imageBufferIndex + 1] = static_cast<uint8_t>(
                std::round(
                    std::clamp(g * antiRec, 0.0f, 255.0f)));
            imageBuffer[imageBufferIndex + 2] = static_cast<uint8_t>(
                std::round(
                    std::clamp(b * antiRec, 0.0f, 255.0f)));
            imageBuffer[imageBufferIndex + 3] = 255;
        }
    }
    return (int)imageBuffer;
}

int renderFlat()
{
    if (!(isSquareNumber(antialias) && (1 <= antialias && antialias <= 16)))
    {
        throw "Wrong antialias. Must be square number and between 1 and 16!";
    }
    std::fill(zBuffer, zBuffer + zBufferMeret, 1.0f);
    std::fill(imageAntiBuffer, imageAntiBuffer + imageAntiBufferLength, 0.0f);
    std::fill(imageBuffer, imageBuffer + imageBufferLength, 0);
    std::fill(projectedTriangles, projectedTriangles + 100, 0);
    // subpixels width and height
    int sqrAntialias = (int)sqrt(antialias);
    // one subpixel's width and height
    int32_t sqrAntialiasRec = Float2Fix(1.0f / sqrAntialias);
    // half of one subpixel's width and height
    // >> 1 = / 2
    int32_t inc = sqrAntialiasRec >> 1;
    // bounding box
    float htminx, htmaxx, htminy, htmaxy;
    // used for the edge function
    int32_t dX0, dY0, dX1, dY1, dX2, dY2;
    // edge function results
    int64_t w0, w1, w2;
    // reciprocal of the z values
    float z0Rec, z1Rec, z2Rec;
    // triangle's area
    int64_t triArea;
    // triangle's area's reciprocal
    float invTriArea;
    // used for the z-buffer
    float zDepth;
    // indexes
    int bufferIndex, imageIndex;
    // normal of the current triangle
    float *normal = (float *)malloc(3 * sizeof(float));
    // light vector
    float *lightVec = (float *)malloc(3 * sizeof(float));
    float rPix, gPix, bPix;
    lightVec[0] = -lightDir[0];
    lightVec[1] = -lightDir[1];
    lightVec[2] = -lightDir[2];
    // up vector
    float *upVec = (float *)malloc(3 * sizeof(float));
    upVec[0] = 0.0f;
    upVec[1] = 1.0f;
    upVec[2] = 0.0f;
    mainCamera.updateViewMatrix();
    for (int i = 0; i < indexekMeret; i += 3)
    {
        pontokVetitese(indexek[i], indexek[i + 1], indexek[i + 2], normal);
        for (int j = 0; j < projectedTrianglesMeret; j += 9)
        {
            // Calculate bounding box
            htminx = imageWidth;
            htmaxx = -imageWidth;
            htminy = imageHeight;
            htmaxy = -imageHeight;
            for (int k = 0; k < 9; k += 3)
            {
                if (projectedTriangles[j + k] < htminx)
                {
                    htminx = projectedTriangles[j + k];
                }
                if (projectedTriangles[j + k] > htmaxx)
                {
                    htmaxx = projectedTriangles[j + k];
                }
                if (projectedTriangles[j + k + 1] < htminy)
                {
                    htminy = projectedTriangles[j + k + 1];
                }
                if (projectedTriangles[j + k + 1] > htmaxy)
                {
                    htmaxy = projectedTriangles[j + k + 1];
                }
            }
            int bbminx = std::max(0, std::min(imageWidth - 1, (int)std::floor(htminx)));
            int bbminy = std::max(0, std::min(imageHeight - 1, (int)std::floor(htminy)));
            int bbmaxx = std::max(0, std::min(imageWidth - 1, (int)std::ceil(htmaxx)));
            int bbmaxy = std::max(0, std::min(imageHeight - 1, (int)std::ceil(htmaxy)));

            // Convert triangle vertices to fixed point integer
            int32_t v0x = Float2Fix(projectedTriangles[j]);
            int32_t v0y = Float2Fix(projectedTriangles[j + 1]);
            int32_t v0z = Float2Fix(projectedTriangles[j + 2]);
            int32_t v1x = Float2Fix(projectedTriangles[j + 3]);
            int32_t v1y = Float2Fix(projectedTriangles[j + 4]);
            int32_t v1z = Float2Fix(projectedTriangles[j + 5]);
            int32_t v2x = Float2Fix(projectedTriangles[j + 6]);
            int32_t v2y = Float2Fix(projectedTriangles[j + 7]);
            int32_t v2z = Float2Fix(projectedTriangles[j + 8]);

            // precalculate the reciprocal
            z0Rec = 1.0f / projectedTriangles[j + 2];
            z1Rec = 1.0f / projectedTriangles[j + 5];
            z2Rec = 1.0f / projectedTriangles[j + 8];

            // precalculate the lighting
            float dotProd = std::max(0.0f, dotProduct3D(normal, lightVec));
            float lightCoefficentTriangle = lightCoefficient * dotProd;
            float r = rGround * lightCoefficentTriangle;
            float g = gGround * lightCoefficentTriangle;
            float b = bGround * lightCoefficentTriangle;

            // calculate parameters of edge function
            dX0 = v2x - v1x;
            dY0 = v2y - v1y;

            dX1 = v0x - v2x;
            dY1 = v0y - v2y;

            dX2 = v1x - v0x;
            dY2 = v1y - v0y;

            // first pixel's center
            int32_t startX = Int2Fix(bbminx) + inc;
            int32_t startY = Int2Fix(bbminy) + inc;

            // Edge functions
            w0 = edgeFunction(v1x, v1y, dX0, dY0, startX, startY);
            w1 = edgeFunction(v2x, v2y, dX1, dY1, startX, startY);
            w2 = edgeFunction(v0x, v0y, dX2, dY2, startX, startY);

            // gives back area * 2 but w0, w1, w2 is also * 2 so it will cancel out
            triArea = edgeFunction(
                v0x, v0y,
                dX2,
                dY2,
                v2x, v2y);

            // if triangle's are is 0 or smaller it is not a real triangle
            if (triArea > 0)
            {
                // precalculate inverse of triangle's area
                invTriArea = 1.0f / (float)triArea;

                // E(x+ 1,y) = E(x,y) + dY
                // dY Q21.10 so * FIX_ONE dY becomes Q42.20
                int64_t stepRightOnePixel0 = (int64_t)dY0 * FIX_ONE;
                int64_t stepRightOnePixel1 = (int64_t)dY1 * FIX_ONE;
                int64_t stepRightOnePixel2 = (int64_t)dY2 * FIX_ONE;

                // E(x,y+ 1) = E(x,y) −dX
                // dX Q21.10 so * FIX_ONE dX becomes Q42.20
                int64_t stepDownOnePixel0 = (int64_t)(-dX0) * FIX_ONE;
                int64_t stepDownOnePixel1 = (int64_t)(-dX1) * FIX_ONE;
                int64_t stepDownOnePixel2 = (int64_t)(-dX2) * FIX_ONE;

                // step right by the subpixel's width
                // step one pixel * small pixel width
                // Q42.20 * Q21.10 would be Q32.30 so we have to >> FIX_BITS
                int64_t stepRightOneSubPixel0 = (stepRightOnePixel0 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepRightOneSubPixel1 = (stepRightOnePixel1 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepRightOneSubPixel2 = (stepRightOnePixel2 * sqrAntialiasRec) >> FIX_BITS;

                // step down by the subpixel's height
                // step one pixel * small pixel height
                // Q42.20 * Q21.10 would be Q32.30 so we have to >> FIX_BITS
                int64_t stepDownOneSubPixel0 = (stepDownOnePixel0 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepDownOneSubPixel1 = (stepDownOnePixel1 * sqrAntialiasRec) >> FIX_BITS;
                int64_t stepDownOneSubPixel2 = (stepDownOnePixel2 * sqrAntialiasRec) >> FIX_BITS;

                int64_t w0Row = w0;
                int64_t w1Row = w1;
                int64_t w2Row = w2;

                for (int y = bbminy; y <= bbmaxy; y++)
                {
                    int64_t w0Col = w0Row;
                    int64_t w1Col = w1Row;
                    int64_t w2Col = w2Row;

                    for (int x = bbminx; x <= bbmaxx; x++)
                    {
                        int64_t w0SubRow = w0Col;
                        int64_t w1SubRow = w1Col;
                        int64_t w2SubRow = w2Col;

                        for (int ya = 0; ya < sqrAntialias; ya++)
                        {
                            int64_t w0Sub = w0SubRow;
                            int64_t w1Sub = w1SubRow;
                            int64_t w2Sub = w2SubRow;
                            for (int xa = 0; xa < sqrAntialias; xa++)
                            {
                                // the sign bit is one if the number is negative
                                // if all three number is positive all of their sign bit is zero so in an OR operator the result's sign bit is also 0 and positive
                                // if any of  the number is negative (their sign bit is 1) then the result's sign bit will also be 1 and will be negative
                                if ((w0Sub | w1Sub | w2Sub) >= 0)
                                {
                                    // barycentric coordinates
                                    float lambda0 = (float)w0Sub * invTriArea;
                                    float lambda1 = (float)w1Sub * invTriArea;
                                    float lambda2 = (float)w2Sub * invTriArea;
                                    // hyperbolic interpolation for z-coordinate
                                    zDepth = 1.0f / (lambda0 * z0Rec + lambda1 * z1Rec + lambda2 * z2Rec);
                                    bufferIndex = (y * imageWidth + x) * antialias + ya * sqrAntialias + xa;
                                    if (zDepth < zBuffer[bufferIndex])
                                    {
                                        zBuffer[bufferIndex] = zDepth;
                                        imageIndex = bufferIndex * 3;
                                        imageAntiBuffer[imageIndex] = r;
                                        imageAntiBuffer[imageIndex + 1] = g;
                                        imageAntiBuffer[imageIndex + 2] = b;
                                    }
                                }
                                // step one subpixel to the right
                                w0Sub += stepRightOneSubPixel0;
                                w1Sub += stepRightOneSubPixel1;
                                w2Sub += stepRightOneSubPixel2;
                            }
                            // step down one subpixel
                            w0SubRow += stepDownOneSubPixel0;
                            w1SubRow += stepDownOneSubPixel1;
                            w2SubRow += stepDownOneSubPixel2;
                        }
                        // step one pixel to the right
                        w0Col += stepRightOnePixel0;
                        w1Col += stepRightOnePixel1;
                        w2Col += stepRightOnePixel2;
                    }
                    // step down one pixel
                    w0Row += stepDownOnePixel0;
                    w1Row += stepDownOnePixel1;
                    w2Row += stepDownOnePixel2;
                }
            }
        }
    }
    free(lightVec);
    free(normal);
    free(upVec);
    float r, g, b;
    int altalanosIndex, imageAntiIndex, subImageIndex, imageBufferIndex;
    float antiRec = 1.0f / antialias;
    for (int y = 0; y < imageHeight; y++)
    {
        for (int x = 0; x < imageWidth; x++)
        {
            altalanosIndex = (y * imageWidth + x);
            imageAntiIndex = altalanosIndex * antialias;
            imageBufferIndex = altalanosIndex * 4;
            r = 0.0f;
            g = 0.0f;
            b = 0.0f;
            for (int k = 0; k < antialias; k++)
            {
                subImageIndex = (imageAntiIndex + k) * 3;
                r += imageAntiBuffer[subImageIndex];
                g += imageAntiBuffer[subImageIndex + 1];
                b += imageAntiBuffer[subImageIndex + 2];
            }
            imageBuffer[imageBufferIndex] = static_cast<uint8_t>(
                std::round(
                    std::clamp(r * antiRec, 0.0f, 255.0f)));
            imageBuffer[imageBufferIndex + 1] = static_cast<uint8_t>(
                std::round(
                    std::clamp(g * antiRec, 0.0f, 255.0f)));
            imageBuffer[imageBufferIndex + 2] = static_cast<uint8_t>(
                std::round(
                    std::clamp(b * antiRec, 0.0f, 255.0f)));
            imageBuffer[imageBufferIndex + 3] = 255;
        }
    }
    return (int)imageBuffer;
}

int render()
{
    calcNewLocationCamera(cameraLocation);
    switch (currShadingMode)
    {
    case (SHADINGMODE::PHONG):
        return renderPhong();
        break;
    case (SHADINGMODE::GOURAUD):
        return renderGouraud();
        break;
    case (SHADINGMODE::FLAT):
        return renderFlat();
        break;
    default:
        return renderPhong();
        break;
    }
}

int imageBufferSize()
{
    return imageBufferLength;
}

void setFrustum(float focal, float filmW, float filmH, int imageW, int imageH, float n, float f)
{
    imageWidth = imageW;
    imageHeight = imageH;
    if (imageBuffer)
    {
        free(imageBuffer);
    }
    imageBufferLength = imageWidth * imageHeight * 4;
    imageBuffer = (uint8_t *)malloc(imageBufferLength * sizeof(uint8_t *));

    if (imageAntiBuffer)
    {
        free(imageAntiBuffer);
    }
    imageAntiBufferLength = imageWidth * imageHeight * antialias * 3;
    imageAntiBuffer = (float *)malloc(imageAntiBufferLength * sizeof(float));
    if (zBuffer)
    {
        free(zBuffer);
    }
    zBufferMeret = imageWidth * imageHeight * antialias;
    zBuffer = (float *)malloc(zBufferMeret * sizeof(float));
    mainCamera.setPerspective(focal, filmW, filmH, imageW, imageH, n, f);
}

void meretBeallit(int meretKert)
{
    meret = meretKert;
}

int allocatePontok(int szamokSzama)
{
    // ha létezik felszabadítjuk
    if (pontok)
    {
        free(pontok);
    }

    // Memória lefoglalása a listának
    pontok = (float *)malloc(szamokSzama * sizeof(float));
    if (pontok)
    {
        pontokMeret = szamokSzama;
        return (int)pontok;
    }
    return 0;
}

void setAntialias(int anti)
{
    antialias = anti;
    if (imageAntiBuffer)
    {
        free(imageAntiBuffer);
    }
    imageAntiBufferLength = imageWidth * imageHeight * antialias * 3;
    imageAntiBuffer = (float *)malloc(imageAntiBufferLength * sizeof(float));
    if (zBuffer)
    {
        free(zBuffer);
    }
    zBufferMeret = imageWidth * imageHeight * antialias;
    zBuffer = (float *)malloc(zBufferMeret * sizeof(float));
}

int allocateIndexek(int indexekSzam)
{
    // ha létezik felszabadítjuk
    if (indexek)
    {
        free(indexek);
    }

    // Memória lefoglalása a listának
    indexek = (int32_t *)malloc(indexekSzam * sizeof(int32_t));
    if (indexek)
    {
        indexekMeret = 0;
        return (int)indexek;
    }
    return 0;
}

int allocatePerlin(int perlinek)
{
    // ha létezik felszabadítjuk
    if (perlin)
    {
        free(perlin);
    }

    // Memória lefoglalása a listának
    perlin = (float *)calloc(perlinek, sizeof(float));
    if (perlin)
    {
        perlinMeret = perlinek;
        return (int)perlin;
    }
    return 0;
}

int allocateNormals(int sizeNorm)
{
    // ha létezik felszabadítjuk
    if (normals)
    {
        free(normals);
    }

    // Memória lefoglalása a listának
    normals = (float *)calloc(sizeNorm, sizeof(float));
    if (normals)
    {
        normalsSize = sizeNorm;
        return (int)normals;
    }
    return 0;
}

void pontokKiszamolasa()
{
    int i;
    for (int y = 0; y < meret; y++)
    {
        for (int x = 0; x < meret; x++)
        {
            i = (y * meret + x);
            pontok[i * 3] = x;
            pontok[i * 3 + 1] = perlin[i];
            pontok[i * 3 + 2] = -y;
        }
    }
}

void osszekotesekKiszamolasa()
{
    int i;
    for (int y = 0; y < meret - 1; y++)
    {
        for (int x = 0; x < meret - 1; x++)
        {
            i = y * meret + x;
            // A három indexnek a pontjait (pontok[index] pontot ad meg) összekötjük háromszögekre
            // A négyzet
            indexek[indexekMeret++] = i + 1;     // jobb felső pontja
            indexek[indexekMeret++] = i + meret; // bal alsó pontja
            indexek[indexekMeret++] = i;         // bal felső pontja

            indexek[indexekMeret++] = i + 1;         // jobb felső pontja
            indexek[indexekMeret++] = i + meret + 1; // jobb alsó pontja
            indexek[indexekMeret++] = i + meret;     // bal alsó pontja
            // a négyzetet felosztottuk két háromszögre
        }
    }
}

EM_JS(void, renderJs, (int elsimitas), {
    render("canvas", elsimitas);
});

void newPerlinMap(int seed, float frequency, float lacunarity, float persistence, int octaves, float heightMultiplier)
{
    ::frequency = frequency;
    ::seed = seed;
    ::lacunarity = lacunarity;
    ::persistence = persistence;
    ::octaves = octaves;
    ::heightMultiplier = heightMultiplier;
    allocatePerlin(meret * meret);
    allocateNormals(meret * meret * 3);
    switch (currNormalCalcMode)
    {
    case (NORMALCALCMODE::ANALYTICAL):
        generatePerlinNoiseAnalytical(perlin, normals, frequency, meret, seed, 2, octaves, lacunarity, persistence, 0.0f, heightMultiplier);
        break;
    case (NORMALCALCMODE::FINITEDIFFERENCE):
        generatePerlinNoiseFiniteDifference(perlin, normals, frequency, meret, seed, 2, octaves, lacunarity, persistence, 0.0f, heightMultiplier);
        break;
    default:
        generatePerlinNoiseAnalytical(perlin, normals, frequency, meret, seed, 2, octaves, lacunarity, persistence, 0.0f, heightMultiplier);
        break;
    }
    allocatePontok(meret * meret * 3);
    pontokKiszamolasa();
    allocateIndexek((meret - 1) * (meret - 1) * 6);
    osszekotesekKiszamolasa();
    renderJs(antialias);
}

void newLightIntensity(float intensity)
{
    lightIntensity = intensity;
    lightCoefficient = INV_PI * lightIntensity;
    renderJs(antialias);
}

void newCameraHeight(float height)
{
    kameraMagassag = height;
    renderJs(antialias);
}

void newLightDirection(float x, float y)
{
    lightDir[0] = x;
    lightDir[1] = y;
    renderJs(antialias);
}

void newGroundType(int type)
{

    // grass color
    // 65 -> (65/255)^2.2=0.04943 albedo
    // 152 -> (152/255)^2.2=0.32038 albedo
    // 10 -> (10/255)^2.2=0.000804 albedo
    // sun color
    // 255.0 normalize -> 255.0f/255.0 = 1.0
    // 223.0 normalize -> 223.0f/255.0 = 0.8745
    // 34.0 normalize -> 34.0f/255.0 = 0.13333
    // final product
    // 0.04943 * 1.0 = 0.04943
    // 0.32038 * 0.8745 = 0.28017
    // 0.000804 * 0.13333 = 0.00053332

    // dirt color
    // 155 -> (155/255)^2.2=0.33445
    // 118 -> (118/255)^2.2=0.1835489
    // 83  -> (83/255)^2.2=0.08464
    // precalculated with sun color
    // final product
    // 0.33445 * 1.0 = 0.33445
    // 0.1835489 * 0.8745 = 0.160513
    // 0.08464 * 0.13333 = 0.011285

    switch (type)
    {
    case 0:
        rGround = 0.04943f;
        gGround = 0.28017f;
        bGround = 0.00053332f;
        break;
    case 1:
        rGround = 0.33445f;
        gGround = 0.160513f;
        bGround = 0.011285f;
        break;
    default:
        rGround = 0.04943f;
        gGround = 0.28017f;
        bGround = 0.00053332f;
        break;
    }
    renderJs(antialias);
}

void setShadingTechnique(int shading)
{
    currShadingMode = static_cast<SHADINGMODE>(shading);
    renderJs(antialias);
}

void setNormalCalculationMode(int normalcalc)
{
    currNormalCalcMode = static_cast<NORMALCALCMODE>(normalcalc);
    newPerlinMap(seed, frequency, lacunarity, persistence, octaves, heightMultiplier);
}

void move(int z, int x)
{
    int newLocation = cameraLocation + z * meret + x;
    if (!((x == -1 && newLocation % meret == 255) || (x == 1 && newLocation % meret == 0) || (newLocation < 0) || (newLocation >= meret * meret)))
    {
        cameraLocation += z * meret + x;
        renderJs(antialias);
    }
}

int allocate4x4Matrix()
{
    float *matrix = (float *)calloc(16, sizeof(float));
    if (matrix)
    {
        return (int)matrix;
    }
    return 0;
}

void xyForog(float dPitch, float dYaw)
{
    mainCamera.rotate(dPitch, dYaw);
}

void setRotate(float pitch, float yaw)
{
    mainCamera.setRotation(pitch, yaw);
}

float getXForog()
{
    return mainCamera.getPitch();
}

float getYForog()
{
    return mainCamera.getYaw();
}

void init()
{
    p0 = (float *)calloc(4, sizeof(float));
    p1 = (float *)calloc(4, sizeof(float));
    p2 = (float *)calloc(4, sizeof(float));
    clipped = (float *)calloc(36, sizeof(float));
    bemenet = (float *)calloc(36, sizeof(float));
    sikok = (int *)calloc(18, sizeof(int));
    sikok[0] = 3;
    // sikok[1] = 0;
    sikok[2] = -1;
    // w + x * (-1) = w - x
    // right clipping plane

    sikok[3] = 3;
    // sikok[4] = 0;
    sikok[5] = 1;
    // w + x * (1) = w + x
    // left clipping plane

    sikok[6] = 3;
    sikok[7] = 1;
    sikok[8] = -1;
    // w + y * (-1) = w - y
    // top clipping plane

    sikok[9] = 3;
    sikok[10] = 1;
    sikok[11] = 1;
    // w + y * (1) = w + y
    // bottom clipping plane

    sikok[12] = 3;
    sikok[13] = 2;
    sikok[14] = -1;
    // w + z * (-1) = w - z
    // far clipping plane
    sikok[15] = 2;
    // sikok[16] = 0;
    // sikok[17] = 0;
    // z + x * (0) = z
    // near clipping plane
    cameraLocation = 0;
    antialias = 1;
    kameraMagassag = 3.8;
    heightMultiplier = 150.0f;
    lightDir = (float *)malloc(3 * sizeof(float));
    lightDir[0] = 0;
    lightDir[1] = -1;
    lightDir[2] = 0;
    lightIntensity = 1800.0f;
    lightCoefficient = INV_PI * lightIntensity;
    projectedTriangles = (float *)calloc(100, sizeof(float));
    rGround = 0.04943f;
    gGround = 0.28017f;
    bGround = 0.00053332f;
}

EMSCRIPTEN_BINDINGS(raw_pointers)
{
    emscripten::function("matrixSzorzas4x4", &matrixSzorzas4x4, emscripten::allow_raw_pointers());
}

EMSCRIPTEN_BINDINGS(my_module)
{
    emscripten::function("init", &init);
    emscripten::function("allocatePerlin", &allocatePerlin);
    emscripten::function("osszekotesekKiszamolasa", &osszekotesekKiszamolasa);
    emscripten::function("allocatePontok", &allocatePontok);
    emscripten::function("allocateIndexek", &allocateIndexek);
    emscripten::function("pontokKiszamolasa", &pontokKiszamolasa);
    emscripten::function("render", &render);
    emscripten::function("imageBufferSize", &imageBufferSize);
    emscripten::function("ujHely", &ujHely);
    emscripten::function("meretBeallit", &meretBeallit);
    emscripten::function("setFrustum", &setFrustum);
    emscripten::function("xyForog", &xyForog);
    emscripten::function("setRotate", &setRotate);
    emscripten::function("getXForog", &getXForog);
    emscripten::function("getYForog", &getYForog);
    emscripten::function("setAntialias", &setAntialias);
    emscripten::function("newCameraHeight", &newCameraHeight);
    emscripten::function("newPerlinMap", &newPerlinMap);
    emscripten::function("newLightIntensity", &newLightIntensity);
    emscripten::function("newLightDirection", &newLightDirection);
    emscripten::function("mozgas", &move);
    emscripten::function("newGroundType", &newGroundType);
    emscripten::function("setShadingTechnique", &setShadingTechnique);
    emscripten::function("setNormalCalculationMode", &setNormalCalculationMode);
}