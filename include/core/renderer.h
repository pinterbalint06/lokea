#ifndef RENDERER_H
#define RENDERER_H

#include "core/shader.h"
#include "utils/frameBuffer.h"
#include "core/vertex.h"
#include "utils/edgeFunction.h"

class Clipper;
class Scene;
class Camera;
class Mesh;

class Renderer
{
private:
    int imageWidth_, imageHeight_;
    int antialias_;
    // subpixels count
    int sqrAntialias_;
    // one subpixel's width and height
    int32_t sqrAntialiasRec_;
    // half of one subpixel's width and height
    // >> 1 = / 2
    int32_t inc_;
    Vertex *projectedTriangles_;
    int projectedTrianglesSize_;
    Shaders::SHADINGMODE currShadingMode_;
    Vertex p0_;
    Vertex p1_;
    Vertex p2_;
    float *normal_;
    Clipper *clipper_;
    FrameBuffer *frameBuffer_;
    Vertex *vertexCache_;
    int vertexCacheSize_;
    float rBuffer_, gBuffer_, bBuffer_;

    template <typename StructShader>
    void renderTemplate(const Scene *scene);

    void clipTriangle(const uint32_t &i0, const uint32_t &i1, const uint32_t &i2, Vertex *vertices);
    void projectVertices(const Mesh *mesh, const Camera *camera);

    template <typename StructShader, bool TrivialInside>
    __attribute__((always_inline)) inline void rasterizeTile(EdgeFunction::EdgeFunction ef, float invTriArea, float z0Rec, float z1Rec, float z2Rec, int tx, int ty, int xEnd, int yEnd, StructShader shader)
    {
        for (int y = ty; y <= yEnd; y++)
        {
            ef.backToRowStart();
            for (int x = tx; x <= xEnd; x++)
            {
                ef.backToColStart();
                for (int ya = 0; ya < sqrAntialias_; ya++)
                {
                    ef.backToSubRowStart();
                    for (int xa = 0; xa < sqrAntialias_; xa++)
                    {
                        if (TrivialInside || ef.isInside())
                        {
                            // barycentric coordinates
                            float lambda0 = (float)ef.w0Sub_ * invTriArea;
                            float lambda1 = (float)ef.w1Sub_ * invTriArea;
                            float lambda2 = (float)ef.w2Sub_ * invTriArea;
                            // hyperbolic interpolation for z-coordinate
                            float zDepth = lambda0 * z0Rec + lambda1 * z1Rec + lambda2 * z2Rec;
                            int bufferIndex = (y * imageWidth_ + x) * antialias_ + ya * sqrAntialias_ + xa;
                            float *zBuffer = frameBuffer_->getZBuffer();
                            if (zDepth > zBuffer[bufferIndex])
                            {
                                zBuffer[bufferIndex] = zDepth;

                                int pixelIndex = (y * imageWidth_ + x) * antialias_ * 3;
                                int antialiasIndex = ya * sqrAntialias_ + xa;

                                shader.shadePixel(lambda0, lambda1, lambda2, 1.0f / zDepth, &frameBuffer_->getAntialiasImageBuffer()[pixelIndex + antialiasIndex], antialias_);
                            }
                        }
                        // step one subpixel to the right
                        ef.oneSubColRight();
                    }
                    // step down one subpixel
                    ef.oneSubRowDown();
                }
                // step one pixel to the right
                ef.oneColRight();
            }
            // step down one pixel
            ef.oneRowDown();
        }
    }

public:
    Renderer();
    ~Renderer();

    uint8_t *getImageBuffer() const { return frameBuffer_->getImageBuffer(); };

    void setAntialias(int antialias);
    void setShadingMode(Shaders::SHADINGMODE shadingMode);
    void setDefaultColor(float r, float g, float b)
    {
        rBuffer_ = r;
        gBuffer_ = g;
        bBuffer_ = b;
    };

    void setImageDimensions(int imageW, int imageH);
    void render(const Scene *scene);
};

#endif